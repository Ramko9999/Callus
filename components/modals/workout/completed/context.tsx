import { WorkoutApi } from "@/api/workout";
import { useDebounce } from "@/components/hooks/use-debounce";
import { Workout } from "@/interface";
import { PLACEHOLDER_WORKOUT } from "@/util/mock";
import { createContext, useState, useEffect, useContext } from "react";
import { Skeleton } from "./skeleton";

type CompletedWorkoutState = {
  workout: Workout;
  onSave: (workout: Workout) => void;
};
const context = createContext<CompletedWorkoutState>({
  workout: PLACEHOLDER_WORKOUT,
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
    WorkoutApi.getWorkout(workoutId).then(setWorkout);
  }, []);

  const onSave = (workout: Workout) => {
    setWorkout(workout);
    //@ts-ignore
    invoke(WorkoutApi.saveWorkout)(workout);
  };

  if (!workout) {
    return <Skeleton />;
  }

  return (
    <context.Provider value={{ workout, onSave }}>{children}</context.Provider>
  );
}

export function useCompletedWorkout() {
  return useContext(context);
}
