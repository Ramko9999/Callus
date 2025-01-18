import {
  WorkoutPlan,
  Workout,
  Trend,
  SearchExerciseSummary,
  Exercise,
  Routine,
} from "@/interface";
import { addDays, truncTime } from "@/util/date";
import { Store } from "./store";
import * as TrendApi from "./metric/trend";
import { ArrayUtils } from "@/util/misc";

export class WorkoutApi {
  static async getWorkouts(localDate: number): Promise<Workout[]> {
    return await Store.instance().getWorkouts(localDate, addDays(localDate, 1));
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

  static async saveRoutine(routine: Routine): Promise<void> {
    await Store.instance().saveRoutine(routine);
  }

  static async deleteRoutine(routineId: string): Promise<void> {
    await Store.instance().deleteRoutine(routineId);
  }

  static getWorkoutId(date: number, workoutPlan: WorkoutPlan) {
    return `${new Date(truncTime(date)).toISOString()}-${workoutPlan.name}`;
  }

  static async getInProgressWorkout(): Promise<Workout | undefined> {
    return await Store.instance().getInProgressWorkout();
  }

  static async getExportableWorkouts(): Promise<Workout[]> {
    return await Store.instance().getAllWorkouts();
  }

  static async getExportableRoutines(): Promise<Routine[]> {
    return await Store.instance().getRoutines();
  }

  static async importWorkouts(workouts: Workout[]): Promise<void> {
    await Store.instance().saveWorkouts(workouts);
  }

  static async importRoutines(routines: Routine[]): Promise<void> {
    await Store.instance().saveRoutines(routines);
  }

  static async getWorkedOutDays(before: number, after: number) {
    return await Store.instance().getWorkedOutDays(before, after);
  }

  static async getLifetimeStats() {
    return await Store.instance().getLifetimeStats();
  }

  static async getTrends(after: number): Promise<Trend[]> {
    const completedExercises = await Store.instance().getAllCompletedExercises(
      after
    );
    return TrendApi.getTrends(completedExercises);
  }

  static async getExerciseSummaries(): Promise<SearchExerciseSummary[]> {
    const completedExercises = await Store.instance().getAllCompletedExercises(
      0
    );
    return ArrayUtils.groupBy(completedExercises, ({ name }) => name).map(
      ({ key, items }) => ({
        name: key,
        totalSetsCompleted: items
          .flatMap((item) => item.sets.length)
          .reduce((total, current) => current + total),
      })
    );
  }

  static async getExerciseCompletions(
    exerciseName: string
  ): Promise<Exercise[]> {
    return await Store.instance().getAllCompletedExercise(0, exerciseName);
  }

  static async getCompletedWorkoutsBefore(before: number): Promise<number> {
    return await Store.instance().getCompletedWorkoutCountsBefore(before);
  }
}
