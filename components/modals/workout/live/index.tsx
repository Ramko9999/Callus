import { RootStackParamList } from "@/layout/types";
import { CompositeScreenProps } from "@react-navigation/native";
import {
  createStackNavigator,
  StackScreenProps,
  TransitionPresets,
} from "@react-navigation/stack";
import { Platform, StyleSheet } from "react-native";
import { ModalWrapper } from "../../common";
import { contentStyles } from "../../common/styles";
import { View, Text } from "@/components/Themed";
import {
  ExercisesEditorTopActions,
  PlayerTopActions,
  SetsEditorTopActions,
} from "./top-actions";
import { MetaEditor, NoteEditor } from "@/components/popup/workout/common/meta";
import { ExerciseLevelEditor } from "@/components/popup/workout/common/exercise";
import {
  getCurrentWorkoutActivity,
  hasUnstartedSets,
  removeExercise,
  useWorkout,
  wrapUpSets,
  finish,
  removeSet,
  updateSet,
  updateExercise,
  duplicateLastSet,
  addExercise,
} from "@/context/WorkoutContext";
import {
  DifficultyType,
  Workout,
  Set,
  ExerciseMeta,
  WorkoutActivity,
} from "@/interface";
import { getLiveExerciseDescription } from "@/util/workout/display";
import { useEffect, useRef, useState } from "react";
import {
  AdjustStartEndTime,
  DiscardSetsAndFinishConfirmation,
  EditRestDuration,
} from "@/components/popup/workout/common/modals";
import { SetLevelEditor } from "@/components/popup/workout/common/set";
import { getDifficultyType } from "@/api/exercise";
import { updateExerciseRest } from "@/util/workout/update";
import { ExerciseInsights } from "@/components/popup/exercises/insights";
import {
  AddExercisesTopActions,
  ExerciseInsightTopActions,
} from "../../common/top-actions";
import { PerformantExerciseAdder } from "@/components/popup/workout/common/exercise/add";
import { ExercisesFilter } from "@/components/popup/exercises/filters";
import { InputsPadProvider } from "@/components/util/popup/inputs-pad/context";
import { Activity } from "@/components/popup/workout/live/player/activity";
import { getTimePeriodDisplay } from "@/util/date";
import { StyleUtils } from "@/util/styles";
import { WorkoutApi } from "@/api/workout";
import { useRefresh } from "@/components/hooks/use-refresh";

type LiveWorkoutStackParamList = {
  player: undefined;
  exercises: undefined;
  sets: { exerciseId: string };
  addExercises: undefined;
  exerciseInsight: { name: string };
};

const Stack = createStackNavigator<LiveWorkoutStackParamList>();

const playerStyles = StyleSheet.create({
  timer: {
    ...StyleUtils.flexRowCenterAll(),
  },
});

type PlayerProps = CompositeScreenProps<
  StackScreenProps<LiveWorkoutStackParamList, "player">,
  StackScreenProps<RootStackParamList>
>;

// todo: completely utterly fix the rest
// todo: think about how to present the UI in the best way
function Player({ navigation }: PlayerProps) {
  const { activity, actions, editor } = useWorkout();
  const { workout, actions: editorActions } = editor;
  const [isFinishing, setIsFinishing] = useState(false);

  useRefresh({ period: 1000 });

  const forceFinish = () => {
    WorkoutApi.saveWorkout(finish(wrapUpSets(workout as Workout))).then(() => {
      editorActions.stopCurrentWorkout();
      navigation.goBack();
    });
  };

  const attemptFinish = () => {
    if (hasUnstartedSets(workout as Workout)) {
      setIsFinishing(true);
    } else {
      forceFinish();
    }
  };

  return (
    <>
      <ModalWrapper>
        <View style={contentStyles.container}>
          <PlayerTopActions
            onClose={navigation.goBack}
            onEdit={() => navigation.navigate("exercises")}
            onFinish={attemptFinish}
          />
          <Activity
            activity={activity as WorkoutActivity}
            onCompleteSet={actions.completeSet}
            onSkipRest={actions.completeRest}
            onUpdateRest={actions.updateRestDuration}
            onCompleteWorkout={attemptFinish}
          />
          <View style={playerStyles.timer}>
            <Text large>
              {getTimePeriodDisplay(
                Date.now() - (workout as Workout).startedAt
              )}
            </Text>
          </View>
        </View>
      </ModalWrapper>
      <DiscardSetsAndFinishConfirmation
        show={isFinishing}
        hide={() => setIsFinishing(false)}
        onDiscard={forceFinish}
      />
    </>
  );
}

type ExercisesEditorProps = CompositeScreenProps<
  StackScreenProps<LiveWorkoutStackParamList, "exercises">,
  StackScreenProps<RootStackParamList>
>;

