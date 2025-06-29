import { RootStackParamList } from "@/layout/types";
import { StackScreenProps } from "@react-navigation/stack";
import { RoutineProvider, useRoutine } from "./context";
import { CompositeScreenProps, useNavigation } from "@react-navigation/native";
import { useUserDetails } from "@/components/user-details";
import { useWorkout } from "@/context/WorkoutContext";
import { useToast } from "react-native-toast-notifications";
import { ModalWrapper } from "../common";
import { contentStyles } from "../common/styles";
import { View, Text } from "@/components/Themed";
import { ExercisesEditorTopActions } from "./top-actions";
import { MetaEditor } from "@/components/popup/routine/common/meta";
import { WorkoutApi } from "@/api/workout";
import { WorkoutActions } from "@/api/model/workout";
import { DifficultyType, ExercisePlan, Routine } from "@/interface";
import { ExercisePlanActions, SetPlanActions } from "@/api/model/routine";
import {
  EditRestDuration,
  RoutineDeleteConfirmation,
  RoutineStartConfirmation,
  FilterExercises,
} from "@/components/sheets";
import { useCallback, useRef, useState } from "react";
import { SetsEditorTopActions } from "./top-actions";
import { getDifficultyType } from "@/api/exercise";
import { InputsPadProvider } from "@/components/util/popup/inputs-pad/context";
import { ExerciseAdder } from "@/components/popup/workout/common/exercise/add";
import { ExerciseInsights } from "@/components/popup/exercises/insights";
import {
  AddExercisesTopActions,
  ExerciseInsightTopActions,
} from "../common/top-actions";
import { ExerciseEditor } from "../common/exercise";
import { RoutineExercise } from "../common/exercise/item";
import { SetEditor } from "../common/set";
import { RoutineSet } from "../common/set/item";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomSheet from "@gorhom/bottom-sheet";
import React from "react";
import { Keyboard } from "react-native";

type RoutineStackParamList = {
  exercises: undefined;
  sets: { exerciseId: string };
  addExercises: undefined;
  exerciseInsight: { name: string };
};

const Stack = createNativeStackNavigator<RoutineStackParamList>();

type ExerciseEditorProps = CompositeScreenProps<
  StackScreenProps<RoutineStackParamList, "exercises">,
  StackScreenProps<RootStackParamList>
>;

