import { WorkoutPlan, Workout } from "@/interface";
import { addDays, truncTime } from "@/util";
import { ProgramStoreApi } from "./program-store";
import * as FileSystem from "expo-file-system";

let SINGLETON_STORE_API: WorkoutStoreApi;

interface Store {
  read(partition: string): Promise<Workout[]>;
  write(partition: string, workouts: Workout[]): Promise<void>;
}

class MemoryStore implements Store {
  workoutStore: Map<string, Workout[]>;

  constructor() {
    this.workoutStore = new Map<string, Workout[]>();
  }

  async read(partition: string): Promise<Workout[]> {
    return new Promise((resolve) =>
      resolve(this.workoutStore.get(partition) || [])
    );
  }

  async write(partition: string, workouts: Workout[]): Promise<void> {
    return new Promise((resolve) => {
      this.workoutStore.set(partition, workouts);
      resolve();
    });
  }
}

class DiskStore implements Store {
  appDirectory: string
  constructor(subdirectory: string) {
    this.appDirectory = `${FileSystem.documentDirectory}${subdirectory}`
  }

  private async getDirectory() {
    try {
      const info = await FileSystem.getInfoAsync(this.appDirectory);
      if(!info.exists){
        await FileSystem.makeDirectoryAsync(
          this.appDirectory
        );
        return info.uri;
      }
      return this.appDirectory
    } catch (error) {
      console.log(`[DISK-STORE]: Error when getting directory: ${error}`);
      if(error instanceof Error){
        // race conditions
        if(error.message.includes("file with the same name already exists")){
          return this.appDirectory;
        }
      }
      throw error;
    }
  }

  async read(partition: string): Promise<Workout[]> {
    const fileUri = `${await (this.getDirectory())}/${partition}.json`;
    console.log(`[DISK-STORE] reading from uri: ${fileUri}`);
    try{
      const info = await FileSystem.getInfoAsync(fileUri);
      if(!info.exists){
        return [];
      }
      return JSON.parse(await FileSystem.readAsStringAsync(fileUri));
    }
    catch (error) {
      console.error(`[DISK-STORE]: Error when reading ${fileUri}: ${error}`);
      throw error;
    }
  }

  async write(partition: string, workouts: Workout[]): Promise<void> {
    const fileUri = `${await (this.getDirectory())}/${partition}.json`;
    console.log(
      `[DISK-STORE] writing to uri: ${fileUri} ${workouts.length} workouts`
    );
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(workouts));
  }
}

class WorkoutStoreApi {
  store: Store;

  constructor(store: Store) {
    this.store = store;
  }

  private getPartitionKey(date: number): string {
    const d = new Date(date);
    return `${d.getUTCFullYear()}-${d.getMonth()}`;
  }

  async saveWorkout(workout: Workout): Promise<void> {
    const partitionKey = this.getPartitionKey(workout.startedAt);
    const workouts = await this.store.read(partitionKey);
    const updatedWorkouts = workouts.filter(({ id }) => id !== workout.id);
    updatedWorkouts.push(workout);
    await this.store.write(partitionKey, updatedWorkouts);
  }

  static instance(): WorkoutStoreApi {
    SINGLETON_STORE_API =
      SINGLETON_STORE_API ?? new WorkoutStoreApi(new DiskStore("test-10-5"));
    return SINGLETON_STORE_API;
  }

  async getWorkouts(date: number): Promise<Workout[]> {
    const partitionKey = this.getPartitionKey(date); // todo(): check the next month or you will have a bug
    const workouts = await this.store.read(partitionKey);
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
    console.log(workouts);
    const workoutIds = new Set(workouts.map((workout) => workout.id));

    const workoutPlans = ProgramStoreApi.getWorkoutPlans(localDate).filter(
      (workoutPlan) =>
        !workoutIds.has(this.getWorkoutId(localDate, workoutPlan))
    );
    console.log(workoutPlans);
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
