import {
  Workout,
  SearchExerciseSummary,
  Routine,
  CompletedExercise,
  WorkedOutDay,
} from "@/interface";
import { addDays } from "@/util/date";
import { Store } from "./store";
import { ArrayUtils } from "@/util/misc";
import { CustomExercise } from "./model/custom-exercise";
import { saveCustomExerciseImage } from "./store/fs";

export class WorkoutApi {
  static async getWorkouts(localDate: number): Promise<Workout[]> {
    return await Store.instance().getWorkouts(localDate, addDays(localDate, 1));
  }

  static async getWorkoutsFromRange(
    before: number,
    after: number
  ): Promise<Workout[]> {
    return await Store.instance().getWorkouts(before, after);
  }

  static async saveWorkout(workout: Workout): Promise<void> {
    await Store.instance().saveWorkout(workout);
  }

  static async deleteWorkout(workoutId: string): Promise<void> {
    await Store.instance().deleteWorkout(workoutId);
  }

  static async getRoutines(): Promise<Routine[]> {
    return Store.instance().getRoutines();
  }

  static getRoutine(routineId: string): Promise<Routine> {
    return Store.instance().getRoutine(routineId);
  }

  static async saveRoutine(routine: Routine): Promise<void> {
    await Store.instance().saveRoutine(routine);
  }

  static async deleteRoutine(routineId: string): Promise<void> {
    await Store.instance().deleteRoutine(routineId);
  }

  static async getInProgressWorkout(): Promise<Workout | undefined> {
    return await Store.instance().getInProgressWorkout();
  }

  static async getWorkout(workoutId: string): Promise<Workout> {
    return await Store.instance().getWorkout(workoutId);
  }

  static async getExportableWorkouts(): Promise<Workout[]> {
    return await Store.instance().getAllWorkouts();
  }

  static async getExportableRoutines(): Promise<Routine[]> {
    return await Store.instance().getRoutines();
  }

  static async getExportableCustomExercises(): Promise<CustomExercise[]> {
    return await Store.instance().getCustomExercises();
  }

  static async getWorkedOutDays(
    before: number,
    after: number
  ): Promise<WorkedOutDay[]> {
    return await Store.instance().getWorkedOutDays(before, after);
  }

  static async getLifetimeStats() {
    return await Store.instance().getLifetimeStats();
  }

  static async getExerciseSummaries(): Promise<SearchExerciseSummary[]> {
    const completedExercises = await Store.instance().getAllCompletedExercises(
      0,
      Date.now()
    );
    return ArrayUtils.groupBy(completedExercises, ({ metaId }) => metaId).map(
      ({ key, items }) => ({
        metaId: key,
        totalSetsCompleted: items
          .flatMap((item) => item.sets.length)
          .reduce((total, current) => current + total),
      })
    );
  }

  static async getAllExerciseCompletions(
    after: number,
    before: number
  ): Promise<CompletedExercise[]> {
    return await Store.instance().getAllCompletedExercises(after, before);
  }

  static async getExerciseCompletions(
    metaId: string
  ): Promise<CompletedExercise[]> {
    return await Store.instance().getAllCompletedExercise(0, metaId);
  }

  static async getCompletedWorkoutsBefore(before: number): Promise<number> {
    return await Store.instance().getCompletedWorkoutCountsBefore(before);
  }

  static async getRecentlyCompletedWorkouts(): Promise<Workout[]> {
    const allWorkouts = await Store.instance().getRecentlyCompletedWorkouts();

    const seen = new Set<string>();

    return [...allWorkouts]
      .sort((a, b) => b.startedAt - a.startedAt)
      .filter((workout) => {
        const name = workout.name || "Unnamed workout";
        if (seen.has(name)) {
          return false;
        }
        seen.add(name);
        return true;
      });
  }

  static async saveCustomExercise(
    exercise: CustomExercise,
    sourceImageUri?: string
  ): Promise<void> {
    if (sourceImageUri) {
      await saveCustomExerciseImage(sourceImageUri, exercise.id);
    }
    await Store.instance().saveCustomExercise(exercise);
  }

  static async deleteCustomExercise(id: string): Promise<void> {
    await Store.instance().deleteAllPerformedExercises(id);
    await Store.instance().deleteCustomExercise(id);
  }
}
