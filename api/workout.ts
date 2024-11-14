import { WorkoutPlan, Workout } from "@/interface";
import {  addDays, truncTime } from "@/util";
import { ProgramApi } from "./program";
import { Store } from "./store";

export type WorkoutItinerary = {
  workouts: Workout[];
  workoutPlans: WorkoutPlan[];
};

export class WorkoutApi {

  static async getWorkouts(
    localDate: number
  ): Promise<Workout[]> {
    return await Store.instance().getWorkouts(localDate, addDays(localDate, 1));
  }

  static async saveWorkout(workout: Workout): Promise<void> {
    await Store.instance().saveWorkout(workout);
  }

  static async deleteWorkout(workoutId: string): Promise<void>{
    await Store.instance().deleteWorkout(workoutId);
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
