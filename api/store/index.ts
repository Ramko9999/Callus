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
  ROUTINES_TABLE_CREATION,
  GET_ROUTINES,
  UPSERT_ROUTINE,
  DELETE_ROUTINE,
  GET_COMPLETED_WORKOUT_COUNT_BEFORE,
} from "./sql";
import { Exercise, Routine, Workout, WorkoutLifetimeStats } from "@/interface";
import { truncTime } from "@/util/date";

const APP_DATA_DIRECTORY = `${FileSystem.documentDirectory}${STORAGE_NAMESPACE}`;

const TABLE_CREATIONS = [
  WORKOUTS_TABLE_CREATION,
  EXERCISES_TABLE_CREATION,
  ROUTINES_TABLE_CREATION,
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

function toRoutine({ id, name, plan }: any): Routine {
  return {
    id,
    name,
    plan: JSON.parse(plan),
  };
}

function toWorkout({
  id,
  name,
  exercises,
  started_at,
  ended_at,
  routine_id,
}: any): Workout {
  const parsedExercises = JSON.parse(exercises)
    .sort((a: any, b: any) => a.order - b.order)
    .map(toExercise);

  return {
    name,
    exercises: parsedExercises,
    startedAt: started_at,
    id,
    endedAt: ended_at,
    routineId: routine_id,
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
    ).map(toWorkout);
  }

  async getAllWorkouts() {
    return (
      (await this.db.getAllAsync(GET_COMPLETED_WORKOUTS_BETWEEN_TIME, {
        $after: 0,
        $before: Date.now(),
      })) as any[]
    ).map(toWorkout);
  }

  async getRoutines() {
    return (await this.db.getAllAsync(GET_ROUTINES)).map(toRoutine);
  }

  async saveRoutine({ id, name, plan }: Routine) {
    await this.db.runAsync(UPSERT_ROUTINE, {
      $id: id,
      $name: name,
      $plan: JSON.stringify(plan),
    });
  }

  async deleteRoutine(routineId: string) {
    await this.db.runAsync(DELETE_ROUTINE, { $routine_id: routineId });
  }

  async getInProgressWorkout(): Promise<Workout | undefined> {
    const rawSqlRecord = await this.db.getFirstAsync(GET_IN_PROGRESS_WORKOUTS);
    return rawSqlRecord != null ? toWorkout(rawSqlRecord) : undefined;
  }

  async saveWorkouts(workouts: Workout[]) {
    const start = Date.now();
    for (const workout of workouts) {
      await this.saveWorkout(workout);
    }
    const elapsed = Date.now() - start;
    console.log(`[STORE] saveWorkouts took ${elapsed}ms`);
  }

  async saveRoutines(routines: Routine[]) {
    for (const routine of routines) {
      await this.saveRoutine(routine);
    }
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

  async getCompletedWorkoutCountsBefore(before: number) {
    return (
      (await this.db.getFirstAsync(GET_COMPLETED_WORKOUT_COUNT_BEFORE, {
        $before: before,
      })) as any
    ).workout_count;
  }
}
