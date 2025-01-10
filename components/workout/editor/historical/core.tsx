import { EXERCISE_REPOSITORY, getDifficultyType } from "@/api/exercise";
import { View, Text } from "@/components/Themed";
import {
  Exercise,
  ExerciseMeta,
  Set,
  Workout,
  WorkoutMetadata,
} from "@/interface";
import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { MetaEditor, NoteEditor } from "../common/meta";
import { SetLevelEditor } from "../common/set";
import {
  Add,
  Back,
  Close,
  Done,
  Repeat,
  Shuffle,
  Trash,
} from "@/components/theme/actions";
import React from "react";
import { ExerciseLevelEditor } from "../common/exercise";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import { ExerciseFinder } from "../common/exercise/finder";
import {
  AdjustStartEndTime,
  RepeatWorkoutConfirmation,
  WorkoutDeleteConfirmation,
} from "../modal";

const topActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    paddingRight: "3%",
  },
});

type SetEditorTopActionsProps = {
  onAdd: () => void;
  onClose: () => void;
};

function SetEditorTopActions({ onAdd, onClose }: SetEditorTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Back onClick={onClose} />
      <View style={topActionsStyles.rightActions}>
        <Add onClick={onAdd} />
      </View>
    </View>
  );
}

type ExerciseEditorTopActionsProps = {
  isReordering: boolean;
  onClose: () => void;
  onStartReordering: () => void;
  onDoneReordering: () => void;
  onAdd: () => void;
  onTrash: () => void;
  onRepeat: () => void;
};

function ExerciseEditorTopActions({
  isReordering,
  onClose,
  onStartReordering,
  onDoneReordering,
  onAdd,
  onTrash,
  onRepeat,
}: ExerciseEditorTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Close onClick={onClose} />
      <View style={topActionsStyles.rightActions}>
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

const editorContentStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
  },
});

type ExerciseEditorContentProps = {
  isReordering: boolean;
  workout: Workout;
  onClose: () => void;
  onStartReordering: () => void;
  onDoneReordering: () => void;
  onAdd: () => void;
  onRemove: (exerciseId: string) => void;
  onSelect: (exercise: Exercise) => void;
  onReorder: (exercises: Exercise[]) => void;
  onTrash: () => void;
  onRepeat: () => void;
  onUpdateMeta: (meta: Partial<WorkoutMetadata>) => void;
  onEditTimes: () => void;
};

export function ExerciseEditorContent(props: ExerciseEditorContentProps) {
  const {
    isReordering,
    workout,
    onUpdateMeta,
    onEditTimes,
    onRemove,
    onSelect,
    onReorder,
  } = props;

  return (
    <>
      <ExerciseEditorTopActions {...props} />
      <View style={editorContentStyles.container}>
        <MetaEditor
          workout={workout}
          onUpdateMeta={onUpdateMeta}
          onDateClick={onEditTimes}
        />
        <ExerciseLevelEditor
          isReordering={isReordering}
          exercises={workout.exercises}
          onRemove={onRemove}
          onEdit={onSelect}
          onReorder={onReorder}
          getDescription={getHistoricalExerciseDescription}
        />
      </View>
    </>
  );
}

type SetEditorContentProps = {
  onAdd: () => void;
  onRemove: (setId: string) => void;
  onUpdate: (setId: string, update: Partial<Set>) => void;
  onNote: (note?: string) => void;
  close: () => void;
  exercise: Exercise;
};

export function SetEditorContent({
  exercise,
  onNote,
  onRemove,
  onAdd,
  onUpdate,
  close,
}: SetEditorContentProps) {
  const { name, note, sets } = exercise;
  const difficultyType = getDifficultyType(name);

  return (
    <>
      <SetEditorTopActions onAdd={onAdd} onClose={close} />
      <View style={editorContentStyles.container}>
        <View style={{ paddingLeft: "3%" }}>
          <Text extraLarge>{name}</Text>
        </View>
        <NoteEditor note={note} onUpdateNote={onNote} />
        <SetLevelEditor
          sets={sets}
          difficultyType={difficultyType}
          onRemove={onRemove}
          onEdit={onUpdate}
          back={close}
        />
      </View>
    </>
  );
}

type ModalProps = {
  show: boolean;
  hide: () => void;
};

type ExerciseEditorModalsProps = {
  add: (meta: ExerciseMeta) => void;
  trash: () => void;
  updateMeta: (meta: Partial<WorkoutMetadata>) => void;
  repeat: (workout: Workout) => void;
  workout: Workout;
  finder: ModalProps;
  trashConfirmation: ModalProps;
  adjustTimes: ModalProps;
  repeatConfirmation: ModalProps;
};

export function ExerciseEditorModals({
  add,
  trash,
  updateMeta,
  repeat,
  workout,
  finder,
  trashConfirmation,
  adjustTimes,
  repeatConfirmation,
}: ExerciseEditorModalsProps) {
  return (
    <>
      <ExerciseFinder
        {...finder}
        repository={EXERCISE_REPOSITORY}
        onSelect={(meta) => {
          finder.hide();
          add(meta);
        }}
      />
      <WorkoutDeleteConfirmation
        {...trashConfirmation}
        onDelete={() => {
          trashConfirmation.hide();
          trash();
        }}
      />
      <AdjustStartEndTime
        {...adjustTimes}
        startTime={workout.startedAt}
        endTime={workout.endedAt}
        updateEndTime={(endTime) => updateMeta({ endedAt: endTime })}
        updateStartTime={(startTime) => updateMeta({ startedAt: startTime })}
      />
      <RepeatWorkoutConfirmation
        {...repeatConfirmation}
        onRepeat={() => {
          repeatConfirmation.hide();
          repeat(workout);
        }}
      />
    </>
  );
}
