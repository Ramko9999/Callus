import { WorkoutActivity, Workout, WorkoutActivityPlan, SetPlanStatus, SetPlan, ExercisePlan, WorkoutActivityType } from "@/interface";
import { createContext, useState, useContext } from "react";
import { generateRandomId } from "@/util";


function generateSetId(){
  return generateRandomId("st", 8);
}

export function createWorkoutPlan(workout: Workout): WorkoutActivityPlan {
  const exercises: ExercisePlan[] = workout.exercises.map((exercise) => {
    const setPlans = exercise.sets.map((set) => ({
      ...set,
      id: generateRandomId("st", 8),
      status: SetPlanStatus.UNSTARTED,
    }));
    return { id: generateSetId(), name:exercise.name, rest: exercise.rest, sets: setPlans };
  });

  return { name: workout.name, exercises };
}

export function getCurrentWorkoutActivity(workoutActivityPlan: WorkoutActivityPlan) {
    const sets = workoutActivityPlan.exercises.flatMap((exercise) => exercise.sets.map(set => ({...set, exercise})))
    for(const set of sets){
        if(set.status === SetPlanStatus.UNSTARTED){
            return {type: WorkoutActivityType.EXERCISING, activityData: {exerciseName: set.exercise.name, weight: set.weight, reps: set.reps, setId: set.id}}
        }
        else if(set.status === SetPlanStatus.RESTING){
            return {type: WorkoutActivityType.RESTING, activityData: {duration: set.exercise.rest, setId: set.id}}
        }
    }
    return {type: WorkoutActivityType.FINISHED, activityData: {}}
}

export function updateSet(setId: string, setUpdate: Partial<SetPlan>, workoutActivityPlan: WorkoutActivityPlan): WorkoutActivityPlan {
    const eps = workoutActivityPlan.exercises.map((ep) => {
        const sps = ep.sets.map((sp) => {
            if(sp.id == setId){
                return {...sp, ...setUpdate, id: setId}
            }
            return sp
        });
        return {...ep, sets: sps};
    });

    return {...workoutActivityPlan, exercises: eps}
}

export function removeSet(setId: string, workoutActivityPlan: WorkoutActivityPlan): WorkoutActivityPlan {
  const eps = workoutActivityPlan.exercises.flatMap((ep) => {
    const sps = ep.sets.filter((sp) => sp.id !== setId);
    if(sps.length === 0){
      return []
    }
    return [{...ep, sets: sps}];
  });
  return {...workoutActivityPlan, exercises: eps}
}

export function duplicateLastSet(exerciseId: string, workoutActivityPlan: WorkoutActivityPlan): WorkoutActivityPlan {
  const eps = workoutActivityPlan.exercises.map((ep) => {
    if(ep.id === exerciseId){
      const lastSet = ep.sets[ep.sets.length - 1]
      return {...ep, sets: [...ep.sets, {...lastSet, id: generateSetId()}]}
    }
    return ep
  });
  return {...workoutActivityPlan, exercises: eps}
}

export function updateExercise(exerciseId: string, exerciseUpdate: Partial<ExercisePlan>, workoutActivityPlan: WorkoutActivityPlan): WorkoutActivityPlan {
  const eps = workoutActivityPlan.exercises.map((ep) => {
    if(ep.id === exerciseId){
      return {...ep, ...exerciseUpdate, id: exerciseId}
    }
    return ep
  });
  return {...workoutActivityPlan, exercises: eps}
}

export function removeExercise(exerciseId: string, workoutActivityPlan: WorkoutActivityPlan): WorkoutActivityPlan {
  const eps = workoutActivityPlan.exercises.filter((ep) => ep.id !== exerciseId);
  return {...workoutActivityPlan, exercises: eps}
}

export function updateWorkout(workoutUpdate: Partial<WorkoutActivityPlan>, workoutActivityPlan: WorkoutActivityPlan): WorkoutActivityPlan {
  return {...workoutActivityPlan, ...workoutUpdate}
}


type WorkoutActivityActions = {
  startWorkout: (_: Workout) => void,
  completeSet: (setId: string) => void;
  completeRest: (setId: string) => void;
}

type WorkoutActivityEditorActions = {
  updateWorkoutPlan: (wp: WorkoutActivityPlan) => void
}

type WorkoutPlanEditor = {
  workoutPlan?: WorkoutActivityPlan,
  actions: WorkoutActivityEditorActions
}

type WorkoutActivityContext = {
  isInWorkout: boolean;
  activity?: WorkoutActivity,
  actions: WorkoutActivityActions,
  editor: WorkoutPlanEditor
};

const context = createContext<WorkoutActivityContext>({
  isInWorkout: false,
  actions: {startWorkout: () => {}, completeSet: () => {}, completeRest: () => {}},
  editor: {
    actions: {updateWorkoutPlan: (wp: WorkoutActivityPlan) => {}}
  }
});

type Props = {
    children: React.ReactNode
}

export function WorkoutActivityProvider({children}: Props) {
  const [workoutActivityPlan, setWorkoutActivityPlan] = useState<WorkoutActivityPlan>()
  const [inWorkout, setInWorkout] = useState<boolean>(false);

  const startWorkout = (workout: Workout) => {
    setInWorkout(true);
    setWorkoutActivityPlan(createWorkoutPlan(workout))
  }

  const completeSet = (setId: string) => {
    setWorkoutActivityPlan((wp) => updateSet(setId, {status: SetPlanStatus.RESTING}, wp as WorkoutActivityPlan))
  }

  const completeRest = (setId: string) => {
    setWorkoutActivityPlan((wp) => updateSet(setId, {status: SetPlanStatus.FINISHED}, wp as WorkoutActivityPlan))
  }

  const updateWorkoutPlan = (update: Partial<WorkoutActivityPlan>) => {
    setWorkoutActivityPlan((wp) => ({...wp as WorkoutActivityPlan, ...update}))
  }

  return (
    <context.Provider
      value={{
        actions: {
          startWorkout, completeRest, completeSet
        },
        activity: workoutActivityPlan && getCurrentWorkoutActivity(workoutActivityPlan),
        isInWorkout: inWorkout,
        editor: {
          workoutPlan: workoutActivityPlan,
          actions: {updateWorkoutPlan}
        }
      }}
    >
        {children}
    </context.Provider>
  );
}

export function useWorkoutActivity(){
    return useContext(context);
}
