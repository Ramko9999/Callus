import { WorkoutPlan, Workout } from "@/interface";
import { addDays, truncTime } from "@/util";
import { STORAGE_NAMESPACE } from "@/constants";
import { ProgramApi } from "./program";
import { Store, DiskStore } from "./store";

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

  async saveWorkouts(workouts: Workout[]): Promise<void> {
    const updatesByPartition = new Map<string, Workout[]>();
    workouts.forEach((workout) => {
      const partitionUpdates =
        updatesByPartition.get(this.getPartitionKey(workout.startedAt)) || [];
      partitionUpdates.push(workout);
      updatesByPartition.set(
        this.getPartitionKey(workout.startedAt),
        partitionUpdates
      );
    });

    let partitionUpdates = [];
    for (const [partition, updatedWorkouts] of updatesByPartition) {
      const updatedWorkoutIds = updatedWorkouts.map(({ id }) => id);

      const partitionUpdate = new Promise<void>(async (resolve) => {
        const storedWorkouts = (await this.store.read(partition)).filter(
          ({ id }) => !updatedWorkoutIds.includes(id)
        );
        storedWorkouts.push(...updatedWorkouts);
        await this.store.write(partition, storedWorkouts);
        resolve();
      });

      partitionUpdates.push(partitionUpdate);
    }
    await Promise.all(partitionUpdates);
  }

  async saveWorkout(workout: Workout): Promise<void> {
    await this.saveWorkouts([workout]);
  }

  static instance(): WorkoutStoreApi {
    SINGLETON_STORE_API =
      SINGLETON_STORE_API ??
      new WorkoutStoreApi(new DiskStore(STORAGE_NAMESPACE, []));
    return SINGLETON_STORE_API;
  }

  async getWorkoutsForDay(date: number): Promise<Workout[]> {
    const partitionKey = this.getPartitionKey(date); // todo: check the next month or you will have a bug on month end
    const workouts = await this.store.read(partitionKey);
    return workouts.filter(
      ({ startedAt }) => startedAt >= date && startedAt < addDays(date, 1)
    );
  }

  async getAllWorkouts(): Promise<Workout[]> {
    const workoutsByPartition = await this.store.readAllPartitions();
    const workouts = [];
    for (const [_, workoutsPerPartition] of workoutsByPartition) {
      workouts.push(...workoutsPerPartition);
    }

    return workouts;
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
    const workouts = await WorkoutStoreApi.instance().getWorkoutsForDay(
      localDate
    );
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

  // todo: make this agnostic of day
  static async getInProgressWorkout(): Promise<Workout | undefined> {
    const date = Date.now();
    const workouts = (
      await WorkoutStoreApi.instance().getWorkoutsForDay(truncTime(date))
    ).filter((workout) => workout.endedAt === undefined);
    if (workouts.length > 0) {
      return workouts.at(0);
    }
  }
}

export class WorkoutImportExportApi {
  static async getExportableWorkouts(): Promise<Workout[]> {
    return await WorkoutStoreApi.instance().getAllWorkouts();
  }

  static async importWorkouts(workouts: Workout[]): Promise<void> {
    await WorkoutStoreApi.instance().saveWorkouts(workouts);
  }
}
