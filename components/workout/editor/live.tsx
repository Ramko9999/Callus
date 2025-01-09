import { View, Text } from "@/components/Themed";
import {
  removeExercise,
  addExercise,
  updateWorkout,
  duplicateLastSet,
  removeSet,
  updateSet,
  useWorkout,
  wrapUpSets,
  hasUnstartedSets,
  getCurrentWorkoutActivity,
  updateExercise,
} from "@/context/WorkoutContext";
import {
  Workout,
  Exercise,
  ExerciseMeta,
  WorkoutMetadata,
  Set,
} from "@/interface";
import { useState } from "react";
import {
  Done,
  Shuffle,
  Add,
  Back,
  SignificantAction,
  Time,
} from "@/components/theme/actions";
import { StyleSheet, useWindowDimensions } from "react-native";
import { StyleUtils, WORKOUT_PLAYER_EDITOR_HEIGHT } from "@/util/styles";
import * as Haptics from "expo-haptics";
import {
  AdjustStartEndTime,
  DiscardSetsAndFinishConfirmation,
  EditRestDuration,
} from "./modal";
import { NAME_TO_EXERCISE_META, EXERCISE_REPOSITORY } from "@/api/exercise";
import { ExerciseLevelEditor } from "./common/exercise";
import { ExerciseFinder } from "./common/exercise/finder";
import { SetLevelEditor } from "./common/set";
import { MetaEditor, NoteEditor } from "./common/meta";
import { getLiveExerciseDescription } from "@/util/workout/display";
import React from "react";
import * as WorkoutUpdateUtils from "@/util/workout/update";

const liveEditorTopActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    justifyContent: "center",
    alignItems: "center",
    paddingRight: "3%",
  },
});

type LiveEditorTopActionsProps = {
  isReordering: boolean;
  onClose: () => void;
  onStartReordering: () => void;
  onDoneReordering: () => void;
  onAdd: () => void;
  onFinish: () => void;
};

function LiveEditorTopActions({
  isReordering,
  onClose,
  onStartReordering,
  onDoneReordering,
  onAdd,
  onFinish,
}: LiveEditorTopActionsProps) {
  return (
    <View style={liveEditorTopActionsStyles.container}>
      <Back onClick={onClose} />
      <View style={liveEditorTopActionsStyles.rightActions}>
        {isReordering ? (
          <Done onClick={onDoneReordering} />
        ) : (
          <Shuffle onClick={onStartReordering} />
        )}
        <Add onClick={onAdd} />
        <SignificantAction onClick={onFinish} text="Finish" />
      </View>
    </View>
  );
}

const liveSetEditorTopActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(),
    paddingRight: "3%",
  },
});

type LiveSetEditorTopActionsProps = {
  onClose: () => void;
  onAdd: () => void;
  onOpenRest: () => void;
};

function LiveSetEditorTopActions({
  onClose,
  onAdd,
  onOpenRest,
}: LiveSetEditorTopActionsProps) {
  return (
    <View style={liveSetEditorTopActionsStyles.container}>
      <Back onClick={onClose} />
      <View style={liveSetEditorTopActionsStyles.rightActions}>
        <Time onClick={onOpenRest} />
        <Add onClick={onAdd} />
      </View>
    </View>
  );
}

const liveEditorStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
  },
  content: {
    ...StyleUtils.flexColumn(),
    flex: 1,
  },
});

type LiveEditorProps = {
  back: () => void;
};

