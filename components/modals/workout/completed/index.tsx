import { MetaEditor, NoteEditor } from "@/components/popup/workout/common/meta";
import { RootStackParamList } from "@/layout/types";
import { CompositeScreenProps } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { useCompletedWorkout, CompletedWorkoutProvider } from "./context";
import {
  addExercise,
  duplicateLastSet,
  removeExercise,
  removeSet,
  updateExercise,
  updateSet,
  useWorkout,
} from "@/context/WorkoutContext";
import { useRef, useState } from "react";
import { useToast } from "react-native-toast-notifications";
import {
  DifficultyType,
  Exercise,
  ExerciseMeta,
  Set,
  Workout,
} from "@/interface";
import { View, Text } from "@/components/Themed";
import { getDifficultyType } from "@/api/exercise";
import { PerformantExerciseAdder } from "@/components/popup/workout/common/exercise/add";
import {
  WorkoutDeleteConfirmation,
  RepeatWorkoutConfirmation,
  EditStartEndTimes,
} from "@/components/sheets";
import { WorkoutApi } from "@/api/workout";
import { useUserDetails } from "@/components/user-details";
import { InputsPadProvider } from "@/components/util/popup/inputs-pad/context";
import { ExercisesFilter } from "@/components/popup/exercises/filters";
import { ExerciseInsights } from "@/components/popup/exercises/insights";
import { ExercisesEditorTopActions, SetsEditorTopActions } from "./top-actions";
import { contentStyles } from "../../common/styles";
import { ModalWrapper } from "../../common";
import {
  AddExercisesTopActions,
  ExerciseInsightTopActions,
} from "../../common/top-actions";
import { ExerciseEditor } from "../../common/exercise";
import { CompletedWorkoutExercise } from "../../common/exercise/item";
import { SetEditor } from "../../common/set";
import { CompletedWorkoutSet } from "../../common/set/item";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WorkoutActions } from "@/api/model/workout";
import BottomSheet from "@gorhom/bottom-sheet";

type CompletedWorkoutStackParamList = {
  exercises: undefined;
  sets: { exerciseId: string };
  addExercises: undefined;
  exerciseInsight: { name: string };
};

const Stack = createNativeStackNavigator<CompletedWorkoutStackParamList>();

type ExerciseEditorProps = CompositeScreenProps<
  StackScreenProps<CompletedWorkoutStackParamList, "exercises">,
  StackScreenProps<RootStackParamList>
>;

// todo: fix the lag in which it takes for the exercises to show up
function ExercisesEditor({ navigation }: ExerciseEditorProps) {
  const { workout, onSave } = useCompletedWorkout();
  const { isInWorkout, actions } = useWorkout();
  const adjustStartEndTimeSheetRef = useRef<BottomSheet>(null);
  const workoutDeleteConfirmationSheetRef = useRef<BottomSheet>(null);
  const repeatWorkoutConfirmationSheetRef = useRef<BottomSheet>(null);

  const { userDetails } = useUserDetails();

  const [isTrashingWorkout, setIsTrashingWorkout] = useState(false);
  const [isEditingTimes, setIsEditingTimes] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const toast = useToast();

  const onRemoveExercise = (exerciseId: string) => {
    onSave(removeExercise(exerciseId, workout));
  };

  const onReorderExercises = (exercises: Exercise[]) => {
    onSave({ ...workout, exercises });
  };

  const onUpdateMeta = (meta: Partial<Workout>) => {
    onSave({ ...workout, ...meta });
  };

  const onSelectExercise = (exerciseId: string) => {
    navigation.navigate("sets", { exerciseId });
  };

  const trash = () => {
    WorkoutApi.deleteWorkout(workout.id).then(navigation.goBack);
  };

  const repeat = () => {
    if (isInWorkout) {
      toast.show(
        "Please finish your current workout before trying to start another workout",
        { type: "danger" }
      );
    } else {
      actions.startWorkout(
        WorkoutActions.createFromWorkout(
          workout,
          userDetails?.bodyweight as number
        )
      );
      navigation.goBack();
    }
  };

  return (
    <>
      <ModalWrapper>
        <View style={contentStyles.container}>
          <ExercisesEditorTopActions
            onClose={navigation.goBack}
            onAdd={() => navigation.navigate("addExercises")}
            onTrash={() => setIsTrashingWorkout(true)}
            onRepeat={() => setIsRepeating(true)}
          />
          <MetaEditor
            workout={workout}
            onUpdateMeta={onUpdateMeta}
            onDateClick={() => setIsEditingTimes(true)}
          />
          <ExerciseEditor
            exercises={workout.exercises}
            onRemove={onRemoveExercise}
            onEdit={onSelectExercise}
            onReorder={(exercises) =>
              onReorderExercises(exercises as Exercise[])
            }
            renderExercise={(props) => <CompletedWorkoutExercise {...props} />}
          />
        </View>
      </ModalWrapper>
      <WorkoutDeleteConfirmation
        ref={workoutDeleteConfirmationSheetRef}
        show={isTrashingWorkout}
        hide={() => workoutDeleteConfirmationSheetRef.current?.close()}
        onHide={() => setIsTrashingWorkout(false)}
        onDelete={() => {
          setIsTrashingWorkout(false);
          trash();
        }}
      />
      <EditStartEndTimes
        ref={adjustStartEndTimeSheetRef}
        show={isEditingTimes}
        onHide={() => setIsEditingTimes(false)}
        startedAt={workout.startedAt}
        endedAt={workout.endedAt ?? null}
        onUpdate={(update) => onUpdateMeta(update)}
        hide={() => adjustStartEndTimeSheetRef.current?.close()}
      />
      <RepeatWorkoutConfirmation
        ref={repeatWorkoutConfirmationSheetRef}
        show={isRepeating}
        hide={() => repeatWorkoutConfirmationSheetRef.current?.close()}
        onHide={() => setIsRepeating(false)}
        onRepeat={() => {
          setIsRepeating(false);
          repeat();
        }}
      />
    </>
  );
}

