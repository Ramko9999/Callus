export const WORKOUTS_TABLE_CREATION =
  "CREATE TABLE IF NOT EXISTS workouts (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, started_at INTEGER NOT NULL, ended_at INTEGER, routine_id TEXT, bodyweight INTEGER NOT NULL);";

export const EXERCISES_TABLE_CREATION =
  "CREATE TABLE IF NOT EXISTS exercises (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, workout_id TEXT NOT NULL, sets TEXT NOT NULL, exercise_order INTEGER NOT NULL, rest_duration INTEGER NOT NULL, note TEXT, FOREIGN KEY (workout_id) REFERENCES workouts(id));";

export const ROUTINES_TABLE_CREATION =
  "CREATE TABLE IF NOT EXISTS routines (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, plan TEXT NOT NULL);";

export const METADATA_TABLE_CREATION =
  "CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);";

export const UPSERT_WORKOUT = `INSERT INTO workouts(id, name, started_at, ended_at, routine_id, bodyweight) VALUES ($id, $name, $started_at, $ended_at, $routine_id, $bodyweight) 
  ON CONFLICT(id) DO UPDATE SET name = excluded.name, started_at = excluded.started_at, ended_at = excluded.ended_at, routine_id = excluded.routine_id, bodyweight = excluded.bodyweight`;

export const UPSERT_EXERCISE = `INSERT INTO exercises(id, name, workout_id, sets, exercise_order, rest_duration, note) VALUES ($id, $name, $workout_id, $sets, $exercise_order, $rest_duration, $note) 
  ON CONFLICT(id) DO UPDATE SET name=excluded.name, workout_id=workout_id, sets=excluded.sets, exercise_order=excluded.exercise_order, rest_duration=excluded.rest_duration, note=excluded.note`;

export const UPSERT_METADATA = `INSERT INTO metadata(key, value) VALUES ($key, $value) ON CONFLICT (key) DO UPDATE SET key=excluded.key, value=excluded.value`;

export const CLEAR_ALL_EXERCISES =
  "DELETE FROM exercises WHERE workout_id = $workout_id";

const COMPLETED_WORKOUTS_PREDICATE =
  "started_at >= $after and started_at < $before and ended_at is not null";

const EXERCISE_FILTER_PREDICATE = "exercises.name = $exercise_name";

const WORKOUT_SELECTION_SQL = (predicate: string) =>
  `
select workouts.id as id, workouts.name as name, workouts.started_at as started_at, workouts.ended_at as ended_at, workouts.routine_id as routine_id, workouts.bodyweight as bodyweight,
case when exercises.id is null then json_array() else json_group_array(json_object('id', exercises.id, 'name', exercises.name, 'order', exercises.exercise_order, 'sets', exercises.sets, 'rest_duration', exercises.rest_duration, 'note', exercises.note)) end as exercises 
from workouts left join exercises on workouts.id = exercises.workout_id where ${predicate} group by 1 order by 3 ASC
`;

export const GET_COMPLETED_WORKOUTS_BETWEEN_TIME = WORKOUT_SELECTION_SQL(
  COMPLETED_WORKOUTS_PREDICATE
);

export const GET_IN_PROGRESS_WORKOUTS =
  WORKOUT_SELECTION_SQL("ended_at is null");

export const DELETE_WORKOUT = "DELETE FROM workouts where id = $workout_id";

export const GET_WORKED_OUT_DAYS = `select started_at as timestamp from workouts where ${COMPLETED_WORKOUTS_PREDICATE}`;

export const GET_LIFETIME_STATS =
  "select count(*) as workouts, coalesce(sum(ended_at - started_at), 0) as workout_duration from workouts where ended_at is not null";

export const GET_METADATA = "select key, value from metadata where key = $key";

const COMPLETED_EXERCISES_SQL = (predicate: string) => `
  select exercises.id as id, exercises.name as name, exercises.sets as sets, exercises.rest_duration as rest_duration, exercises.note as note, workouts.bodyweight as bodyweight, workouts.started_at as workout_started_at from workouts join exercises on workouts.id = exercises.workout_id where ${predicate}
`;

export const GET_COMPLETED_EXERCISES = COMPLETED_EXERCISES_SQL(
  COMPLETED_WORKOUTS_PREDICATE
);

export const GET_COMPLETED_EXERCISE = COMPLETED_EXERCISES_SQL(
  `${COMPLETED_WORKOUTS_PREDICATE} and ${EXERCISE_FILTER_PREDICATE}`
);

export const GET_ROUTINES = "select id, name, plan from routines;";

export const UPSERT_ROUTINE =
  "INSERT INTO routines(id, name, plan) values($id, $name, $plan) ON CONFLICT(id) DO UPDATE SET id=excluded.id, name=excluded.name, plan=excluded.plan;";

export const DELETE_ROUTINE = "DELETE FROM routines where id=$routine_id";

export const GET_COMPLETED_WORKOUT_COUNT_BEFORE =
  "select count(*) as workout_count from workouts where ended_at is not null and ended_at <= $before";
