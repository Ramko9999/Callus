import { View, Text } from "@/components/Themed";
import {
  removeExercise,
  addExercise,
  updateWorkout,
  duplicateLastSet,
  removeSet,
  updateSet,
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
  Close,
  Done,
  Shuffle,
  Add,
  Trash,
  Back,
  Repeat,
} from "@/components/theme/actions";
import { StyleSheet, useWindowDimensions } from "react-native";
import { StyleUtils, WORKOUT_PLAYER_EDITOR_HEIGHT } from "@/util/styles";
import { BottomSheet } from "@/components/util/sheets";
import { TimestampRangeEdit } from "@/components/util/daterange-picker";
import { NAME_TO_EXERCISE_META, EXERCISE_REPOSITORY } from "@/constants";
import { ExerciseLevelEditor } from "./common/exercise";
import { ExerciseFinder } from "./common/exercise/finder";
import { SetLevelEditor } from "./common/set";
import { RepeatWorkoutConfirmation, WorkoutDeleteConfirmation } from "./popup";
import * as Haptics from "expo-haptics";
import { MetaEditor, NoteEditor } from "./common/meta";
import React from "react";
import { getHistoricalExerciseDescription } from "@/util/workout/display";

const historicalEditorTopActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    paddingRight: "3%",
  },
});

type HistoricalEditorTopActionsProps = {
  isReordering: boolean;
  onClose: () => void;
  onStartReordering: () => void;
  onDoneReordering: () => void;
  onRepeat: () => void;
  onAdd: () => void;
  onTrash: () => void;
};

function HistoricalEditorTopActions({
  isReordering,
  onClose,
  onStartReordering,
  onDoneReordering,
  onRepeat,
  onAdd,
  onTrash,
}: HistoricalEditorTopActionsProps) {
  return (
    <View style={historicalEditorTopActionsStyles.container}>
      <Close onClick={onClose} />
      <View style={historicalEditorTopActionsStyles.rightActions}>
        <Repeat onClick={onRepeat} />
        {isReordering ? (
          <Done onClick={onDoneReordering} />
        ) : (
          <Shuffle onClick={onStartReordering} />
        )}
        <Add onClick={onAdd} />
        <Trash onClick={onTrash} />
      </View>
    </View>
  );
}

const historicalSetEditorTopActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    paddingRight: "3%",
  },
});

type HistoricalSetEditorTopActionsProps = {
  onClose: () => void;
  onAdd: () => void;
};

function HistoricalSetEditorTopActions({
  onClose,
  onAdd,
}: HistoricalSetEditorTopActionsProps) {
  return (
    <View style={historicalSetEditorTopActionsStyles.container}>
      <Back onClick={onClose} />
      <View style={historicalSetEditorTopActionsStyles.rightActions}>
        <Add onClick={onAdd} />
      </View>
    </View>
  );
}

const historicalEditorStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
  },
  content: {
    ...StyleUtils.flexColumn(),
    flex: 1
  },
});

type HistoricalEditorProps = {
  workout: Workout;
  hide: () => void;
  trash: () => void;
  onSave: (workout: Workout) => void;
  onRepeat: (workout: Workout) => void;
};

export function HistoricalEditor({
  workout,
  hide,
  onSave,
  onRepeat,
  trash,
}: HistoricalEditorProps) {
  const [exerciseId, setExerciseId] = useState<string>();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditingDates, setIsEditingDate] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

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
          historicalEditorStyles.container,
          { height: height * WORKOUT_PLAYER_EDITOR_HEIGHT },
        ]}
      >
        {isEditingExercise ? (
          <>
            <HistoricalSetEditorTopActions
              onAdd={onAddSet}
              onClose={() => setExerciseId(undefined)}
            />
            <View style={historicalEditorStyles.content}>
              <View style={{ paddingLeft: "3%" }}>
                <Text extraLarge>{(exerciseInEdit as Exercise).name}</Text>
              </View>
              <NoteEditor
                note={(exerciseInEdit as Exercise).note}
                onUpdateNote={onNote}
              />
              <SetLevelEditor
                sets={(exerciseInEdit as Exercise).sets}
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
          </>
        ) : (
          <>
            <HistoricalEditorTopActions
              isReordering={isReordering}
              onClose={hide}
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
              onTrash={() => {
                setIsDeleting(true);
              }}
              onRepeat={() => {
                setIsRepeating(true);
              }}
            />
            <View style={historicalEditorStyles.content}>
              <MetaEditor
                workout={workout}
                onUpdateMeta={onUpdateMeta}
                onDateClick={() => setIsEditingDate(true)}
              />
              <ExerciseLevelEditor
                isReordering={isReordering}
                exercises={workout.exercises}
                onRemove={(exerciseId) => {
                  onRemoveExercise(exerciseId);
                }}
                onEdit={(exercise) => {
                  setExerciseId(exercise.id);
                }}
                onReorder={(exercises) => onReorderExercises(exercises)}
                getDescription={getHistoricalExerciseDescription}
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
            <WorkoutDeleteConfirmation
              show={isDeleting}
              hide={() => setIsDeleting(false)}
              onDelete={() => {
                setIsDeleting(false);
                trash();
              }}
            />
            <TimestampRangeEdit
              show={isEditingDates}
              hide={() => setIsEditingDate(false)}
              range={{ startedAt: workout.startedAt, endedAt: workout.endedAt }}
              onUpdate={(range) => onUpdateMeta(range)}
            />
            <RepeatWorkoutConfirmation
              show={isRepeating}
              hide={() => setIsRepeating(false)}
              onRepeat={() => onRepeat(workout)}
            />
          </>
        )}
      </View>
    </>
  );
}

type HistoricalEditorPopupProps = {
  show: boolean;
  hide: () => void;
  workout: Workout;
  onSave: (workout: Workout) => void;
  onRepeat: (workout: Workout) => void;
  trash: () => void;
};

export function HistoricalEditorPopup({
  show,
  hide,
  workout,
  onSave,
  onRepeat,
  trash,
}: HistoricalEditorPopupProps) {
  return (
    <BottomSheet show={show} onBackdropPress={hide} hide={hide}>
      <HistoricalEditor
        workout={workout}
        trash={trash}
        onSave={onSave}
        onRepeat={onRepeat}
        hide={hide}
      />
    </BottomSheet>
  );
}
