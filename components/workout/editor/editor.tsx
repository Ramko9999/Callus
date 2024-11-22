import {
  Exercise,
  Workout,
  Set,
  ExerciseMeta,
  WorkoutMetadata,
} from "@/interface";
import { View } from "@/components/Themed";
import { BottomSheet } from "@/components/bottom-sheet";
import { useState } from "react";
import Animated, { FadeInLeft } from "react-native-reanimated";
import {
  addExercise,
  duplicateLastSet,
  removeExercise,
  removeSet,
  updateSet,
  updateWorkout,
} from "@/context/WorkoutContext";
import { SetsEditor } from "./sets";
import { ExercisesEditor } from "./exercises";

type EditorProps = {
  workout: Workout;
  hide: () => void;
  onDelete: () => void;
  onSaveWorkout: (workout: Workout) => void;
};

export function Editor({
  workout,
  hide,
  onSaveWorkout,
  onDelete,
}: EditorProps) {
  const [exerciseId, setExerciseId] = useState<string>();
  const isEditingExercise = exerciseId != undefined;
  const editedExercise = workout.exercises.find(({ id }) => id === exerciseId);

  const onAddSet = () => {
    onSaveWorkout(duplicateLastSet(exerciseId as string, workout));
  };

  const onRemoveSet = (setId: string) => {
    onSaveWorkout(removeSet(setId, workout));
  };

  const onUpdateSet = (setId: string, update: Partial<Set>) => {
    onSaveWorkout(updateSet(setId, update, workout));
  };

  const onRemoveExercise = (exercise: Exercise) => {
    onSaveWorkout(removeExercise(exercise.id, workout));
  };

  const onAddExercise = (meta: ExerciseMeta) => {
    onSaveWorkout(addExercise(meta, workout));
  };

  const onReorderExercises = (exercises: Exercise[]) => {
    onSaveWorkout({ ...workout, exercises });
  };

  const onUpdateMeta = (meta: Partial<WorkoutMetadata>) => {
    onSaveWorkout(updateWorkout({ ...meta }, workout));
  };

  return (
    <View background>
      {isEditingExercise ? (
        <Animated.View entering={FadeInLeft}>
          <SetsEditor
            onAddSet={onAddSet}
            onRemoveSet={onRemoveSet}
            onUpdateSet={onUpdateSet}
            back={() => setExerciseId(undefined)}
            exercise={editedExercise as Exercise}
          />
        </Animated.View>
      ) : (
        <ExercisesEditor
          onEditMeta={onUpdateMeta}
          onAdd={onAddExercise}
          onEdit={({ id }) => {
            setExerciseId(id);
          }}
          onReorder={onReorderExercises}
          onRemove={onRemoveExercise}
          workout={workout}
          hide={hide}
          trash={onDelete}
        />
      )}
    </View>
  );
}

type EditorPopupProps = {
  show: boolean;
  hide: () => void;
  workout: Workout;
  onSaveWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workoutId: string) => void;
};

export function EditorPopup({
  show,
  hide,
  workout,
  onSaveWorkout,
  onDeleteWorkout,
}: EditorPopupProps) {
  return (
    <BottomSheet show={show} onBackdropPress={hide} hide={hide}>
      <Editor
        workout={workout}
        onSaveWorkout={onSaveWorkout}
        hide={hide}
        onDelete={() => {
          onDeleteWorkout(workout.id);
        }}
      />
    </BottomSheet>
  );
}