export function LiveEditor({ back }: LiveEditorProps) {
  const { editor } = useWorkout();
  const { updateWorkout: onSave } = editor.actions;
  const workout = editor.workout as Workout;

  const [exerciseId, setExerciseId] = useState<string>();
  const [isFinishing, setIsFinishing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditingDates, setIsEditingDate] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isEditingRest, setIsEditingRest] = useState(false);

  const isEditingExercise = exerciseId != undefined;
  const exerciseInEdit = workout.exercises.find(({ id }) => id === exerciseId);

  const { height } = useWindowDimensions();

  const onRemoveExercise = (exerciseId: string) => {
    onSave(removeExercise(exerciseId, workout));
  };

  const onAddExercise = (meta: ExerciseMeta) => {
    onSave(addExercise(meta, workout));
  };

  const onReorderExercises = (exercises: Exercise[]) => {
    onSave({ ...workout, exercises });
  };

  const onUpdateMeta = (meta: Partial<WorkoutMetadata>) => {
    onSave(updateWorkout({ ...meta }, workout));
  };

  const onAddSet = () => {
    onSave(duplicateLastSet(exerciseId as string, workout));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    <>
      <View
        background
        style={[
          liveEditorStyles.container,
          { height: height * WORKOUT_PLAYER_EDITOR_HEIGHT },
        ]}
      >
        {isEditingExercise ? (
          <>
            <LiveSetEditorTopActions
              onAdd={onAddSet}
              onOpenRest={() => setIsEditingRest(true)}
              onClose={() => setExerciseId(undefined)}
            />
            <View style={liveEditorStyles.content}>
              <View style={{ paddingLeft: "3%" }}>
                <Text extraLarge>{(exerciseInEdit as Exercise).name}</Text>
              </View>
              <NoteEditor
                note={(exerciseInEdit as Exercise).note}
                onUpdateNote={onNote}
              />
              <SetLevelEditor
                sets={(exerciseInEdit as Exercise).sets}
                currentSet={getCurrentWorkoutActivity(workout).activityData.set}
                difficultyType={
                  (
                    NAME_TO_EXERCISE_META.get(
                      (exerciseInEdit as Exercise).name
                    ) as ExerciseMeta
                  ).difficultyType
                }
                onRemove={onRemoveSet}
                onEdit={onUpdateSet}
                back={() => setExerciseId(undefined)}
              />
            </View>
            <EditRestDuration
              show={isEditingRest}
              hide={() => setIsEditingRest(false)}
              duration={(exerciseInEdit as Exercise).restDuration}
              onUpdateDuration={(duration) =>
                onSave(
                  WorkoutUpdateUtils.updateExerciseRest(
                    exerciseId,
                    duration,
                    workout
                  )
                )
              }
            />
          </>
        ) : (
          <>
            <LiveEditorTopActions
              isReordering={isReordering}
              onClose={back}
              onStartReordering={() => {
                setIsReordering(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              onDoneReordering={() => {
                setIsReordering(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              onAdd={() => {
                setIsSearching(true);
              }}
              onFinish={() => {
                if (hasUnstartedSets(workout)) {
                  setIsFinishing(true);
                } else {
                  onSave(wrapUpSets(workout));
                }
              }}
            />
            <View style={liveEditorStyles.content}>
              <MetaEditor
                workout={workout}
                onUpdateMeta={onUpdateMeta}
                onDateClick={() => setIsEditingDate(true)}
              />
              <ExerciseLevelEditor
                currentExerciseId={
                  getCurrentWorkoutActivity(workout).activityData.exercise?.id
                }
                isReordering={isReordering}
                exercises={workout.exercises}
                onRemove={(exerciseId) => {
                  onRemoveExercise(exerciseId);
                }}
                onEdit={(exercise) => {
                  setExerciseId(exercise.id);
                }}
                onReorder={(exercises) => onReorderExercises(exercises)}
                getDescription={getLiveExerciseDescription}
              />
            </View>
            <ExerciseFinder
              show={isSearching}
              hide={() => setIsSearching(false)}
              repository={EXERCISE_REPOSITORY}
              onSelect={(meta) => {
                onAddExercise(meta);
                setIsSearching(false);
              }}
            />
            <DiscardSetsAndFinishConfirmation
              show={isFinishing}
              hide={() => setIsFinishing(false)}
              onDiscard={() => {
                onSave(wrapUpSets(workout));
                setIsFinishing(false);
              }}
            />
            <AdjustStartEndTime
              show={isEditingDates}
              hide={() => setIsEditingDate(false)}
              startTime={workout.startedAt}
              endTime={workout.endedAt}
              updateEndTime={(endTime) => onUpdateMeta({ endedAt: endTime })}
              updateStartTime={(startTime) =>
                onUpdateMeta({ startedAt: startTime })
              }
            />
          </>
        )}
      </View>
    </>
  );
}