type SetsEditorProps = CompositeScreenProps<
  StackScreenProps<CompletedWorkoutStackParamList, "sets">,
  StackScreenProps<RootStackParamList>
>;

function SetsEditor({ route, navigation }: SetsEditorProps) {
  const { workout, onSave } = useCompletedWorkout();

  const exerciseId = route.params.exerciseId;
  const exercise = workout.exercises.find(({ id }) => exerciseId === id);

  const onAddSet = () => {
    onSave(duplicateLastSet(exerciseId, workout));
  };

  const onRemoveSet = (setId: string) => {
    if (exercise?.sets.length === 1) {
      navigation.goBack();
    }
    onSave(removeSet(setId, workout));
  };

  const onUpdateSet = (setId: string, update: Partial<Set>) => {
    onSave(updateSet(setId, update, workout));
  };

  const onNote = (note?: string) => {
    onSave(updateExercise(exerciseId as string, { note }, workout));
  };

  return (
    <InputsPadProvider>
      <ModalWrapper>
        <View style={contentStyles.container}>
          <SetsEditorTopActions
            onAdd={onAddSet}
            onBack={navigation.goBack}
            onViewProgress={() => {
              if (exercise) {
                navigation.navigate("exerciseInsight", { name: exercise.name });
              }
            }}
          />
          <View style={{ paddingLeft: "3%" }}>
            <Text extraLarge>{exercise?.name ?? ""}</Text>
          </View>
          <NoteEditor note={exercise?.note ?? ""} onUpdateNote={onNote} />
          <SetEditor
            sets={exercise?.sets ?? []}
            difficultyType={
              exercise
                ? getDifficultyType(exercise.name)
                : DifficultyType.BODYWEIGHT
            }
            onRemove={onRemoveSet}
            onEdit={onUpdateSet}
            renderSet={(props) => <CompletedWorkoutSet {...props} />}
          />
        </View>
      </ModalWrapper>
    </InputsPadProvider>
  );
}

type AddExercisesProps = CompositeScreenProps<
  StackScreenProps<CompletedWorkoutStackParamList, "addExercises">,
  StackScreenProps<RootStackParamList>
>;

function AddExercises({ navigation }: AddExercisesProps) {
  const { workout, onSave } = useCompletedWorkout();
  const [isFiltering, setIsFiltering] = useState(false);
  const [muscleFilter, setMuscleFilter] = useState<string>();
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<string>();

  const onAddExercises = (metas: ExerciseMeta[]) => {
    let updatedWorkout = JSON.parse(JSON.stringify(workout));
    metas.forEach((meta) => {
      updatedWorkout = addExercise(meta, updatedWorkout);
    });
    onSave(updatedWorkout);
  };

  return (
    <>
      <ModalWrapper>
        <View style={contentStyles.container}>
          <AddExercisesTopActions
            onBack={navigation.goBack}
            onFilter={() => setIsFiltering(true)}
            hasFilters={
              muscleFilter != undefined || exerciseTypeFilter != undefined
            }
          />
          <PerformantExerciseAdder
            onClose={navigation.goBack}
            onAdd={onAddExercises}
            muscleFilter={muscleFilter}
            exerciseTypeFilter={exerciseTypeFilter}
          />
        </View>
        <ExercisesFilter
          show={isFiltering}
          hide={() => setIsFiltering(false)}
          muscleFilter={muscleFilter}
          exerciseTypeFilter={exerciseTypeFilter}
          onUpdateExerciseTypeFilter={setExerciseTypeFilter}
          onUpdateMuscleFilter={setMuscleFilter}
        />
      </ModalWrapper>
    </>
  );
}

type ExerciseInsightProps = CompositeScreenProps<
  StackScreenProps<CompletedWorkoutStackParamList, "exerciseInsight">,
  StackScreenProps<RootStackParamList>
>;

function ExerciseInsightOverview({ navigation, route }: ExerciseInsightProps) {
  return (
    <ModalWrapper>
      <View style={contentStyles.container}>
        <ExerciseInsightTopActions onBack={navigation.goBack} />
        <ExerciseInsights exerciseName={route.params.name} />
      </View>
    </ModalWrapper>
  );
}

type CompletedWorkoutModalProps = StackScreenProps<
  RootStackParamList,
  "completedWorkout"
>;

export function CompletedWorkoutModal({ route }: CompletedWorkoutModalProps) {
  return (
    <CompletedWorkoutProvider workoutId={route.params.id}>
      <Stack.Navigator
        initialRouteName="exercises"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="exercises" component={ExercisesEditor} />
        <Stack.Screen name="sets" component={SetsEditor} />
        <Stack.Screen name="addExercises" component={AddExercises} />
        <Stack.Screen
          name="exerciseInsight"
          component={ExerciseInsightOverview}
        />
      </Stack.Navigator>
    </CompletedWorkoutProvider>
  );
}
