import { InputsPadProvider } from "@/components/util/popup/inputs-pad/context";
import { BottomSheet, BottomSheetRef } from "@/components/util/popup/sheet";
import { useTabBar } from "@/components/util/tab-bar/context";
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
import { useEffect, useRef, useState } from "react";
import { useWindowDimensions, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import {
  ExerciseEditorContent,
  ExerciseEditorModals,
  SetEditorContent,
} from "./core";
import { StyleUtils, WORKOUT_PLAYER_EDITOR_HEIGHT } from "@/util/styles";
import { View } from "@/components/Themed";

const historicalEditorSheetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
  },
});

type HistoricalEditorSheetProps = {
  show: boolean;
  hide: () => void;
  workout: Workout;
  onSave: (workout: Workout) => void;
  onRepeat: (workout: Workout) => void;
  trash: () => void;
};

export function HistoricalEditorSheet({
  show,
  hide,
  workout,
  onSave,
  onRepeat,
  trash,
}: HistoricalEditorSheetProps) {
  const tabBarActions = useTabBar();

  useEffect(() => {
    if (show) {
      tabBarActions.close();
    } else {
      tabBarActions.open();
    }
  }, [show]);

  const [exerciseId, setExerciseId] = useState<string>();
  const exercise = workout.exercises.find(({ id }) => exerciseId === id);

  const [isTrashingWorkout, setIsTrashingWorkout] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isEditingTimes, setIsEditingTimes] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const bottomSheetRef = useRef<BottomSheetRef>(null);

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
    <InputsPadProvider>
      <BottomSheet
        show={show}
        onBackdropPress={hide}
        hide={hide}
        ref={bottomSheetRef}
      >
        <View
          style={[
            historicalEditorSheetStyles.container,
            { height: WORKOUT_PLAYER_EDITOR_HEIGHT * height },
          ]}
        >
          {exerciseId ? (
            <SetEditorContent
              exercise={exercise as Exercise}
              onNote={onNote}
              onRemove={onRemoveSet}
              onAdd={onAddSet}
              onUpdate={onUpdateSet}
              close={() => setExerciseId(undefined)}
            />
          ) : (
            <ExerciseEditorContent
              isReordering={isReordering}
              workout={workout}
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
          )}
        </View>
      </BottomSheet>
      <ExerciseEditorModals
        add={onAddExercise}
        trash={trash}
        updateMeta={onUpdateMeta}
        repeat={onRepeat}
        workout={workout}
        finder={{
          show: isAddingExercise,
          hide: () => setIsAddingExercise(false),
        }}
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
    </InputsPadProvider>
  );
}
