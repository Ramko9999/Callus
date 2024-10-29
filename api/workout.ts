import { WorkoutPlan, Workout } from "@/interface";
import {  addDays, truncTime } from "@/util";
import { ProgramApi } from "./program";
import { Store } from "./store";

export type WorkoutItinerary = {
  workouts: Workout[];
  workoutPlans: WorkoutPlan[];
};

export class WorkoutApi {
  static async getWorkoutItinerary(
    localDate: number
  ): Promise<WorkoutItinerary> {
    const workouts = await Store.instance().getWorkoutsBetweenTime(localDate, addDays(localDate, 1));
    const workoutIds = new Set(workouts.map((workout) => workout.id));

    const workoutPlans = (await ProgramApi.getWorkoutPlans(localDate)).filter(
      (workoutPlan) =>
        !workoutIds.has(this.getWorkoutId(localDate, workoutPlan))
    );
    return { workouts, workoutPlans };
  }

  static async saveWorkout(workout: Workout): Promise<void> {
    await Store.instance().saveWorkout(workout);
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

  static async importWorkouts(workouts: Workout[]): Promise<void> {
    await Store.instance().saveWorkouts(workouts);
  } 
}
