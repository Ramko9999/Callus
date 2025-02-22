import { ExerciseLevelEditor } from "@/components/popup/workout/common/exercise";
import { MetaEditor, NoteEditor } from "@/components/popup/workout/common/meta";
import { RootStackParamList } from "@/layout/types";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import { CompositeScreenProps } from "@react-navigation/native";
import {
  createStackNavigator,
  StackScreenProps,
  TransitionPresets,
} from "@react-navigation/stack";
import { Platform } from "react-native";
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
import { useState } from "react";
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
import { SetLevelEditor } from "@/components/popup/workout/common/set";
import { PerformantExerciseAdder } from "@/components/popup/workout/common/exercise/add";
import {
  WorkoutDeleteConfirmation,
  AdjustStartEndTime,
  RepeatWorkoutConfirmation,
} from "@/components/popup/workout/common/modals";
import { WorkoutApi } from "@/api/workout";
import { createWorkoutFromWorkout } from "@/util/workout";
import { useUserDetails } from "@/components/user-details";
import { InputsPadProvider } from "@/components/util/popup/inputs-pad/context";
import { ExercisesFilter } from "@/components/popup/exercises/filters";
import { ExerciseInsights } from "@/components/popup/exercises/insights";
import {
  AddExercisesTopActions,
  ExerciseInsightTopActions,
  ExercisesEditorTopActions,
  SetsEditorTopActions,
} from "./top-actions";
import { contentStyles } from "../../common/styles";
import { ModalWrapper } from "../../common";

type CompletedWorkoutStackParamList = {
  exercises: undefined;
  sets: { exerciseId: string };
  addExercises: undefined;
  exerciseInsight: { name: string };
};

const Stack = createStackNavigator<CompletedWorkoutStackParamList>();

type ExerciseEditorProps = CompositeScreenProps<
  StackScreenProps<CompletedWorkoutStackParamList, "exercises">,
  StackScreenProps<RootStackParamList>
>;

// todo: fix the lag in which it takes for the exercises to show up
function ExercisesEditor({ navigation }: ExerciseEditorProps) {
  const { workout, onSave } = useCompletedWorkout();
  const { isInWorkout, actions } = useWorkout();

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

  const onSelectExercise = ({ id }: Exercise) => {
    navigation.navigate("sets", { exerciseId: id });
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
        createWorkoutFromWorkout(workout, userDetails?.bodyweight as number)
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
          <ExerciseLevelEditor
            exercises={workout.exercises}
            onRemove={onRemoveExercise}
            onEdit={onSelectExercise}
            onReorder={onReorderExercises}
            getDescription={getHistoricalExerciseDescription}
          />
        </View>
      </ModalWrapper>
      <WorkoutDeleteConfirmation
        show={isTrashingWorkout}
        hide={() => setIsTrashingWorkout(false)}
        onDelete={() => {
          setIsTrashingWorkout(false);
          trash();
        }}
      />
      <AdjustStartEndTime
        show={isEditingTimes}
        hide={() => setIsEditingTimes(false)}
        startTime={workout.startedAt}
        endTime={workout.endedAt}
        updateEndTime={(endedAt) => onUpdateMeta({ endedAt })}
        updateStartTime={(startedAt) => onUpdateMeta({ startedAt })}
      />
      <RepeatWorkoutConfirmation
        show={isRepeating}
        hide={() => setIsRepeating(false)}
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
          <SetLevelEditor
            sets={exercise?.sets ?? []}
            difficultyType={
              exercise
                ? getDifficultyType(exercise.name)
                : DifficultyType.BODYWEIGHT
            }
            onRemove={onRemoveSet}
            onEdit={onUpdateSet}
            back={navigation.goBack}
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
          ...(Platform.OS === "android"
            ? TransitionPresets.SlideFromRightIOS
            : {}),
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
