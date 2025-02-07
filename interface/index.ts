export enum DifficultyType {
  WEIGHT = "WEIGHT",
  BODYWEIGHT = "BODYWEIGHT",
  ASSISTED_BODYWEIGHT = "ASSISTED_BODYWEIGHT",
  WEIGHTED_BODYWEIGHT = "WEIGHTED_BODYWEIGHT",
  TIME = "TIME",
}

export type WeightDifficulty = {
  weight: number;
  reps: number;
};

export type BodyWeightDifficulty = {
  reps: number;
};

export type AssistedBodyWeightDifficulty = {
  assistanceWeight: number;
  reps: number;
};

export type TimeDifficulty = {
  duration: number;
};

export type Difficulty =
  | WeightDifficulty
  | BodyWeightDifficulty
  | AssistedBodyWeightDifficulty
  | TimeDifficulty;

export type ExerciseMeta = {
  name: string;
  difficultyType: DifficultyType;
  demoUrl: string;
  muscles: string[];
};

export type SetPlan = {
  id: string;
  difficulty: Difficulty;
};

export type ExercisePlan = {
  id: string;
  name: string;
  rest: number;
  sets: SetPlan[];
};

export type WorkoutPlan = {
  name: string;
  exercises: ExercisePlan[];
};

export type Routine = {
  id: string;
  name: string;
  plan: ExercisePlan[];
};

export enum SetStatus {
  UNSTARTED,
  RESTING,
  FINISHED,
}

enum Sentiment {
  UNHAPPY,
  MILDLY_UNHAPPY,
  NEUTRAL,
  MIDLY_HAPPY,
  HAPPY,
}

export type Set = {
  id: string;
  difficulty: Difficulty;
  status: SetStatus;
  sentiment?: Sentiment;
  startedAt?: number;
  restStartedAt?: number;
  restEndedAt?: number;
  restDuration: number;
};

export type Exercise = {
  id: string;
  name: string;
  sets: Set[];
  restDuration: number;
  note?: string;
};

export type CompletedExercise = Exercise & {
  bodyweight: number;
  workoutStartedAt: number;
};

export type Workout = {
  id: string;
  bodyweight: number;
  startedAt: number;
  endedAt?: number;
  routineId?: string;
  name: string;
  exercises: Exercise[];
};

export enum WorkoutActivityType {
  EXERCISING,
  RESTING,
  FINISHED,
}

export type ExercisingActivity = {
  set: Set;
  exercise: Exercise;
};

export type RestingActivity = {
  set: Set;
  exercise: Exercise;
};

export type WorkoutActivity = {
  type: WorkoutActivityType;
  activityData: ExercisingActivity | RestingActivity | {};
};

export type WorkoutSummary = {
  totalReps: number;
  totalWeightLifted: number;
  totalDuration: number;
};

export type WorkoutMetadata = {
  startedAt: number;
  endedAt?: number;
  name: string;
};

export enum KeypadType {
  WEIGHT,
  REPS,
  DURATION,
  ASSISTANCE_WEIGHT,
}

export type WorkoutLifetimeStats = {
  totalWorkouts: number;
  totalWorkoutDuration: number;
};

export type MetricGenerationFunc = (completion: CompletedExercise) => number | undefined;

export type MetricType =
  | "Average Weight"
  | "Average Reps"
  | "Estimated 1 Rep Max"
  | "Average Duration"
  | "Average Rest Duration";

export type MetricConfig = {
  metricType: MetricType;
  metricGeneration: MetricGenerationFunc;
  format: (value: number) => string;
  determineHasImproved: (first: number, last: number) => boolean;
};

export type MetricPoint = {
  value: number;
  timestamp: number;
};

export type Metric = {
  metricType: MetricType;
  format: (value: number) => string;
  points: MetricPoint[];
  low: number;
  high: number;
  first: number;
  last: number;
  hasImproved: boolean;
  delta: number;
};

export type Trend = {
  title: string;
  metric: Metric;
};

export type SearchExerciseSummary = {
  name: string;
  totalSetsCompleted: number;
};
