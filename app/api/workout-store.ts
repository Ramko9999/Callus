import { WorkoutPlan, Workout } from "@/interface";
import { addDays, Period, truncTime, truncTimeUtc } from "@/util";
import { ProgramStoreApi } from "./program-store";

let SINGLETON_STORE: InMemoryWorkoutStore;

class InMemoryWorkoutStore {
  workoutStore: Map<string, Workout[]>;

  constructor() {
    this.workoutStore = new Map<string, Workout[]>();
  }

  private getPartitionKey(date: number): string {
    const d = new Date(date);
    return `${d.getUTCFullYear()}`;
  }

  async saveWorkout(workout: Workout): Promise<void> {
    const partitionKey = this.getPartitionKey(workout.startedAt);
    const workouts = this.workoutStore.get(partitionKey) ?? [];
    const updatedWorkouts = workouts.filter(({ id }) => id !== workout.id);
    updatedWorkouts.push(workout);
    return new Promise((resolve) => {
      console.info(
        `[IN-MEMORY-WORKOUT-STORE] Saving workout ${partitionKey} ${workout.id}`
      );
      this.workoutStore.set(partitionKey, updatedWorkouts);
      resolve();
    });
  }

  static instance(): InMemoryWorkoutStore {
    SINGLETON_STORE = SINGLETON_STORE ?? new InMemoryWorkoutStore();
    return SINGLETON_STORE;
  }

  async getWorkouts(date: number): Promise<Workout[]> {
    const partitionKey = this.getPartitionKey(date); // check the next year or you will have a bug in 2025
    console.info(`[IN-MEMORY-WORKOUT-STORE] Getting workouts ${partitionKey}`);
    const workouts = this.workoutStore.get(partitionKey) ?? [];
    return new Promise((resolve) =>
      resolve(
        workouts.filter(
          ({ startedAt }) => startedAt >= date && startedAt < addDays(date, 1)
        )
      )
    );
  }
}

export type WorkoutItinerary = {
  workouts: Workout[];
  workoutPlans: WorkoutPlan[];
};

export class WorkoutStoreApi {
  static async getWorkoutItinerary(
    localDate: number
  ): Promise<WorkoutItinerary> {
    console.log(
      `[WORKOUT-STORE-API] Getting itinerary for date ${new Date(localDate)}`
    );
    const workouts = await InMemoryWorkoutStore.instance().getWorkouts(
      localDate
    );
    console.log(workouts);
    const workoutIds = new Set(workouts.map((workout) => workout.id));

    const workoutPlans = ProgramStoreApi.getWorkoutPlans(localDate).filter(
      (workoutPlan) => !workoutIds.has(this.getWorkoutId(localDate, workoutPlan))
    );
    console.log(workoutPlans);
    return { workouts, workoutPlans };
  }

  static async getWorkouts(date: number): Promise<Workout[]> {
    return await InMemoryWorkoutStore.instance().getWorkouts(date);
  }

  static async saveWorkout(workout: Workout): Promise<void> {
    await InMemoryWorkoutStore.instance().saveWorkout(workout);
  }

  static getWorkoutId(date: number, workoutPlan: WorkoutPlan) {
    return `${new Date(truncTime(date)).toISOString()}-${workoutPlan.name}`;
  }

  static async getInProgressWorkout(): Promise<Workout | undefined> {
    const date = Date.now();
    const workouts = (
      await InMemoryWorkoutStore.instance().getWorkouts(date)
    ).filter((workout) => workout.endedAt === undefined);
    if (workouts.length > 0) {
      return workouts.at(0);
    }
  }
}