function ExercisesEditor({ navigation }: ExercisesEditorProps) {
  const { editor } = useWorkout();
  const workout = editor.workout as Workout;
  const { actions } = editor;

  useRefresh({ period: 1000 });

  const [isFinishing, setIsFinishing] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);

  const updateMeta = (update: Partial<Workout>) => {
    actions.updateWorkout({ ...workout, ...update });
  };

  const forceFinish = () => {
    WorkoutApi.saveWorkout(finish(wrapUpSets(workout as Workout))).then(() => {
      actions.stopCurrentWorkout();
      navigation.goBack();
      navigation.goBack();
    });
  };

  const attemptToFinish = () => {
    if (hasUnstartedSets(workout)) {
      setIsFinishing(true);
    } else {
      forceFinish();
    }
  };

  return (
    <>
      <ModalWrapper>
        <View style={contentStyles.container}>
          <ExercisesEditorTopActions
            onBack={navigation.goBack}
            onAdd={() => navigation.navigate("addExercises")}
            onFinish={attemptToFinish}
          />
          <MetaEditor
            workout={workout}
            onUpdateMeta={updateMeta}
            onDateClick={() => setIsEditingDates(true)}
          />
          <ExerciseLevelEditor
            currentExerciseId={
              getCurrentWorkoutActivity(workout).activityData.exercise?.id
            }
            exercises={workout.exercises}
            onRemove={(exerciseId) =>
              actions.updateWorkout(removeExercise(exerciseId, workout))
            }
            onEdit={({ id }) => {
              //@ts-ignore
              navigation.navigate("sets", { exerciseId: id });
            }}
            onReorder={(exercises) =>
              actions.updateWorkout({ ...workout, exercises })
            }
            getDescription={getLiveExerciseDescription}
          />
        </View>
        <DiscardSetsAndFinishConfirmation
          show={isFinishing}
          hide={() => setIsFinishing(false)}
          onDiscard={forceFinish}
        />
        <AdjustStartEndTime
          show={isEditingDates}
          hide={() => setIsEditingDates(false)}
          startTime={workout.startedAt}
          endTime={workout.endedAt}
          updateEndTime={(endedAt) => updateMeta({ endedAt })}
          updateStartTime={(startedAt) => updateMeta({ startedAt })}
        />
      </ModalWrapper>
    </>
  );
}

type SetsEditorProps = CompositeScreenProps<
  StackScreenProps<LiveWorkoutStackParamList, "sets">,
  StackScreenProps<RootStackParamList>
>;

function SetsEditor({ route, navigation }: SetsEditorProps) {
  const { editor } = useWorkout();

  const [isEditingRest, setIsEditingRest] = useState(false);

  const { workout, actions } = editor;
  const exercise = workout?.exercises.find(
    ({ id }) => id === route.params.exerciseId
  );
  const currentSet = workout
    ? getCurrentWorkoutActivity(workout).activityData.set
    : undefined;

  const onAddSet = () => {
    actions.updateWorkout(
      duplicateLastSet(route.params.exerciseId, workout as Workout)
    );
  };

  const onRemoveSet = (setId: string) => {
    actions.updateWorkout(removeSet(setId, workout as Workout));
  };

  const onUpdateSet = (setId: string, update: Partial<Set>) => {
    actions.updateWorkout(updateSet(setId, update, workout as Workout));
  };

  const onNote = (note?: string) => {
    actions.updateWorkout(
      updateExercise(route.params.exerciseId, { note }, workout as Workout)
    );
  };

  return (
    <InputsPadProvider>
      <ModalWrapper>
        <View style={contentStyles.container}>
          <SetsEditorTopActions
            onAdd={onAddSet}
            onBack={navigation.goBack}
            onViewProgress={() =>
              navigation.navigate("exerciseInsight", {
                name: exercise?.name ?? "",
              })
            }
            onEditRest={() => setIsEditingRest(true)}
          />
          <View style={{ paddingLeft: "3%" }}>
            <Text extraLarge>{exercise?.name ?? ""}</Text>
          </View>
          <NoteEditor note={exercise?.note ?? ""} onUpdateNote={onNote} />
          <SetLevelEditor
            sets={exercise?.sets ?? []}
            currentSet={currentSet}
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
      <EditRestDuration
        show={isEditingRest}
        hide={() => setIsEditingRest(false)}
        duration={exercise?.restDuration ?? 0}
        onUpdateDuration={(duration) =>
          actions.updateWorkout(
            updateExerciseRest(
              route.params.exerciseId,
              duration,
              workout as Workout
            )
          )
        }
      />
    </InputsPadProvider>
  );
}

type ExerciseInsightProps = CompositeScreenProps<
  StackScreenProps<LiveWorkoutStackParamList, "exerciseInsight">,
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

type AddExercisesProps = CompositeScreenProps<
  StackScreenProps<LiveWorkoutStackParamList, "addExercises">,
  StackScreenProps<RootStackParamList>
>;

function AddExercises({ navigation }: AddExercisesProps) {
  const { editor } = useWorkout();
  const { workout, actions } = editor;
  const [isFiltering, setIsFiltering] = useState(false);
  const [muscleFilter, setMuscleFilter] = useState<string>();
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<string>();

  const onAddExercises = (metas: ExerciseMeta[]) => {
    let updatedWorkout = JSON.parse(JSON.stringify(workout));
    metas.forEach((meta) => {
      updatedWorkout = addExercise(meta, updatedWorkout);
    });
    actions.updateWorkout(updatedWorkout);
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

const liveWorkoutModalsStyles = StyleSheet.create({
  blank: {
    flex: 1,
  },
});

export function LiveWorkoutModal() {
  const { isInWorkout } = useWorkout();

  if (!isInWorkout) {
    return <View background style={liveWorkoutModalsStyles.blank} />;
  }

  return (
    <Stack.Navigator
      initialRouteName="player"
      screenOptions={{
        headerShown: false,
        ...(Platform.OS === "android"
          ? TransitionPresets.SlideFromRightIOS
          : {}),
      }}
    >
      <Stack.Screen name={"player"} component={Player} />
      <Stack.Screen name={"exercises"} component={ExercisesEditor} />
      <Stack.Screen name={"sets"} component={SetsEditor} />
      <Stack.Screen
        name={"exerciseInsight"}
        component={ExerciseInsightOverview}
      />
      <Stack.Screen name={"addExercises"} component={AddExercises} />
    </Stack.Navigator>
  );
}
