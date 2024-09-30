import { NECK, PUSH, PULL, LEG, BLANK, PULL_INSTANTIATION } from "@/constants/SampleWorkouts";
import { WorkoutPlan, Workout } from "@/interface";
import { truncTime } from "@/util";
import * as FS from "expo-file-system";

const PUSH_DAY: WorkoutPlan[] = [PUSH, NECK];
const PULL_DAY: WorkoutPlan[] = [PULL, NECK];
const LEG_DAY: WorkoutPlan[] = [LEG];
const REST: WorkoutPlan[] = [];

const DAY_TO_PLAN = [PUSH_DAY, PULL_DAY, LEG_DAY, REST];

let SINGLETON_STORE: InMemoryWorkoutStore;

class InMemoryWorkoutStore {
  workoutStore: Map<string, Workout[]>;

  constructor() {
    this.workoutStore = new Map<string, Workout[]>();
  }

  private getPartitionKey(date: number): string {
    const d = new Date(truncTime(date));
    return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
  }

  async saveWorkout(workout: Workout): Promise<void> {
    const partitionKey = this.getPartitionKey(workout.startedAt);
    const workouts = this.workoutStore.get(partitionKey) ?? [];
    const updatedWorkouts = workouts.filter(({ id }) => id !== workout.id);
    updatedWorkouts.push(workout);
    return new Promise((resolve) => {
      console.info(`[IN-MEMORY-WORKOUT-STORE] Saving workout ${workout.id}`);
      this.workoutStore.set(partitionKey, updatedWorkouts);
      resolve();
    });
  }

  static instance(): InMemoryWorkoutStore {
    SINGLETON_STORE = SINGLETON_STORE ?? new InMemoryWorkoutStore();
    return SINGLETON_STORE;
  }

  async getWorkouts(date: number): Promise<Workout[]> {
    const partitionKey = this.getPartitionKey(date);
    console.log(date, this.workoutStore);
    const workouts = this.workoutStore.get(partitionKey) ?? [];
    return new Promise((resolve) =>
      resolve(
        workouts.filter(
          ({ startedAt }) => truncTime(startedAt) === truncTime(date)
        )
      )
    );
  }
}

export class WorkoutStoreApi {
  static async getPlannedWorkouts(date: number): Promise<WorkoutPlan[]> {
    return new Promise((resolve) => {
      const dayType = new Date(date).getDate() % 4;
      resolve(DAY_TO_PLAN[dayType]);
    });
  }

  static async getWorkouts(date: number): Promise<Workout[]> {
    return await InMemoryWorkoutStore.instance().getWorkouts(date);
  }

  static async saveWorkout(workout: Workout): Promise<void> {
    await InMemoryWorkoutStore.instance().saveWorkout(workout);
  }
}
