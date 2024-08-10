import {
  Workout,
  WorkoutActivityPlan,
  SetPlan,
  WorkoutActivityType,
  SetPlanStatus,
  ExercisePlan,
} from "@/interface";

export function createWorkoutPlan(workout: Workout): WorkoutActivityPlan {
  const exercisePlans: ExercisePlan[] = workout.exercises.map((exercise) => {
    const setPlans = exercise.sets.map((set) => ({
      ...set,
      id: `${exercise}-${generateRandomId()}`,
      status: SetPlanStatus.UNSTARTED,
    }));
    return { name: exercise.name, rest: exercise.rest, sets: setPlans };
  });

  return { exercisePlans };
}

export function getCurrentWorkoutActivity(workoutActivityPlan: WorkoutActivityPlan) {
    const sets = workoutActivityPlan.exercisePlans.flatMap((exercisePlan) => exercisePlan.sets.map(set => ({...set, exercisePlan})))
    for(const set of sets){
        if(set.status === SetPlanStatus.UNSTARTED){
            return {type: WorkoutActivityType.EXERCISING, activityData: {exerciseName: set.exercisePlan.name, weight: set.weight, reps: set.reps}}
        }
        else if(set.status === SetPlanStatus.RESTING){
            return {type: WorkoutActivityType.RESTING, activityData: {duration: set.exercisePlan.rest}}
        }
    }
    return {type: WorkoutActivityType.FINISHED, activityData: {}}
}

type SetPlanUpdate = Partial<SetPlan> 
export function updateSet(setId: string, setUpdate: Partial<SetPlan>, workoutActivityPlan: WorkoutActivityPlan): WorkoutActivityPlan {
    const eps = workoutActivityPlan.exercisePlans.map((ep) => {
        const sps = ep.sets.map((sp) => {
            if(sp.id == setId){
                return {...sp, ...setUpdate, id: setId}
            }
            return sp
        });
        return {...ep, sets: sps};
    });

    return {exercisePlans: eps}
}

export function getDurationDisplay(durationinSeconds: number) {
  const minutes = Math.floor(durationinSeconds / 60);
  const seconds = new String(durationinSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function generateRandomId(length = 8) {
    return Math.random().toString(36).substring(2, length);
  }