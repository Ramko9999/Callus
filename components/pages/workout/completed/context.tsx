import { WorkoutApi } from "@/api/workout";
import { useDebounce } from "@/components/hooks/use-debounce";
import { Workout } from "@/interface";
import { createContext, useState, useEffect, useContext } from "react";
import { artificallyDelay } from "@/util/misc";

type CompletedWorkoutState = {
  workout?: Workout;
  onSave: (workout: Workout) => void;
};

const completedWorkoutContext = createContext<CompletedWorkoutState>({
  onSave: (workout: Workout) => {},
});

type CompletedWorkoutProviderProps = {
  workoutId: string;
  children: React.ReactNode;
};

export function CompletedWorkoutProvider({
  workoutId,
  children,
}: CompletedWorkoutProviderProps) {
  const [workout, setWorkout] = useState<Workout>();
  const { invoke } = useDebounce({ delay: 200 });

  useEffect(() => {
    artificallyDelay(WorkoutApi.getWorkout(workoutId), 500).then(setWorkout);
  }, [workoutId]);

  const onSave = (workout: Workout) => {
    setWorkout(workout);
    //@ts-ignore
    invoke(WorkoutApi.saveWorkout)(workout);
  };

  return (
    <completedWorkoutContext.Provider value={{ workout, onSave }}>
      {children}
    </completedWorkoutContext.Provider>
  );
}

export function useCompletedWorkout() {
  return useContext(completedWorkoutContext);
}
