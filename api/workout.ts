import { WorkoutPlan, Workout } from "@/interface";
import { addDays, truncTime } from "@/util";
import { STORAGE_NAMESPACE } from "@/constants";
import { ProgramApi } from "./program";
import {Store, DiskStore} from "./disk-store";

let SINGLETON_STORE_API: WorkoutStoreApi;

class WorkoutStoreApi {
  store: Store<Workout[]>;

  constructor(store: Store<Workout[]>) {
    this.store = store;
  }

  private getPartitionKey(date: number): string {
    const d = new Date(date);
    return `${d.getUTCFullYear()}-${d.getMonth()}`;
  }

  async saveWorkout(workout: Workout): Promise<void> {
    const partitionKey = this.getPartitionKey(workout.startedAt);
    const workouts = await this.store.read(partitionKey, []);
    const updatedWorkouts = workouts.filter(({ id }) => id !== workout.id);
    updatedWorkouts.push(workout);
    await this.store.write(partitionKey, updatedWorkouts);
  }

  static instance(): WorkoutStoreApi {
    SINGLETON_STORE_API =

    SINGLETON_STORE_API ?? new WorkoutStoreApi(new DiskStore(STORAGE_NAMESPACE));
    return SINGLETON_STORE_API;
  }

  async getWorkouts(date: number): Promise<Workout[]> {
    const partitionKey = this.getPartitionKey(date); // todo(): check the next month or you will have a bug on month end
    const workouts = await this.store.read(partitionKey, []);
    return workouts.filter(
      ({ startedAt }) => startedAt >= date && startedAt < addDays(date, 1)
    )
  }
}

export type WorkoutItinerary = {
  workouts: Workout[];
  workoutPlans: WorkoutPlan[];
};

export class WorkoutApi {
  static async getWorkoutItinerary(
    localDate: number
  ): Promise<WorkoutItinerary> {
    console.log(
      `[WORKOUT-API] Getting itinerary for date ${new Date(localDate)}`
    );
    const workouts = await WorkoutStoreApi.instance().getWorkouts(localDate);
    const workoutIds = new Set(workouts.map((workout) => workout.id));

    const workoutPlans = (await ProgramApi.getWorkoutPlans(localDate)).filter(
      (workoutPlan) =>
        !workoutIds.has(this.getWorkoutId(localDate, workoutPlan))
    );
    return { workouts, workoutPlans };
  }

  static async saveWorkout(workout: Workout): Promise<void> {
    await WorkoutStoreApi.instance().saveWorkout(workout);
  }

  static getWorkoutId(date: number, workoutPlan: WorkoutPlan) {
    return `${new Date(truncTime(date)).toISOString()}-${workoutPlan.name}`;
  }

  static async getInProgressWorkout(): Promise<Workout | undefined> {
    const date = Date.now();
    const workouts = (
      await WorkoutStoreApi.instance().getWorkouts(truncTime(date))
    ).filter((workout) => workout.endedAt === undefined);
    if (workouts.length > 0) {
      return workouts.at(0);
    }
  }
}
