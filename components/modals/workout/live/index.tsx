import { RootStackParamList } from "@/layout/types";
import { CompositeScreenProps } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Keyboard, StyleSheet } from "react-native";
import { ModalWrapper } from "../../common";
import { contentStyles } from "../../common/styles";
import { View, Text } from "@/components/Themed";
import {
  ExercisesEditorTopActions,
  PlayerTopActions,
  SetsEditorTopActions,
} from "./top-actions";
import { MetaEditor, NoteEditor } from "@/components/popup/workout/common/meta";
import {
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
  Exercise,
} from "@/interface";
import { useCallback, useRef, useState } from "react";
import {
  DiscardSetsAndFinishConfirmation,
  FilterExercises,
} from "@/components/sheets";
import { getDifficultyType } from "@/api/exercise";
import { updateExerciseRest } from "@/util/workout/update";
import { ExerciseInsights } from "@/components/popup/exercises/insights";
import {
  AddExercisesTopActions,
  ExerciseInsightTopActions,
} from "../../common/top-actions";
import { ExerciseAdder } from "@/components/popup/workout/common/exercise/add";
import { InputsPadProvider } from "@/components/util/popup/inputs-pad/context";
import { Activity } from "@/components/popup/workout/live/player/activity";
import { getTimePeriodDisplay } from "@/util/date";
import { StyleUtils } from "@/util/styles";
import { WorkoutApi } from "@/api/workout";
import { useRefresh } from "@/components/hooks/use-refresh";
import { ExerciseEditor } from "../../common/exercise";
import { LiveWorkoutExercise } from "../../common/exercise/item";
import { SetEditor } from "../../common/set";
import { LiveWorkoutSet } from "../../common/set/item";
import { EditStartEndTimes } from "@/components/sheets/edit-start-end-time";
import BottomSheet from "@gorhom/bottom-sheet";
import { EditRestDuration } from "@/components/sheets/edit-rest-duration";
import React from "react";

type LiveWorkoutStackParamList = {
  player: undefined;
  exercises: undefined;
  sets: { exerciseId: string };
  addExercises: undefined;
  exerciseInsight: { name: string };
};

const Stack = createNativeStackNavigator<LiveWorkoutStackParamList>();

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
  const discardSetsAndFinishConfirmationSheetRef = useRef<BottomSheet>(null);

  useRefresh({ period: 1000 });

  const forceFinish = () => {
    WorkoutApi.saveWorkout(finish(wrapUpSets(workout as Workout))).then(() => {
      editorActions.stopCurrentWorkout();
      if ((workout as Workout).exercises.length > 0) {
        navigation.replace("congratulations", { id: (workout as Workout).id });
      } else {
        navigation.goBack();
      }
    });
  };

  const attemptFinish = () => {
    if (hasUnstartedSets(workout as Workout)) {
      setIsFinishing(true);
    } else {
      forceFinish();
    }
  };

  const onUpdateSet = (setId: string, update: Partial<Set>) => {
    editorActions.updateWorkout(updateSet(setId, update, workout as Workout));
  };

  return (
    <InputsPadProvider>
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
            onUpdateSet={onUpdateSet}
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
        ref={discardSetsAndFinishConfirmationSheetRef}
        show={isFinishing}
        hide={() => discardSetsAndFinishConfirmationSheetRef.current?.close()}
        onHide={() => setIsFinishing(false)}
        onDiscard={forceFinish}
      />
    </InputsPadProvider>
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
  const adjustStartEndTimeSheetRef = useRef<BottomSheet>(null);
  const discardSetsAndFinishConfirmationSheetRef = useRef<BottomSheet>(null);

  const updateMeta = (update: Partial<Workout>) => {
    actions.updateWorkout({ ...workout, ...update });
  };

  const forceFinish = () => {
    WorkoutApi.saveWorkout(finish(wrapUpSets(workout as Workout))).then(() => {
      actions.stopCurrentWorkout();
      if ((workout as Workout).exercises.length > 0) {
        navigation.goBack();
        navigation.replace("congratulations", { id: (workout as Workout).id });
      } else {
        navigation.goBack();
      }
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
          <ExerciseEditor
            exercises={workout.exercises}
            onRemove={(exerciseId) =>
              actions.updateWorkout(removeExercise(exerciseId, workout))
            }
            onEdit={(exerciseId) => {
              //@ts-ignore
              navigation.navigate("sets", { exerciseId });
            }}
            onReorder={(exercises) =>
              actions.updateWorkout({
                ...workout,
                exercises: exercises as Exercise[],
              })
            }
            renderExercise={(props) => <LiveWorkoutExercise {...props} />}
          />
        </View>
        <DiscardSetsAndFinishConfirmation
          ref={discardSetsAndFinishConfirmationSheetRef}
          show={isFinishing}
          hide={() => discardSetsAndFinishConfirmationSheetRef.current?.close()}
          onHide={() => setIsFinishing(false)}
          onDiscard={forceFinish}
        />
        <EditStartEndTimes
          ref={adjustStartEndTimeSheetRef}
          show={isEditingDates}
          onHide={() => setIsEditingDates(false)}
          startedAt={workout.startedAt}
          endedAt={workout.endedAt ?? null}
          onUpdate={(update) => updateMeta(update)}
          hide={() => adjustStartEndTimeSheetRef.current?.close()}
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
  const editRestDurationSheetRef = useRef<BottomSheet>(null);

  const { workout, actions } = editor;
  const exercise = workout?.exercises.find(
    ({ id }) => id === route.params.exerciseId
  );

  const onAddSet = () => {
    actions.updateWorkout(
      duplicateLastSet(route.params.exerciseId, workout as Workout)
    );
  };

  const onRemoveSet = (setId: string) => {
    if (exercise?.sets.length === 1) {
      navigation.goBack();
    }
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
          <SetEditor
            sets={exercise?.sets ?? []}
            difficultyType={
              exercise
                ? getDifficultyType(exercise.name)
                : DifficultyType.BODYWEIGHT
            }
            onRemove={onRemoveSet}
            onEdit={onUpdateSet}
            renderSet={(props) => <LiveWorkoutSet {...props} />}
          />
        </View>
      </ModalWrapper>
      <EditRestDuration
        ref={editRestDurationSheetRef}
        show={isEditingRest}
        hide={() => editRestDurationSheetRef.current?.close()}
        onHide={() => setIsEditingRest(false)}
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
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [exerciseTypeFilters, setExerciseTypeFilters] = useState<string[]>([]);
  const filterExercisesSheetRef = useRef<BottomSheet>(null);

  const onAddExercises = (metas: ExerciseMeta[]) => {
    let updatedWorkout = JSON.parse(JSON.stringify(workout));
    metas.forEach((meta) => {
      updatedWorkout = addExercise(meta, updatedWorkout);
    });
    actions.updateWorkout(updatedWorkout);
  };

  const onShowFilters = useCallback(() => {
    setIsFiltering(true);
    Keyboard.dismiss();
  }, []);

  return (
    <>
      <ModalWrapper>
        <View style={contentStyles.container}>
          <AddExercisesTopActions onBack={navigation.goBack} />
          <ExerciseAdder
            onClose={navigation.goBack}
            onAdd={onAddExercises}
            muscleFilters={muscleFilters}
            exerciseTypeFilters={exerciseTypeFilters}
            onShowFilters={onShowFilters}
            onUpdateMuscleFilters={setMuscleFilters}
            onUpdateExerciseTypeFilters={setExerciseTypeFilters}
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
