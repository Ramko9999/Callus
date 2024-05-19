import { Workout, WorkoutActivity, ExercisingActivity, RestingActivity, WorkoutActivityType } from "@/interface";

export function instantiateWorkout(workout: Workout): WorkoutActivity[] {
    let workoutActivites = [];
    for(const exercise of workout.exercises){
        for(let setIndex = 0; setIndex < exercise.sets.length; setIndex++){
            const {weight, rest, reps} = exercise.sets[setIndex];
            const exercisingActivity: ExercisingActivity = {exerciseName: exercise.name, weight, reps}

            workoutActivites.push({
                type: WorkoutActivityType.EXERCISING,
                activityData: exercisingActivity
            })

            if(setIndex < exercise.sets.length - 1){
                const restingActivity: RestingActivity = {duration: rest}
                workoutActivites.push({type: WorkoutActivityType.RESTING, activityData: restingActivity})
            } else {
                workoutActivites.push({type: WorkoutActivityType.CHANGING_EXERCISE, activityData: {}})
            }
        }
    }
    return workoutActivites;
}

export function getDurationDisplay(durationinSeconds: number) {
    const minutes = Math.floor(durationinSeconds / 60);
    const seconds = new String(durationinSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}