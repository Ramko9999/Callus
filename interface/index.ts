export enum DifficultyType {
    WEIGHT = "WEIGHT",
    BODYWEIGHT = "BODYWEIGHT",
    ASSISTED_BODYWEIGHT = "ASSISTED_BODYWEIGHT",
    WEIGHTED_BODYWEIGHT = "WEIGHTED_BODYWEIGHT",
    TIME = "TIME"
}

export type WeightDifficulty = {
    weight: number
    reps: number
}

export type BodyWeightDifficulty = {
    reps: number
}

export type AssistedBodyWeightDifficulty = {
    assistanceWeight: number
    reps: number
}

export type TimeDifficulty = {
    duration: number
}

export type Difficulty = WeightDifficulty | BodyWeightDifficulty | AssistedBodyWeightDifficulty | TimeDifficulty

export type ExerciseMeta = {
    name: string,
    difficultyType: DifficultyType
    demoUrl: string,
    muscles: string[]
}

type SetPlan = {
    difficulty: Difficulty
}

export type ExercisePlan = {
    name: string,
    rest: number
    sets: SetPlan[]
}

export type WorkoutPlan = {
    name: string,
    exercises: ExercisePlan[]
}


export enum SetStatus {
    UNSTARTED, RESTING, FINISHED
}

enum Sentiment {
    UNHAPPY, MILDLY_UNHAPPY, NEUTRAL, MIDLY_HAPPY, HAPPY
}

export type Set = SetPlan & {
    id: string,
    status: SetStatus,
    sentiment?: Sentiment
    startedAt?: number
    restStartedAt?: number
    restEndedAt?: number 
    restDuration: number
}

export type Exercise =  {
    id: string,
    name: string,
    sets: Set[]
}

export type Workout = {
    id: string,
    startedAt: number,
    endedAt?: number,
    name: string,
    exercises: Exercise[]
}

export enum WorkoutActivityType {
    EXERCISING, RESTING, FINISHED
}

export type ExercisingActivity = {
    setId: string,
    name: string
    difficulty: Difficulty
    difficultyType: DifficultyType
}

export type RestingActivity = {
    setId: string,
    duration: number,
    startedAt: number
}

export type WorkoutActivity = {
    type: WorkoutActivityType,
    activityData: ExercisingActivity | RestingActivity | {}
}

export type WorkoutSummary = {
    totalReps: number,
    totalWeightLifted: number,
    totalDuration: number
}

export type WorkoutMetadata = {
    startedAt: number,
    name: string
}
  
export type Program = {
    id: string,
    name: string,
    skippedDays: number[]
}

export enum KeypadType {
    WEIGHT,
    REPS,
    DURATION,
    ASSISTANCE_WEIGHT,
  }