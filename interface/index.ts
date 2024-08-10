type ExerciseSet = {
    weight?: number
    reps: number
}

export type Exercise = {
    name: string
    rest: number
    sets: ExerciseSet[]
}

export type Workout = {
    exercises: Exercise[]
}


export enum SetPlanStatus {
    UNSTARTED, RESTING, FINISHED
}

enum Sentiment {
    UNHAPPY, MILDLY_UNHAPPY, NEUTRAL, MIDLY_HAPPY, HAPPY
}

export type SetPlan = ExerciseSet & {
    id: string,
    status: SetPlanStatus,
    sentiment?: Sentiment
}

export type ExercisePlan = {
    name: String,
    rest: number,
    sets: SetPlan[]
}

export type WorkoutActivityPlan = {
    exercisePlans: ExercisePlan[]
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

export type RestingActivity = {
    setId: string,
    duration: number
}

export type WorkoutActivity = {
    type: WorkoutActivityType,
    activityData: ExercisingActivity | RestingActivity | {}
}