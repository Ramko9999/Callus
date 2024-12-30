import * as FileSystem from "expo-file-system";
import { DB_NAME, STORAGE_NAMESPACE } from "@/constants";
import { SQLiteDatabase, openDatabaseAsync } from "expo-sqlite";
import {
  CLEAR_ALL_EXERCISES,
  EXERCISES_TABLE_CREATION,
  GET_IN_PROGRESS_WORKOUTS,
  GET_COMPLETED_WORKOUTS_BETWEEN_TIME,
  UPSERT_EXERCISE,
  UPSERT_WORKOUT,
  WORKOUTS_TABLE_CREATION,
  DELETE_WORKOUT,
  GET_WORKED_OUT_DAYS,
  GET_LIFETIME_STATS,
  GET_COMPLETED_EXERCISES,
  GET_COMPLETED_EXERCISE,
} from "./sql";
import { Exercise, Workout, WorkoutLifetimeStats } from "@/interface";
import { truncTime } from "@/util/date";

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

function toExercise({ name, id, sets, rest_duration, note }: any): Exercise {
  return {
    name,
    id,
    sets: JSON.parse(sets),
    restDuration: rest_duration,
    note,
  };
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
      .map(toExercise);

    return {
      name: rawSqlRecord.name,
      exercises,
      startedAt: rawSqlRecord.started_at,
      id: rawSqlRecord.id,
      endedAt: rawSqlRecord.ended_at,
      routineId: rawSqlRecord.routine_id,
    };
  }

  async saveWorkout(workout: Workout) {
    const start = Date.now();
    const {
      id: workoutId,
      name,
      startedAt,
      endedAt,
      exercises,
      routineId,
    } = workout;
    await this.db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync(UPSERT_WORKOUT, {
        $id: workoutId,
        $name: name,
        $started_at: startedAt,
        $ended_at: endedAt ? endedAt : null,
        $routine_id: routineId ? routineId : null,
      });

      await txn.runAsync(CLEAR_ALL_EXERCISES, { $workout_id: workoutId });

      for (const { exercise, order } of exercises.map((exercise, index) => ({
        exercise,
        order: index,
      }))) {
        const { id, name, sets, restDuration, note } = exercise;
        await txn.runAsync(UPSERT_EXERCISE, {
          $id: id,
          $name: name,
          $sets: JSON.stringify(sets),
          $workout_id: workoutId,
          $exercise_order: order,
          $rest_duration: restDuration,
          $note: note ? note : null,
        });
      }

      const elapsed = Date.now() - start;
      console.log(`[STORE] saveWorkout took ${elapsed}ms`);
    });
  }

  async getWorkouts(after: number, before: number): Promise<Workout[]> {
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

  async deleteWorkout(workoutId: string) {
    await this.db.runAsync(DELETE_WORKOUT, { $workout_id: workoutId });
  }

  async getWorkedOutDays(before: number, after: number): Promise<Set<number>> {
    const workoutStartTimes = await this.db.getAllAsync(GET_WORKED_OUT_DAYS, {
      $before: before,
      $after: after,
    });
    return new Set(
      workoutStartTimes.map(({ timestamp }: any) =>
        truncTime(timestamp as number)
      )
    );
  }

  async getLifetimeStats(): Promise<WorkoutLifetimeStats> {
    const lifetimeStats: any = (
      await this.db.getAllAsync(GET_LIFETIME_STATS)
    )[0];
    return {
      totalWorkouts: lifetimeStats.workouts,
      totalWorkoutDuration: lifetimeStats.workout_duration,
    };
  }

  async getAllCompletedExercises(after: number): Promise<Exercise[]> {
    const completedExercises: any[] = await this.db.getAllAsync(
      GET_COMPLETED_EXERCISES,
      {
        $after: after,
        $before: Date.now(),
      }
    );
    return completedExercises
      .map(toExercise)
      .map((exercise) => ({
        ...exercise,
        sets: exercise.sets.filter(
          ({ restEndedAt }) => restEndedAt != undefined
        ),
      }))
      .filter((exercise) => exercise.sets.length > 0);
  }

  async getAllCompletedExercise(
    after: number,
    exerciseName: string
  ): Promise<Exercise[]> {
    const completions: any[] = await this.db.getAllAsync(
      GET_COMPLETED_EXERCISE,
      {
        $after: after,
        $before: Date.now(),
        $exercise_name: exerciseName,
      }
    );
    return completions
      .map(toExercise)
      .map((exercise) => ({
        ...exercise,
        sets: exercise.sets.filter(
          ({ restEndedAt }) => restEndedAt != undefined
        ),
      }))
      .filter((exercise) => exercise.sets.length > 0);
  }
}
