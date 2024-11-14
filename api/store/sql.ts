export const WORKOUTS_TABLE_CREATION =
  "CREATE TABLE IF NOT EXISTS workouts (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, started_at INTEGER NOT NULL, ended_at INTEGER);";

export const EXERCISES_TABLE_CREATION =
  "CREATE TABLE IF NOT EXISTS exercises (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, workout_id TEXT NOT NULL, sets TEXT NOT NULL, exercise_order INTEGER NOT NULL, FOREIGN KEY (workout_id) REFERENCES workouts(id));";

export const UPSERT_WORKOUT =
  `INSERT INTO workouts(id, name, started_at, ended_at) VALUES ($id, $name, $started_at, $ended_at) 
  ON CONFLICT(id) DO UPDATE SET name = excluded.name, started_at = excluded.started_at, ended_at = excluded.ended_at`;

  export const UPSERT_EXERCISE =
  `INSERT INTO exercises(id, name, workout_id, sets, exercise_order) VALUES ($id, $name, $workout_id, $sets, $exercise_order) 
  ON CONFLICT(id) DO UPDATE SET name=excluded.name, workout_id=workout_id, sets=excluded.sets, exercise_order=excluded.exercise_order`;

export const CLEAR_ALL_EXERCISES =
  "DELETE FROM exercises WHERE workout_id = $workout_id";

const WORKOUT_SELECTION_SQL = (predicate: string) => (
`
select workouts.id as id, workouts.name as name, workouts.started_at as started_at, workouts.ended_at as ended_at, json_group_array(json_object('id', exercises.id, 'name', exercises.name, 'order', exercises.exercise_order, 'sets', exercises.sets)) as exercises 
from workouts join exercises on workouts.id = exercises.workout_id where ${predicate} group by 1 order by 3 ASC
`)

export const GET_COMPLETED_WORKOUTS_BETWEEN_TIME = WORKOUT_SELECTION_SQL("started_at > $after and started_at <= $before and ended_at is not null");

export const GET_IN_PROGRESS_WORKOUTS = WORKOUT_SELECTION_SQL("ended_at is null");

export const DELETE_WORKOUT = "DELETE FROM workouts where id = $workout_id";
