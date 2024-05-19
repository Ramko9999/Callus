import { WorkoutActivity, Workout } from "@/interface";
import { instantiateWorkout } from "@/util";
import { createContext, useState, useContext } from "react";

type WorkoutActivityContext = {
  isInWorkout: boolean;
  instantiateWorkout: (_: Workout) => void;
  currentActivity: WorkoutActivity | null;
  hasNextActivity: boolean;
  forwardToNextActivity: () => void;
};

const context = createContext<WorkoutActivityContext>({
  isInWorkout: false,
  instantiateWorkout: (_: Workout) => {},
  currentActivity: null,
  hasNextActivity: false,
  forwardToNextActivity: () => {},
});

type Props = {
    children: React.ReactNode
}

export function WorkoutActivityProvider({children}: Props) {
  const [workoutActivites, setWorkoutActivites] = useState<WorkoutActivity[]>(
    []
  );
  const [activityIndex, setActivityIndex] = useState<number>(0);
  const [inWorkout, setInWorkout] = useState<boolean>(false);

  return (
    <context.Provider
      value={{
        instantiateWorkout: (workout: Workout) => {
          setInWorkout(true);
          setActivityIndex(0);
          setWorkoutActivites(instantiateWorkout(workout));
        },
        currentActivity: workoutActivites[activityIndex],
        forwardToNextActivity: () => {
          setActivityIndex((activityIndex) => activityIndex + 1);
        },
        hasNextActivity: activityIndex < workoutActivites.length - 1,
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
