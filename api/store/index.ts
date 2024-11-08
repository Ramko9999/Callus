import * as FileSystem from "expo-file-system";
import { DB_NAME, STORAGE_NAMESPACE } from "@/constants";
import { SQLiteDatabase, openDatabaseAsync } from "expo-sqlite";
import { CLEAR_ALL_EXERCISES, EXERCISES_TABLE_CREATION, GET_IN_PROGRESS_WORKOUTS, GET_COMPLETED_WORKOUTS_BETWEEN_TIME, UPSERT_EXERCISE, UPSERT_WORKOUT, WORKOUTS_TABLE_CREATION } from "./sql";
import { Exercise, Workout } from "@/interface";

const APP_DATA_DIRECTORY = `${FileSystem.documentDirectory}${STORAGE_NAMESPACE}`;

const TABLE_CREATIONS = [
  WORKOUTS_TABLE_CREATION,
  EXERCISES_TABLE_CREATION,
].join("");

export async function initializeAppDataDirectory() {
  const { exists } = await FileSystem.getInfoAsync(APP_DATA_DIRECTORY);
  if (!exists) {
    await FileSystem.makeDirectoryAsync(APP_DATA_DIRECTORY);
  }
  return APP_DATA_DIRECTORY;
}

export async function getConnection() {
  return await openDatabaseAsync(DB_NAME);
}

export async function migrateTables(db: SQLiteDatabase) {
  await db.execAsync(TABLE_CREATIONS);
}

let STORE: Store;

export class Store {
  db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  static setup(db: SQLiteDatabase) {
    STORE = new Store(db);
  }

  static instance() {
    return STORE;
  }

  private toWorkout(rawSqlRecord: any): Workout {
    const sqlExercises: any[] = JSON.parse(rawSqlRecord.exercises);
    const exercises: Exercise[] = sqlExercises
      .sort((a, b) => a.order - b.order)
      .map((sqlExercise) => ({
        name: sqlExercise.name,
        id: sqlExercise.id,
        sets: JSON.parse(sqlExercise.sets),
      }));

    return {
      name: rawSqlRecord.name,
      exercises,
      startedAt: rawSqlRecord.started_at,
      id: rawSqlRecord.id,
      endedAt: rawSqlRecord.ended_at,
    };
  }

  async saveWorkout(workout: Workout) {
    const start = Date.now();
    const { id: workoutId, name, startedAt, endedAt, exercises } = workout;
    await this.db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync(UPSERT_WORKOUT, {
        $id: workoutId,
        $name: name,
        $started_at: startedAt,
        $ended_at: endedAt ? endedAt : null,
      });

      await txn.runAsync(CLEAR_ALL_EXERCISES, { $workout_id: workoutId });

      for (const { exercise, order } of exercises.map((exercise, index) => ({
        exercise,
        order: index,
      }))) {
        const { id, name, sets } = exercise;
        await txn.runAsync(UPSERT_EXERCISE, {
          $id: id,
          $name: name,
          $sets: JSON.stringify(sets),
          $workout_id: workoutId,
          $exercise_order: order,
        });
      }

      const elapsed = Date.now() - start;
      console.log(`[STORE] saveWorkout took ${elapsed}ms`);
    });
  }

  async getWorkouts(
    after: number,
    before: number
  ): Promise<Workout[]> {
    return (
      (await this.db.getAllAsync(GET_COMPLETED_WORKOUTS_BETWEEN_TIME, {
        $after: after,
        $before: before,
      })) as any[]
    ).map(this.toWorkout);
  }

  async getAllWorkouts() {
    return (
      (await this.db.getAllAsync(GET_COMPLETED_WORKOUTS_BETWEEN_TIME, {
        $after: 0,
        $before: Date.now(),
      })) as any[]
    ).map(this.toWorkout);
  }

  async getInProgressWorkout(): Promise<Workout | undefined> {
    const rawSqlRecord = await this.db.getFirstAsync(GET_IN_PROGRESS_WORKOUTS);
    return rawSqlRecord != null ? this.toWorkout(rawSqlRecord) : undefined;
  }

  async saveWorkouts(workouts: Workout[]) {
    const start = Date.now();
    for (const workout of workouts) {
      await this.saveWorkout(workout);
    }
    const elapsed = Date.now() - start;
    console.log(`[STORE] saveWorkouts took ${elapsed}ms`);
  }
}
