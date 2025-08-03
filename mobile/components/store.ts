import { DifficultyType, ExerciseMeta, Workout } from "@/interface";
import { create } from "zustand";

type ExercisesStore = {
  exercises: ExerciseMeta[];
  addExercise: (exercise: ExerciseMeta) => void;
  addExercises: (exercises: ExerciseMeta[]) => void;
  removeExercise: (metaId: string) => void;
  setExercises: (exercises: ExerciseMeta[]) => void;
};

export const useExercisesStore = create<ExercisesStore>((set) => ({
  exercises: [],
  addExercise: (exercise) => {
    set((state) => {
      const newExercises = state.exercises.filter(
        (e) => e.metaId !== exercise.metaId
      );
      newExercises.push(exercise);
      return { exercises: newExercises };
    });
  },
  addExercises: (exercises) => {
    set((state) => {
      const newExercises = state.exercises.filter(
        (e) => !exercises.some((ex) => ex.metaId === e.metaId)
      );
      newExercises.push(...exercises);
      return { exercises: newExercises };
    });
  },
  setExercises: (exercises) => set({ exercises }),
  removeExercise: (metaId) =>
    set((state) => ({
      exercises: state.exercises.filter((e) => e.metaId !== metaId),
    })),
}));

export const ExerciseStoreSelectors = {
  getExercise: (metaId: string, state: ExercisesStore) =>
    state.exercises.find((e) => e.metaId === metaId)!,
  getMetaIdToDifficultyType: (state: ExercisesStore) =>
    state.exercises.reduce((acc, exercise) => {
      acc[exercise.metaId] = exercise.difficultyType;
      return acc;
    }, {} as Record<string, DifficultyType>),
  getMetaIdToExercise: (state: ExercisesStore) =>
    state.exercises.reduce((acc, exercise) => {
      acc[exercise.metaId] = exercise;
      return acc;
    }, {} as Record<string, ExerciseMeta>),
};


type LiveWorkoutStore = {
  workout: Workout | undefined;
  setWorkout: (workout: Workout | undefined) => void;
}

export const useLiveWorkoutStore = create<LiveWorkoutStore>((set) => ({
  workout: undefined,
  setWorkout: (workout) => set({ workout }),
}));