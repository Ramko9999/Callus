import {
  FullBottomSheet,
  FullBottomSheetRef,
} from "@/components/util/popup/sheet/full";
import { ExercisePlan, Routine } from "@/interface";
import {
  ExerciseEditorContent,
  ExerciseEditorModals,
  SetEditorContent,
  SetEditorModals,
} from "./editor/core";
import { StyleSheet } from "react-native";
import { useRef, useState } from "react";
import { StyleUtils } from "@/util/styles";
import { View } from "@/components/Themed";
import { ExercisePlanActions, SetPlanActions } from "@/api/model/routine";
import React from "react";
import { InputsPadProvider } from "@/components/util/popup/inputs-pad/context";

const routineEditorSheetStyles = StyleSheet.create({
  container: {
    paddingTop: "6%",
    flex: 1,
    ...StyleUtils.flexColumn(),
  },
});

type RoutineEditorSheetProps = {
  show: boolean;
  routine: Routine;
  onHide: () => void;
  onStart: () => void;
  canStart: boolean;
  onSave: (routine: Routine) => void;
  onTrash: () => Promise<void>;
};

export function RoutineEditorSheet({
  show,
  onHide,
  routine,
  canStart,
  onSave,
  onStart,
  onTrash,
}: RoutineEditorSheetProps) {
  const sheetRef = useRef<FullBottomSheetRef>(null);

  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>();

  const exercise =
    selectedExerciseIndex != undefined
      ? routine.plan[selectedExerciseIndex]
      : undefined;

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEditingRest, setIsEditingRest] = useState(false);

  const exercisePlanActions = ExercisePlanActions(routine);
  const setPlanActions = SetPlanActions(
    routine,
    selectedExerciseIndex as number
  );

  return (
    <>
      <InputsPadProvider>
        <FullBottomSheet show={show} onHide={onHide} ref={sheetRef}>
          <View style={routineEditorSheetStyles.container}>
            {selectedExerciseIndex == undefined ? (
              <ExerciseEditorContent
                isReordering={false}
                routine={routine}
                onClose={() => sheetRef.current?.hideSheet()}
                onStartReordering={() => {}}
                onDoneReordering={() => {}}
                onAdd={() => setIsAddingExercise(true)}
                onRemove={(index) => {
                  onSave(exercisePlanActions.remove(index));
                }}
                onSelect={(index) => setSelectedExerciseIndex(index)}
                onReorder={(newPlan) => {
                  onSave({ ...routine, plan: newPlan });
                }}
                onTrash={() => setIsDeleting(true)}
                onStart={() => {
                  setIsStarting(true);
                }}
                onUpdateMeta={(meta) => {
                  onSave({ ...routine, ...meta });
                }}
              />
            ) : (
              <SetEditorContent
                onAdd={() => onSave(setPlanActions.add())}
                onRemove={(index) => onSave(setPlanActions.remove(index))}
                onUpdate={(index, update) =>
                  onSave(setPlanActions.update(index, update))
                }
                onEditRest={() => setIsEditingRest(true)}
                close={() => setSelectedExerciseIndex(undefined)}
                exercise={exercise as ExercisePlan}
              />
            )}
          </View>
        </FullBottomSheet>
      </InputsPadProvider>
      {selectedExerciseIndex == undefined ? (
        <ExerciseEditorModals
          add={(meta) => onSave(exercisePlanActions.add(meta))}
          trash={() => onTrash().then(() => sheetRef.current?.hideSheet())}
          start={() => {
            if (canStart) {
              onStart();
              sheetRef.current?.hideSheet();
            }
          }}
          finder={{
            show: isAddingExercise,
            hide: () => setIsAddingExercise(false),
          }}
          trashConfirmation={{
            show: isDeleting,
            hide: () => setIsDeleting(false),
          }}
          startConfirmation={{
            show: isStarting,
            hide: () => setIsStarting(false),
          }}
        />
      ) : (
        <SetEditorModals
          exercisePlan={exercise as ExercisePlan}
          editRest={(rest) =>
            onSave(
              exercisePlanActions.update(selectedExerciseIndex, {
                rest,
              })
            )
          }
          editingRest={{
            show: isEditingRest,
            hide: () => setIsEditingRest(false),
          }}
        />
      )}
    </>
  );
}
