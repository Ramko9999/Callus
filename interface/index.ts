type SetPlan = {
    weight?: number
    reps: number
}

export type ExercisePlan = {
    name: string
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
    restDuration?: number
}

export type Exercise = {
    id: string,
    name: string,
    rest: number,
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
    exerciseName: string
    weight: number | null
    reps: number
}

// expose restStarted at not run into inconsistencies
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
    startedAt: number
}
  
export type Program = {
    id: string,
    name: string,
    skippedDays: number[]
}