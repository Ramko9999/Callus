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
  UPSERT_METADATA,
  GET_METADATA,
  METADATA_TABLE_CREATION,
  GET_WORKOUT,
  GET_ROUTINE,
  GET_RECENTLY_COMPLETED_WORKOUTS,
} from "./sql";
import {
  CompletedExercise,
  Exercise,
  Routine,
  Workout,
  WorkoutLifetimeStats,
  Set as ISet,
  SetStatus,
  ExerciseMeta,
  WorkedOutDay,
} from "@/interface";
import { truncTime } from "@/util/date";
import { getMeta, ID_TO_EXERCISE_META } from "../exercise";

const DB_VERSION = "v9";
export const DB_NAME = `store-${DB_VERSION}.db`;

const TABLE_CREATIONS = [
  WORKOUTS_TABLE_CREATION,
  EXERCISES_TABLE_CREATION,
  ROUTINES_TABLE_CREATION,
  METADATA_TABLE_CREATION,
].join("");

export async function getConnection() {
  return await openDatabaseAsync(DB_NAME);
}

export async function migrateTables(db: SQLiteDatabase) {
  await db.execAsync(TABLE_CREATIONS);
}

function toExercise({ meta_id, id, sets, rest_duration, note }: any): Exercise {
  return {
    name: (ID_TO_EXERCISE_META.get(meta_id) as ExerciseMeta).name,
    metaId: meta_id,
    id,
    sets: JSON.parse(sets),
    restDuration: rest_duration,
    note,
  };
}

function toCompletedExercise({
  id,
  meta_id,
  sets,
  rest_duration,
  note,
  bodyweight,
  workout_started_at,
}: any): CompletedExercise {
  const parsedSets: ISet[] = JSON.parse(sets);

  return {
    name: (ID_TO_EXERCISE_META.get(meta_id) as ExerciseMeta).name,
    metaId: meta_id,
    id,
    sets: parsedSets.filter((set) => set.status === SetStatus.FINISHED),
    restDuration: rest_duration,
    note,
    bodyweight,
    workoutStartedAt: workout_started_at,
  };
}

function toCompletedExercises(records: any[]): CompletedExercise[] {
  const completedExercises = records.map(toCompletedExercise);
  return completedExercises.filter(({ sets }) => sets.length > 0);
}

function toRoutine({ id, name, plan }: any): Routine {
  return {
    id,
    name,
    plan: JSON.parse(plan).map((exercisePlan: any) => ({
      id: exercisePlan.id,
      metaId: exercisePlan.metaId,
      name: (ID_TO_EXERCISE_META.get(exercisePlan.metaId) as ExerciseMeta).name,
      rest: exercisePlan.rest,
      sets: exercisePlan.sets,
    })),
  };
}

function toWorkout({
  id,
  name,
  bodyweight,
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
    bodyweight,
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
      bodyweight,
    } = workout;
    await this.db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync(UPSERT_WORKOUT, {
        $id: workoutId,
        $name: name,
        $started_at: startedAt,
        $ended_at: endedAt ? endedAt : null,
        $routine_id: routineId ? routineId : null,
        $bodyweight: bodyweight,
      });

      await txn.runAsync(CLEAR_ALL_EXERCISES, { $workout_id: workoutId });

      for (const { exercise, order } of exercises.map((exercise, index) => ({
        exercise,
        order: index,
      }))) {
        const { id, metaId, sets, restDuration, note } = exercise;
        await txn.runAsync(UPSERT_EXERCISE, {
          $id: id,
          $meta_id: metaId,
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

  async getWorkout(workoutId: string): Promise<Workout> {
    return toWorkout(
      await this.db.getFirstAsync(GET_WORKOUT, { $workout_id: workoutId })
    );
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

  async getRoutine(routineId: string): Promise<Routine> {
    return toRoutine(
      await this.db.getFirstAsync(GET_ROUTINE, { $routine_id: routineId })
    );
  }

  async saveRoutine({ id, name, plan }: Routine) {
    const planWithMetaIds = plan.map((exercisePlan) => ({
      id: exercisePlan.id,
      metaId: exercisePlan.metaId,
      rest: exercisePlan.rest,
      sets: exercisePlan.sets,
    }));

    await this.db.runAsync(UPSERT_ROUTINE, {
      $id: id,
      $name: name,
      $plan: JSON.stringify(planWithMetaIds),
    });
  }

  async deleteRoutine(routineId: string) {
    await this.db.runAsync(DELETE_ROUTINE, { $routine_id: routineId });
  }

  async getInProgressWorkout(): Promise<Workout | undefined> {
    const rawSqlRecord = await this.db.getFirstAsync(GET_IN_PROGRESS_WORKOUTS);
    return rawSqlRecord != null ? toWorkout(rawSqlRecord) : undefined;
  }

  async deleteWorkout(workoutId: string) {
    await this.db.runAsync(DELETE_WORKOUT, { $workout_id: workoutId });
  }

  async getWorkedOutDays(
    before: number,
    after: number
  ): Promise<WorkedOutDay[]> {
    const workouts = await this.db.getAllAsync(GET_WORKED_OUT_DAYS, {
      $before: before,
      $after: after,
    });

    // Create a map to aggregate durations by day
    const dayMap = new Map<number, number>();

    // Process each workout and calculate duration
    workouts.forEach(({ started_at, ended_at }: any) => {
      if (ended_at && started_at) {
        const day = truncTime(started_at as number);
        const duration = (ended_at as number) - (started_at as number);

        // Add duration to the appropriate day
        if (dayMap.has(day)) {
          dayMap.set(day, dayMap.get(day)! + duration);
        } else {
          dayMap.set(day, duration);
        }
      }
    });

    // Convert map to array of objects
    return Array.from(dayMap.entries()).map(
      ([day, totalDurationWorkedOut]) => ({
        day,
        totalDurationWorkedOut,
      })
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

  async getAllCompletedExercises(
    after: number,
    before: number
  ): Promise<CompletedExercise[]> {
    const completedExercises: any[] = await this.db.getAllAsync(
      GET_COMPLETED_EXERCISES,
      {
        $after: after,
        $before: before,
      }
    );
    return toCompletedExercises(completedExercises);
  }

  async getAllCompletedExercise(
    after: number,
    exerciseName: string
  ): Promise<CompletedExercise[]> {
    const metaId = getMeta(exerciseName).metaId;
    const completions: any[] = await this.db.getAllAsync(
      GET_COMPLETED_EXERCISE,
      {
        $after: after,
        $before: Date.now(),
        $meta_id: metaId,
      }
    );
    return toCompletedExercises(completions);
  }

  async getCompletedWorkoutCountsBefore(before: number) {
    return (
      (await this.db.getFirstAsync(GET_COMPLETED_WORKOUT_COUNT_BEFORE, {
        $before: before,
      })) as any
    ).workout_count;
  }

  async upsertMetadata(key: string, value: string) {
    await this.db.runAsync(UPSERT_METADATA, { $key: key, $value: value });
  }

  async readMetadata(key: string): Promise<string | undefined> {
    const result: any = await this.db.getFirstAsync(GET_METADATA, {
      $key: key,
    });

    if (result != null) {
      return result.value as string;
    }
  }

  async getRecentlyCompletedWorkouts(): Promise<Workout[]> {
    return (await this.db.getAllAsync(GET_RECENTLY_COMPLETED_WORKOUTS)).map(
      toWorkout
    );
  }
}