// todo: fix the lag in which it takes for the exercises to show up
function ExercisesEditor({ navigation }: ExerciseEditorProps) {
  const rootNavigation = useNavigation();
  const { routine, onSave } = useRoutine();
  const { isInWorkout, actions } = useWorkout();

  const [isTrashing, setIsTrashing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const routineDeleteConfirmationSheetRef = useRef<BottomSheet>(null);
  const routineStartConfirmationSheetRef = useRef<BottomSheet>(null);

  const { userDetails } = useUserDetails();

  const toast = useToast();

  const onUpdateMeta = (update: Partial<Routine>) => {
     onSave({ ...routine, ...update });
  };

  const trash = () => {
    WorkoutApi.deleteRoutine(routine.id).then(() => navigation.goBack());
  };

  const start = () => {
    if (isInWorkout) {
      toast.show(
        "Please finish your current workout before trying to start another workout",
        { type: "danger" }
      );
    } else {
      actions.startWorkout(
        WorkoutActions.createFromRoutine(
          routine,
          userDetails?.bodyweight as number
        )
      );
      //@ts-ignore
      rootNavigation.replace("liveWorkout");
    }
  };

  return (
    <>
      <ModalWrapper>
        <View style={contentStyles.container}>
          <ExercisesEditorTopActions
            onClose={navigation.goBack}
            onAdd={() => navigation.navigate("addExercises" as never)}
            onTrash={() => setIsTrashing(true)}
            onStart={() => setIsStarting(true)}
          />
          <MetaEditor routine={routine} onUpdateMeta={onUpdateMeta} />
          <ExerciseEditor
            exercises={routine.plan}
            onRemove={(id) => onSave(ExercisePlanActions(routine).remove(id))}
            onEdit={(exerciseId) => navigation.navigate("sets", { exerciseId })}
            onReorder={(plan) => onUpdateMeta({ plan: plan as ExercisePlan[] })}
            renderExercise={(props) => <RoutineExercise {...props} />}
          />
        </View>
      </ModalWrapper>
      <RoutineDeleteConfirmation
        ref={routineDeleteConfirmationSheetRef}
        show={isTrashing}
        hide={() => routineDeleteConfirmationSheetRef.current?.close()}
        onHide={() => setIsTrashing(false)}
        onDelete={trash}
      />
      <RoutineStartConfirmation
        ref={routineStartConfirmationSheetRef}
        show={isStarting}
        hide={() => routineStartConfirmationSheetRef.current?.close()}
        onHide={() => setIsStarting(false)}
        onStart={start}
      />
    </>
  );
}

type SetsEditorProps = CompositeScreenProps<
  StackScreenProps<RoutineStackParamList, "sets">,
  StackScreenProps<RootStackParamList>
>;

function SetsEditor({ route, navigation }: SetsEditorProps) {
  const { routine, onSave } = useRoutine();
  const [isEditingRest, setIsEditingRest] = useState(false);
  const editRestDurationSheetRef = useRef<BottomSheet>(null);
  const exercisePlan = routine.plan.find(
    ({ id }) => id === route.params.exerciseId
  );

  const exercisePlanActions = ExercisePlanActions(routine);
  const setPlanActions = SetPlanActions(routine, route.params.exerciseId);

  const onRemove = (setId: string) => {
    if (exercisePlan?.sets.length == 1) {
      navigation.goBack();
    }
    onSave(setPlanActions.remove(setId));
  };

  return (
    <InputsPadProvider>
      <ModalWrapper>
        <View style={contentStyles.container}>
          <SetsEditorTopActions
            onAdd={() => onSave(setPlanActions.add())}
            onBack={navigation.goBack}
            onViewProgress={() =>
              navigation.navigate("exerciseInsight", {
                name: exercisePlan?.name ?? "",
              })
            }
            onEditRest={() => setIsEditingRest(true)}
          />
          <View style={{ paddingLeft: "3%", paddingBottom: "3%" }}>
            <Text extraLarge>{exercisePlan?.name ?? ""}</Text>
          </View>
          <SetEditor
            sets={exercisePlan?.sets ?? []}
            difficultyType={
              exercisePlan
                ? getDifficultyType(exercisePlan.name)
                : DifficultyType.BODYWEIGHT
            }
            onEdit={(id, update) => onSave(setPlanActions.update(id, update))}
            onRemove={onRemove}
            renderSet={(props) => <RoutineSet {...props} />}
          />
        </View>
      </ModalWrapper>
      <EditRestDuration
        ref={editRestDurationSheetRef}
        show={isEditingRest}
        hide={() => editRestDurationSheetRef.current?.close()}
        onHide={() => setIsEditingRest(false)}
        duration={exercisePlan?.rest ?? 60}
        onUpdateDuration={(rest) =>
          onSave(exercisePlanActions.update(route.params.exerciseId, { rest }))
        }
      />
    </InputsPadProvider>
  );
}

type AddExerciseProps = CompositeScreenProps<
  StackScreenProps<RoutineStackParamList, "addExercises">,
  StackScreenProps<RootStackParamList>
>;

function AddExercises({ navigation }: AddExerciseProps) {
  const { routine, onSave } = useRoutine();
  const [isFiltering, setIsFiltering] = useState(false);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [exerciseTypeFilters, setExerciseTypeFilters] = useState<string[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const filterExercisesSheetRef = useRef<BottomSheet>(null);

  const exercisePlanActions = ExercisePlanActions(routine);

  const onShowFilters = useCallback(() => {
    setIsFiltering(true);
    Keyboard.dismiss();
  }, []);

  return (
    <>
      <ModalWrapper>
        <View style={contentStyles.container}>
          <AddExercisesTopActions
            onBack={navigation.goBack}
            isGridView={isGridView}
            onToggleView={() => setIsGridView((prev) => !prev)}
          />
          <ExerciseAdder
            onClose={navigation.goBack}
            onAdd={(metas) => onSave(exercisePlanActions.add(metas))}
            muscleFilters={muscleFilters}
            exerciseTypeFilters={exerciseTypeFilters}
            onShowFilters={onShowFilters}
            onUpdateMuscleFilters={setMuscleFilters}
            onUpdateExerciseTypeFilters={setExerciseTypeFilters}
            isGridView={isGridView}
          />
        </View>
        <FilterExercises
          ref={filterExercisesSheetRef}
          show={isFiltering}
          hide={() => filterExercisesSheetRef.current?.close()}
          onHide={() => setIsFiltering(false)}
          muscleFilters={muscleFilters}
          exerciseTypeFilters={exerciseTypeFilters}
          onUpdateMuscleFilters={setMuscleFilters}
          onUpdateExerciseTypeFilters={setExerciseTypeFilters}
        />
      </ModalWrapper>
    </>
  );
}

type ExerciseInsightProps = CompositeScreenProps<
  StackScreenProps<RoutineStackParamList, "exerciseInsight">,
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
type RoutineModalProps = StackScreenProps<RootStackParamList, "routine">;

export function RoutineModal({ route }: RoutineModalProps) {
  return (
    <RoutineProvider routineId={route.params.id}>
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
    </RoutineProvider>
  );
}
