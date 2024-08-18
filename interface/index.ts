type Set = {
    weight?: number
    reps: number
}

export type Exercise = {
    name: string
    rest: number
    sets: Set[]
}

export type Workout = {
    name: string,
    exercises: Exercise[]
}


export enum SetPlanStatus {
    UNSTARTED, RESTING, FINISHED
}

enum Sentiment {
    UNHAPPY, MILDLY_UNHAPPY, NEUTRAL, MIDLY_HAPPY, HAPPY
}

export type SetPlan = Set & {
    id: string,
    status: SetPlanStatus,
    sentiment?: Sentiment
}

export type ExercisePlan = {
    id: string,
    name: string,
    rest: number,
    sets: SetPlan[]
}

export type WorkoutActivityPlan = {
    name: string,
    exercises: ExercisePlan[]
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