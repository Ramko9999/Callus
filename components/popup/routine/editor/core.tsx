import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { View, Text } from "@/components/Themed";
import {
  Add,
  Back,
  Close,
  Done,
  Shuffle,
  Start,
  Time,
  Trash,
} from "@/components/theme/actions";
import { ExercisePlan, Routine, SetPlan } from "@/interface";
import { ExerciseLevelEditor } from "../common/exercise";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import { MetaEditor } from "../common/meta";
import React from "react";
import { SetLevelEditor } from "../common/set";
import { getDifficultyType } from "@/api/exercise";
import {
  EditRestDuration,
  RoutineDeleteConfirmation,
  RoutineStartConfirmation,
} from "../../workout/common/modals";
import { ModalProps } from "../../common";

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
  onOpenRest: () => void;
};

function SetEditorTopActions({
  onAdd,
  onClose,
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

type ExerciseEditorTopActionsProps = {
  onClose: () => void;
  onAdd: () => void;
  onTrash: () => void;
  onStart: () => void;
};

function ExerciseEditorTopActions({
  onClose,
  onAdd,
  onTrash,
  onStart,
}: ExerciseEditorTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Close onClick={onClose} />
      <View style={topActionsStyles.rightActions}>
        <Add onClick={onAdd} />
        <Start onClick={onStart} />
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
  routine: Routine;
  onClose: () => void;
  onAdd: () => void;
  onRemove: (exercisePlanId: string) => void;
  onSelect: (exercisePlanId: string) => void;
  onReorder: (exercises: ExercisePlan[]) => void;
  onTrash: () => void;
  onStart: () => void;
  onUpdateMeta: (routineMeta: Partial<Routine>) => void;
};

// todo: reuse the same components for workout and routines
export function ExerciseEditorContent(props: ExerciseEditorContentProps) {
  const {
    routine,
    onRemove,
    onSelect,
    onReorder,
    onUpdateMeta,
    onClose,
    onAdd,
    onTrash,
    onStart,
  } = props;

  return (
    <>
      <ExerciseEditorTopActions
        onClose={onClose}
        onAdd={onAdd}
        onTrash={onTrash}
        onStart={onStart}
      />
      <View style={editorContentStyles.container}>
        <MetaEditor routine={routine} onUpdateMeta={onUpdateMeta} />
        <ExerciseLevelEditor
          exercises={routine.plan}
          getDescription={getHistoricalExerciseDescription}
          onRemove={onRemove}
          onEdit={onSelect}
          onReorder={onReorder}
        />
      </View>
    </>
  );
}

type SetEditorContentProps = {
  onAdd: () => void;
  onRemove: (setPlanId: string) => void;
  onUpdate: (setPlanId: string, update: Partial<SetPlan>) => void;
  onEditRest: () => void;
  close: () => void;
  exercise: ExercisePlan;
};

export function SetEditorContent({
  onAdd,
  onRemove,
  onUpdate,
  onEditRest,
  close,
  exercise,
}: SetEditorContentProps) {
  return (
    <>
      <SetEditorTopActions
        onAdd={onAdd}
        onClose={close}
        onOpenRest={onEditRest}
      />
      <View style={editorContentStyles.container}>
        <View style={{ paddingLeft: "3%" }}>
          <Text extraLarge>{exercise.name}</Text>
        </View>
        <SetLevelEditor
          sets={exercise.sets}
          difficultyType={getDifficultyType(exercise.name)}
          onEdit={onUpdate}
          onRemove={onRemove}
          back={close}
        />
      </View>
    </>
  );
}

type ExerciseEditorModalsProps = {
  trash: () => void;
  start: () => void;
  trashConfirmation: ModalProps;
  startConfirmation: ModalProps;
};

export function ExerciseEditorModals({
  trash,
  start,
  trashConfirmation,
  startConfirmation,
}: ExerciseEditorModalsProps) {
  return (
    <>
      <RoutineDeleteConfirmation
        {...trashConfirmation}
        onDelete={() => {
          trashConfirmation.hide();
          trash();
        }}
      />
      <RoutineStartConfirmation
        {...startConfirmation}
        onStart={() => {
          startConfirmation.hide();
          start();
        }}
      />
    </>
  );
}

type SetEditorModalsProps = {
  exercisePlan: ExercisePlan;
  editRest: (newRestDuration: number) => void;
  editingRest: ModalProps;
};

export function SetEditorModals({
  exercisePlan,
  editRest,
  editingRest,
}: SetEditorModalsProps) {
  return (
    <>
      <EditRestDuration
        {...editingRest}
        duration={exercisePlan.rest}
        onUpdateDuration={editRest}
      />
    </>
  );
}
