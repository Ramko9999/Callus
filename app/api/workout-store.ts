import { NECK, PUSH, PULL, LEG, BLANK, PULL_INSTANTIATION } from "@/constants/SampleWorkouts";
import { WorkoutPlan, Workout } from "@/interface";
import { truncTime, truncTimeUtc } from "@/util";

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
    const d = new Date(date);
    return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
  }

  async saveWorkout(workout: Workout): Promise<void> {
    const partitionKey = this.getPartitionKey(workout.startedAt);
    const workouts = this.workoutStore.get(partitionKey) ?? [];
    const updatedWorkouts = workouts.filter(({ id }) => id !== workout.id);
    updatedWorkouts.push(workout);
    return new Promise((resolve) => {
      console.info(`[IN-MEMORY-WORKOUT-STORE] Saving workout ${partitionKey} ${workout.id}`);
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
    console.info(`[IN-MEMORY-WORKOUT-STORE] Getting workouts ${partitionKey}`)
    const workouts = this.workoutStore.get(partitionKey) ?? [];
    return new Promise((resolve) =>
      resolve(
        workouts.filter(
          ({ startedAt }) => truncTimeUtc(startedAt) === truncTimeUtc(date)
        )
      )
    );
  }
}

export type WorkoutItinerary = {
  workouts: Workout[],
  workoutPlans: WorkoutPlan[]
}

export class WorkoutStoreApi {

  static async getWorkoutItineray(date: number): Promise<WorkoutItinerary> {
    const workouts = await InMemoryWorkoutStore.instance().getWorkouts(date);
    const workoutIds = new Set(workouts.map((workout) => workout.id));

    const workoutPlans = this.getWorkoutPlans(date).filter((workoutPlan) => !workoutIds.has(this.getWorkoutId(date, workoutPlan)));
    return {workouts, workoutPlans}
  }

  private static getWorkoutPlans(date: number): WorkoutPlan[] {
    const dayType = new Date(date).getDate() % 4;
    return DAY_TO_PLAN[dayType];
  }

  static async getWorkouts(date: number): Promise<Workout[]> {
    return await InMemoryWorkoutStore.instance().getWorkouts(date);
  }

  static async saveWorkout(workout: Workout): Promise<void> {
    await InMemoryWorkoutStore.instance().saveWorkout(workout);
  }

  static getWorkoutId(date: number, workoutPlan: WorkoutPlan) {
    return `${new Date(truncTimeUtc(date)).toISOString()}-${workoutPlan.name}`
  }
}
