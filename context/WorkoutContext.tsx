import { WorkoutActivity, WorkoutPlan, Workout, SetStatus, Set, Exercise, WorkoutActivityType, WorkoutSummary } from "@/interface";
import { createContext, useState, useContext } from "react";
import { generateRandomId } from "@/util";
import { WorkoutStoreApi } from "@/app/api/workout-store";


function generateSetId(){
  return generateRandomId("st", 8);
}

function generateExerciseId(){
  return generateRandomId("ex", 8);
}

function generateWorkoutId(){
  return generateRandomId("wk", 8);
}

export function createWorkoutFromPlan(workoutPlan: WorkoutPlan): Workout {
  const exercisePlans: Exercise[] = workoutPlan.exercises.map(({name, sets, rest}) => {
    const setPlans = sets.map((set) => ({
      ...set,
      id: generateSetId(),
      status: SetStatus.UNSTARTED,
    }));
    return { id: generateExerciseId(), name:name, rest: rest, sets: setPlans };
  });

  return { name: workoutPlan.name, exercises: exercisePlans, startedAt: Date.now(), id: generateWorkoutId() };
}

export function getCurrentWorkoutActivity(workout: Workout) {
    const sets = workout.exercises.flatMap((exercise) => exercise.sets.map(set => ({...set, exercise})))
    for(const set of sets){
        if(set.status === SetStatus.UNSTARTED){
            return {type: WorkoutActivityType.EXERCISING, activityData: {exerciseName: set.exercise.name, weight: set.weight, reps: set.reps, setId: set.id}}
        }
        else if(set.status === SetStatus.RESTING){
            return {type: WorkoutActivityType.RESTING, activityData: {duration: set.exercise.rest, setId: set.id}}
        }
    }
    return {type: WorkoutActivityType.FINISHED, activityData: {}}
}

export function finish(workout: Workout): Workout {
  return {...workout, endedAt: Date.now()}
}

export function updateSet(setId: string, setUpdate: Partial<Set>, workout: Workout): Workout {
    const exercises = workout.exercises.map((ep) => {
        const sets = ep.sets.map((sp) => {
            if(sp.id == setId){
                return {...sp, ...setUpdate, id: setId}
            }
            return sp
        });
        return {...ep, sets};
    });

    return {...workout, exercises}
}

export function removeSet(setId: string, workout: Workout): Workout {
  const exercises = workout.exercises.flatMap((ep) => {
    const sets = ep.sets.filter((sp) => sp.id !== setId);
    if(sets.length === 0){
      return []
    }
    return [{...ep, sets}];
  });
  return {...workout, exercises}
}

export function duplicateLastSet(exerciseId: string, workout: Workout): Workout {
  const exercises = workout.exercises.map((ep) => {
    if(ep.id === exerciseId){
      const lastSet = ep.sets[ep.sets.length - 1]
      return {...ep, sets: [...ep.sets, {...lastSet, id: generateSetId()}]}
    }
    return ep
  });
  return {...workout, exercises}
}

export function updateExercise(exerciseId: string, exerciseUpdate: Partial<Exercise>, workout: Workout): Workout {
  const exercises = workout.exercises.map((ep) => {
    if(ep.id === exerciseId){
      return {...ep, ...exerciseUpdate, id: exerciseId}
    }
    return ep
  });
  return {...workout, exercises}
}

export function removeExercise(exerciseId: string, workout: Workout): Workout {
  const exercises = workout.exercises.filter((ep) => ep.id !== exerciseId);
  return {...workout, exercises}
}

export function updateWorkout(workoutUpdate: Partial<Workout>, workout: Workout): Workout {
  return {...workout, ...workoutUpdate}
}

export function getWorkoutSummary(workout: Workout): WorkoutSummary {
  let totalReps: number = 0;
  let totalWeightLifted: number = 0;
  workout.exercises.forEach((ex) => ex.sets.forEach((set) => {
    if(set.status !== SetStatus.UNSTARTED){
      totalReps += set.reps;
      totalWeightLifted += ((set.weight ?? 0) * set.reps);
    }
  }));

  let totalDuration = (workout.endedAt ?? Date.now()) - workout.startedAt;
  return {totalReps, totalWeightLifted, totalDuration};
}

type WorkoutActions = {
  startWorkout: (_: WorkoutPlan) => void,
  completeSet: (_: string) => void;
  completeRest: (_: string) => void;
  finishWorkout: () => void;
}

type WorkoutEditorActions = {
  updateWorkout: (_: Workout) => void
}

type WorkoutEditor = {
  workout?: Workout,
  actions: WorkoutEditorActions
}

type WorkoutContext = {
  isInWorkout: boolean;
  activity?: WorkoutActivity,
  actions: WorkoutActions,
  editor: WorkoutEditor
};

const context = createContext<WorkoutContext>({
  isInWorkout: false,
  actions: {startWorkout: () => {}, completeSet: () => {}, completeRest: () => {}, finishWorkout: () => {}},
  editor: {
    actions: {updateWorkout: (_: Workout) => {}}
  }
});

type Props = {
    children: React.ReactNode
}

export function WorkoutProvider({children}: Props) {
  const [workout, setWorkout] = useState<Workout>()
  const [inWorkout, setInWorkout] = useState<boolean>(false);

  const startWorkout = (workoutPlan: WorkoutPlan) => {
    const newWorkout = createWorkoutFromPlan(workoutPlan)
    WorkoutStoreApi.saveWorkout(newWorkout).then(() => {
      setWorkout(newWorkout);
      setInWorkout(true);
    });
  }

  const completeSet = (setId: string) => {
    const newWorkout = updateSet(setId, {status: SetStatus.RESTING}, workout as Workout);
    WorkoutStoreApi.saveWorkout(newWorkout).then(() => {
      setWorkout(newWorkout);
    });
  }

  const completeRest = (setId: string) => {
    const newWorkout = updateSet(setId, {status: SetStatus.FINISHED}, workout as Workout);
    WorkoutStoreApi.saveWorkout(newWorkout).then(() => {
      setWorkout(newWorkout);
    });
  }

  const updateWorkoutPlan = (update: Partial<Workout>) => {
    const newWorkout = {...workout as Workout, ...update};
    WorkoutStoreApi.saveWorkout(newWorkout).then(() => {
      setWorkout(newWorkout);
    });
  }

  const finishWorkout = () => {
    const newWorkout = finish(workout as Workout);
    WorkoutStoreApi.saveWorkout(newWorkout).then(() => {
      setInWorkout(false);
      setWorkout(undefined);
    });
  }

  return (
    <context.Provider
      value={{
        actions: {
          startWorkout, completeRest, completeSet, finishWorkout
        },
        activity: workout && getCurrentWorkoutActivity(workout),
        isInWorkout: inWorkout,
        editor: {
          workout: workout,
          actions: {updateWorkout: updateWorkoutPlan}
        }
      }}
    >
        {children}
    </context.Provider>
  );
}

export function useWorkout(){
    return useContext(context);
}
