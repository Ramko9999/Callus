import {
  Back,
  Done,
  Shuffle,
  Add,
  SignificantAction,
  Time,
} from "@/components/theme/actions";
import { View, Text } from "@/components/Themed";
import { getCurrentWorkoutActivity } from "@/context/WorkoutContext";
import {
  Exercise,
  Workout,
  WorkoutMetadata,
  Set,
  ExerciseMeta,
} from "@/interface";
import { StyleUtils } from "@/util/styles";
import { getLiveExerciseDescription } from "@/util/workout/display";
import React from "react";
import { StyleSheet } from "react-native";
import { ExerciseLevelEditor } from "@/components/popup/workout/common/exercise";
import { MetaEditor, NoteEditor } from "@/components/popup/workout/common/meta";
import { SetLevelEditor } from "@/components/popup/workout/common//set";
import { EXERCISE_REPOSITORY, getDifficultyType } from "@/api/exercise";
import { ExerciseFinder } from "@/components/popup/workout/common/exercise/finder";
import {
  AdjustStartEndTime,
  DiscardSetsAndFinishConfirmation,
  EditRestDuration,
  ModalProps,
} from "@/components/popup/workout/common/modals";

const topActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    paddingRight: "3%",
  },
});

type ExerciseEditorTopActionsProps = {
  isReordering: boolean;
  onClose: () => void;
  onStartReordering: () => void;
  onDoneReordering: () => void;
  onAdd: () => void;
  onFinish: () => void;
};

function ExerciseEditorTopActions({
  isReordering,
  onClose,
  onStartReordering,
  onDoneReordering,
  onAdd,
  onFinish,
}: ExerciseEditorTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Back onClick={onClose} />
      <View style={topActionsStyles.rightActions}>
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

type SetEditorTopActionsProps = {
  onClose: () => void;
  onAdd: () => void;
  onOpenRest: () => void;
};

function SetEditorTopActions({
  onClose,
  onAdd,
  onOpenRest,
}: SetEditorTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Back onClick={onClose} />
      <View style={topActionsStyles.rightActions}>
        <Time onClick={onOpenRest} />
        <Add onClick={onAdd} />
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
  onFinish: () => void;
  onUpdateMeta: (meta: Partial<WorkoutMetadata>) => void;
  onEditTimes: () => void;
};

export function ExerciseEditorContent(props: ExerciseEditorContentProps) {
  const {
    workout,
    onUpdateMeta,
    onEditTimes,
    onRemove,
    onSelect,
    onReorder,
    isReordering,
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
          currentExerciseId={
            getCurrentWorkoutActivity(workout).activityData.exercise?.id
          }
          isReordering={isReordering}
          exercises={workout.exercises}
          onRemove={onRemove}
          onEdit={onSelect}
          onReorder={onReorder}
          getDescription={getLiveExerciseDescription}
        />
      </View>
    </>
  );
}

type SetEditorContentProps = {
  onAdd: () => void;
  onEditRest: () => void;
  onRemove: (setId: string) => void;
  onUpdate: (setId: string, update: Partial<Set>) => void;
  onNote: (note?: string) => void;
  close: () => void;
  exercise: Exercise;
  workout: Workout;
};

export function SetEditorContent({
  onAdd,
  onEditRest,
  onNote,
  onRemove,
  onUpdate,
  close,
  exercise,
  workout,
}: SetEditorContentProps) {
  return (
    <>
      <SetEditorTopActions
        onAdd={onAdd}
        onOpenRest={onEditRest}
        onClose={close}
      />
      <View style={editorContentStyles.container}>
        <View style={{ paddingLeft: "3%" }}>
          <Text extraLarge>{exercise.name}</Text>
        </View>
        <NoteEditor note={exercise.note} onUpdateNote={onNote} />
        <SetLevelEditor
          sets={exercise.sets}
          currentSet={getCurrentWorkoutActivity(workout).activityData.set}
          difficultyType={getDifficultyType(exercise.name)}
          onRemove={onRemove}
          onEdit={onUpdate}
          back={close}
        />
      </View>
    </>
  );
}

type ExerciseEditorModalsProps = {
  add: (meta: ExerciseMeta) => void;
  finish: () => void;
  updateMeta: (meta: Partial<WorkoutMetadata>) => void;
  workout: Workout;
  finder: ModalProps;
  finishConfirmation: ModalProps;
  adjustTimes: ModalProps;
};

export function ExerciseEditorModals({
  add,
  finish,
  updateMeta,
  workout,
  finder,
  finishConfirmation,
  adjustTimes,
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
      <DiscardSetsAndFinishConfirmation
        {...finishConfirmation}
        onDiscard={() => {
          finishConfirmation.hide();
          finish();
        }}
      />
      <AdjustStartEndTime
        {...adjustTimes}
        startTime={workout.startedAt}
        endTime={workout.endedAt}
        updateEndTime={(endTime) => updateMeta({ endedAt: endTime })}
        updateStartTime={(startTime) => updateMeta({ startedAt: startTime })}
      />
    </>
  );
}

type SetEditorModalsProps = {
  exercise: Exercise;
  editRest: (newRestDuration: number) => void;
  editingRest: ModalProps;
};

export function SetEditorModals({
  exercise,
  editRest,
  editingRest,
}: SetEditorModalsProps) {
  return (
    <>
      <EditRestDuration
        {...editingRest}
        duration={exercise.restDuration}
        onUpdateDuration={editRest}
      />
    </>
  );
}
