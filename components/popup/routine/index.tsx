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
import {
  ExerciseSearcherContent,
  ExerciseSearcherFiltersState,
  ExerciseSearcherModals,
} from "../workout/common/exercise/add";

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

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>();

  const exercise =
    selectedExerciseId != undefined
      ? routine.plan.find(({ id }) => id === selectedExerciseId)
      : undefined;

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEditingRest, setIsEditingRest] = useState(false);
  const [exerciseFiltersState, setExerciseFiltersState] =
    useState<ExerciseSearcherFiltersState>({ showFilters: false });

  const exercisePlanActions = ExercisePlanActions(routine);
  const setPlanActions = SetPlanActions(routine, selectedExerciseId as string);

  const renderContent = () => {
    if (isAddingExercise) {
      return (
        <ExerciseSearcherContent
          muscleFilter={exerciseFiltersState.muscleFilter}
          exerciseTypeFilter={exerciseFiltersState.exerciseTypeFilter}
          onClose={() => {
            setIsAddingExercise(false);
            setExerciseFiltersState({ showFilters: false });
          }}
          onEditFilters={() =>
            setExerciseFiltersState((s) => ({ ...s, showFilters: true }))
          }
          onAdd={(metas) => onSave(exercisePlanActions.add(metas))}
        />
      );
    }

    if (selectedExerciseId) {
      return (
        <SetEditorContent
          onAdd={() => onSave(setPlanActions.add())}
          onRemove={(id) => onSave(setPlanActions.remove(id))}
          onUpdate={(id, update) => onSave(setPlanActions.update(id, update))}
          onEditRest={() => setIsEditingRest(true)}
          close={() => setSelectedExerciseId(undefined)}
          exercise={exercise as ExercisePlan}
        />
      );
    } else {
      return (
        <ExerciseEditorContent
          isReordering={false}
          routine={routine}
          onClose={() => sheetRef.current?.hideSheet()}
          onStartReordering={() => {}}
          onDoneReordering={() => {}}
          onAdd={() => setIsAddingExercise(true)}
          onRemove={(id) => {
            onSave(exercisePlanActions.remove(id));
          }}
          onSelect={(id) => setSelectedExerciseId(id)}
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
      );
    }
  };

  const renderModal = () => {
    if (isAddingExercise) {
      return (
        <ExerciseSearcherModals
          exerciseSearcherFilters={{
            show: exerciseFiltersState.showFilters,
            hide: () =>
              setExerciseFiltersState((s) => ({ ...s, showFilters: false })),
          }}
          muscleFilter={exerciseFiltersState.muscleFilter}
          exerciseTypeFilter={exerciseFiltersState.exerciseTypeFilter}
          onUpdateExerciseTypeFilter={(exerciseTypeFilter) =>
            setExerciseFiltersState((s) => ({ ...s, exerciseTypeFilter }))
          }
          onUpdateMuscleFilter={(muscleFilter) =>
            setExerciseFiltersState((s) => ({ ...s, muscleFilter }))
          }
        />
      );
    }

    if (selectedExerciseId) {
      return (
        <SetEditorModals
          exercisePlan={exercise as ExercisePlan}
          editRest={(rest) =>
            onSave(
              exercisePlanActions.update(selectedExerciseId, {
                rest,
              })
            )
          }
          editingRest={{
            show: isEditingRest,
            hide: () => setIsEditingRest(false),
          }}
        />
      );
    } else {
      return (
        <ExerciseEditorModals
          trash={() => onTrash().then(() => sheetRef.current?.hideSheet())}
          start={() => {
            if (canStart) {
              onStart();
              sheetRef.current?.hideSheet();
            }
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
      );
    }
  };

  return (
    <>
      <InputsPadProvider>
        <FullBottomSheet
          show={show}
          onHide={() => {
            setSelectedExerciseId(undefined);
            onHide();
          }}
          ref={sheetRef}
        >
          <View style={routineEditorSheetStyles.container}>
            {renderContent()}
          </View>
        </FullBottomSheet>
      </InputsPadProvider>
      {renderModal()}
    </>
  );
}
