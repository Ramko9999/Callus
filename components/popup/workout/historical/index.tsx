import { InputsPadProvider } from "@/components/util/popup/inputs-pad/context";
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
  Exercise,
  ExerciseMeta,
  Workout,
  WorkoutMetadata,
  Set,
} from "@/interface";
import { useRef, useState } from "react";
import { StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import {
  ExerciseEditorContent,
  ExerciseEditorModals,
  SetEditorContent,
} from "./editor/core";
import { StyleUtils } from "@/util/styles";
import { View } from "@/components/Themed";
import {
  FullBottomSheet,
  FullBottomSheetRef,
} from "@/components/util/popup/sheet/full";
import {
  ExerciseSearcherContent,
  ExerciseSearcherFiltersState,
  ExerciseSearcherModals,
} from "../common/exercise/add";

const historicalEditorSheetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "6%",
    flex: 1,
  },
});

type HistoricalEditorSheetProps = {
  show: boolean;
  hide: () => void;
  workout: Workout;
  onSave: (workout: Workout) => void;
  canRepeat: boolean;
  onRepeat: (workout: Workout) => void;
  trash: () => Promise<void>;
};

export function HistoricalEditorSheet({
  show,
  hide,
  workout,
  onSave,
  canRepeat,
  onRepeat,
  trash,
}: HistoricalEditorSheetProps) {
  const [exerciseId, setExerciseId] = useState<string>();
  const exercise = workout.exercises.find(({ id }) => exerciseId === id);

  const [isTrashingWorkout, setIsTrashingWorkout] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isEditingTimes, setIsEditingTimes] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [exerciseFiltersState, setExerciseFiltersState] =
    useState<ExerciseSearcherFiltersState>({ showFilters: false });
  const sheetRef = useRef<FullBottomSheetRef>(null);

  const onHide = () => {
    setExerciseId(undefined);
    hide();
  };

  const onRemoveExercise = (exerciseId: string) => {
    onSave(removeExercise(exerciseId, workout));
  };

  const onAddExercises = (metas: ExerciseMeta[]) => {
    let updatedWorkout = JSON.parse(JSON.stringify(workout));
    metas.forEach((meta) => {
      updatedWorkout = addExercise(meta, updatedWorkout);
    });
    onSave(updatedWorkout);
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
          onAdd={onAddExercises}
        />
      );
    }
    if (exerciseId) {
      return (
        <SetEditorContent
          exercise={exercise as Exercise}
          onNote={onNote}
          onRemove={onRemoveSet}
          onAdd={onAddSet}
          onUpdate={onUpdateSet}
          close={() => setExerciseId(undefined)}
        />
      );
    }
    return (
      <ExerciseEditorContent
        isReordering={isReordering}
        workout={workout}
        onClose={() => sheetRef.current?.hideSheet()}
        onStartReordering={() => {
          setIsReordering(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        onDoneReordering={() => {
          setIsReordering(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        onAdd={() => {
          setIsAddingExercise(true);
        }}
        onTrash={() => {
          setIsTrashingWorkout(true);
        }}
        onRepeat={() => {
          setIsRepeating(true);
        }}
        onSelect={(exercise) => setExerciseId(exercise.id)}
        onRemove={onRemoveExercise}
        onReorder={onReorderExercises}
        onUpdateMeta={onUpdateMeta}
        onEditTimes={() => setIsEditingTimes(true)}
      />
    );
  };

  const renderModals = () => {
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
    return (
      <ExerciseEditorModals
        trash={() => trash().then(() => sheetRef.current?.hideSheet())}
        updateMeta={onUpdateMeta}
        repeat={(workout) => {
          if (canRepeat) {
            onRepeat(workout);
            sheetRef.current?.hideSheet();
          }
        }}
        workout={workout}
        trashConfirmation={{
          show: isTrashingWorkout,
          hide: () => setIsTrashingWorkout(false),
        }}
        adjustTimes={{
          show: isEditingTimes,
          hide: () => setIsEditingTimes(false),
        }}
        repeatConfirmation={{
          show: isRepeating,
          hide: () => setIsRepeating(false),
        }}
      />
    );
  };

  return (
    <InputsPadProvider>
      <FullBottomSheet ref={sheetRef} show={show} onHide={onHide}>
        <View style={historicalEditorSheetStyles.container}>
          {renderContent()}
        </View>
      </FullBottomSheet>
      {renderModals()}
    </InputsPadProvider>
  );
}
