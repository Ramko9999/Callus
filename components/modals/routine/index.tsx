import { RootStackParamList } from "@/layout/types";
import {
  createStackNavigator,
  StackScreenProps,
  TransitionPresets,
} from "@react-navigation/stack";
import { RoutineProvider, useRoutine } from "./context";
import { Platform } from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { useUserDetails } from "@/components/user-details";
import { useWorkout } from "@/context/WorkoutContext";
import { useToast } from "react-native-toast-notifications";
import { ModalWrapper } from "../common";
import { contentStyles } from "../common/styles";
import { View, Text } from "@/components/Themed";
import { ExercisesEditorTopActions } from "./top-actions";
import { MetaEditor } from "@/components/popup/routine/common/meta";
import { ExerciseLevelEditor } from "@/components/popup/routine/common/exercise";
import { WorkoutApi } from "@/api/workout";
import { WorkoutActions } from "@/api/model/workout";
import { DifficultyType, Routine } from "@/interface";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import { ExercisePlanActions, SetPlanActions } from "@/api/model/routine";
import {
  EditRestDuration,
  RoutineDeleteConfirmation,
  RoutineStartConfirmation,
} from "@/components/popup/workout/common/modals";
import { useState } from "react";
import { SetsEditorTopActions } from "./top-actions";
import { SetLevelEditor } from "@/components/popup/routine/common/set";
import { getDifficultyType } from "@/api/exercise";
import { InputsPadProvider } from "@/components/util/popup/inputs-pad/context";
import { PerformantExerciseAdder } from "@/components/popup/workout/common/exercise/add";
import { ExercisesFilter } from "@/components/popup/exercises/filters";
import { ExerciseInsights } from "@/components/popup/exercises/insights";
import {
  AddExercisesTopActions,
  ExerciseInsightTopActions,
} from "../common/top-actions";

type RoutineStackParamList = {
  exercises: undefined;
  sets: { exerciseId: string };
  addExercises: undefined;
  exerciseInsight: { name: string };
};

const Stack = createStackNavigator<RoutineStackParamList>();

type ExerciseEditorProps = CompositeScreenProps<
  StackScreenProps<RoutineStackParamList, "exercises">,
  StackScreenProps<RootStackParamList>
>;

// todo: fix the lag in which it takes for the exercises to show up
function ExercisesEditor({ navigation }: ExerciseEditorProps) {
  const { routine, onSave } = useRoutine();
  const { isInWorkout, actions } = useWorkout();

  const [isTrashing, setIsTrashing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const { userDetails } = useUserDetails();

  const toast = useToast();

  const onUpdateMeta = (update: Partial<Routine>) => {
    return { ...routine, ...update };
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
            onTrash={() => setIsTrashing(true)}
            onStart={() => setIsStarting(true)}
          />
          <MetaEditor routine={routine} onUpdateMeta={onUpdateMeta} />
          <ExerciseLevelEditor
            exercises={routine.plan}
            getDescription={getHistoricalExerciseDescription}
            onRemove={(id) => onSave(ExercisePlanActions(routine).remove(id))}
            onEdit={(exercisePlanId) =>
              navigation.navigate("sets", { exerciseId: exercisePlanId })
            }
            onReorder={(plan) => onSave(onUpdateMeta({ plan }))}
          />
        </View>
      </ModalWrapper>
      <RoutineDeleteConfirmation
        show={isTrashing}
        hide={() => setIsTrashing(false)}
        onDelete={trash}
      />
      <RoutineStartConfirmation
        show={isStarting}
        hide={() => setIsStarting(false)}
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
  const exercisePlan = routine.plan.find(
    ({ id }) => id === route.params.exerciseId
  );

  const exercisePlanActions = ExercisePlanActions(routine);
  const setPlanActions = SetPlanActions(routine, route.params.exerciseId);

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
          <View style={{ paddingLeft: "3%" }}>
            <Text extraLarge>{exercisePlan?.name ?? ""}</Text>
          </View>
          <SetLevelEditor
            sets={exercisePlan?.sets ?? []}
            difficultyType={
              exercisePlan
                ? getDifficultyType(exercisePlan.name)
                : DifficultyType.BODYWEIGHT
            }
            onEdit={(id, update) => onSave(setPlanActions.update(id, update))}
            onRemove={(id) => onSave(setPlanActions.remove(id))}
            back={navigation.goBack}
          />
        </View>
      </ModalWrapper>
      <EditRestDuration
        show={isEditingRest}
        hide={() => setIsEditingRest(false)}
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
  const [muscleFilter, setMuscleFilter] = useState<string>();
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<string>();

  const exercisePlanActions = ExercisePlanActions(routine);

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
            onAdd={(metas) => onSave(exercisePlanActions.add(metas))}
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
    </RoutineProvider>
  );
}
