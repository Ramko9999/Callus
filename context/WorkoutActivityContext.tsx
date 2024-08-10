import { WorkoutActivity, Workout, WorkoutActivityPlan, SetPlanStatus } from "@/interface";
import { createWorkoutPlan, getCurrentWorkoutActivity, updateSet } from "@/util";
import { createContext, useState, useContext } from "react";


type WorkoutActivityActions = {
  startWorkout: (_: Workout) => void,
  completeSet: (setPlanId: string) => void;
  completeRest: (setPlanId: string) => void;
}

type WorkoutActivityContext = {
  isInWorkout: boolean;
  activity?: WorkoutActivity,
  actions: WorkoutActivityActions
};

const context = createContext<WorkoutActivityContext>({
  isInWorkout: false,
  actions: {startWorkout: () => {}, completeSet: () => {}, completeRest: () => {}}
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

  return (
    <context.Provider
      value={{
        actions: {
          startWorkout, completeRest, completeSet
        },
        activity: workoutActivityPlan && getCurrentWorkoutActivity(workoutActivityPlan),
        isInWorkout: inWorkout,
      }}
    >
        {children}
    </context.Provider>
  );
}

export function useWorkoutActivity(){
    return useContext(context);
}
