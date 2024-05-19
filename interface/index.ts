type ExerciseSet = {
    weight: number | null
    reps: number
    rest: number
}

type Exercise = {
    name: string
    sets: ExerciseSet[]
}

export type Workout = {
    exercises: Exercise[]
}

export enum WorkoutActivityType {
    EXERCISING, RESTING, CHANGING_EXERCISE
}

export type ExercisingActivity = {
    exerciseName: string
    weight: number | null
    reps: number
}

export type RestingActivity = {
    duration: number
}

export type ChangingExerciseActivity = {}

export type WorkoutActivity = {
    type: WorkoutActivityType,
    activityData: ExercisingActivity | RestingActivity | ChangingExerciseActivity
}