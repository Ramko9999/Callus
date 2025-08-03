import { WorkoutQuery } from "@/api/model/workout";
import { WorkoutApi } from "@/api/workout";
import { useDebounce } from "@/components/hooks/use-debounce";
import { Exercise, Set, Workout } from "@/interface";
import { createContext, useState, useEffect, useContext, useMemo } from "react";

type LiveWorkoutState = {
  workout?: Workout;
  isInWorkout: boolean;
  saveWorkout: React.Dispatch<React.SetStateAction<Workout | undefined>>;
};

const LiveWorkoutContext = createContext<LiveWorkoutState>({
  isInWorkout: false,
  saveWorkout: () => {},
});

type LiveWorkoutProviderProps = {
  children: React.ReactNode;
};

export function LiveWorkoutProvider({ children }: LiveWorkoutProviderProps) {
  const [workout, setWorkout] = useState<Workout>();
  const { invoke } = useDebounce({ delay: 200 });

  useEffect(() => {
    if (workout) {
      //@ts-ignore
      invoke(WorkoutApi.saveWorkout)(workout);
    }
  }, [workout]);

  return (
    <LiveWorkoutContext.Provider
      value={{
        workout,
        saveWorkout: setWorkout,
        isInWorkout: workout != undefined,
      }}
    >
      {children}
    </LiveWorkoutContext.Provider>
  );
}

export function useLiveWorkout() {
  return useContext(LiveWorkoutContext);
}

function serialize(value: any | undefined): string {
  if (value === undefined) {
    return "undefined";
  }
  return JSON.stringify(value);
}

export function useLiveExercise(exerciseId: string): Exercise {
  const { workout } = useLiveWorkout();
  const exercise = workout!.exercises.find((e) => e.id === exerciseId)!;

  return useMemo(() => {
    return exercise;
  }, [serialize(exercise)]);
}

type CurrentSetResult = {
  set: Set;
  exercise: Exercise;
};

export function useCurrentSet(): CurrentSetResult | undefined {
  const { workout } = useLiveWorkout();
  const currentSetAndExercise =
    workout !== undefined
      ? WorkoutQuery.getCurrentSetAndExercise(workout!)
      : undefined;
  return useMemo(
    () => {
      return currentSetAndExercise;
    },
    [serialize(currentSetAndExercise)]
  );
}

type LiveSetResult = {
  set: Set;
  isCurrent: boolean;
  isBefore: boolean;
  isAfter: boolean;
};

export function useLiveSet(setId: string): LiveSetResult {
  const { workout } = useLiveWorkout();
  const currentSet = useCurrentSet();

  const exerciseSets = workout!.exercises.flatMap((exercise) =>
    exercise.sets.map((set) => ({ exercise, set }))
  );

  const setIndex = exerciseSets.findIndex(({ set }) => set.id === setId);
  const currentSetIndex = exerciseSets.findIndex(
    ({ set }) => set.id === currentSet?.set.id
  );

  const isCurrent = setIndex === currentSetIndex;
  const isBefore = currentSetIndex === -1 || setIndex < currentSetIndex;
  const isAfter = currentSetIndex >= 0 && setIndex > currentSetIndex;

  return useMemo(
    () => ({ set: exerciseSets[setIndex].set, isCurrent, isBefore, isAfter }),
    [serialize(exerciseSets[setIndex].set), isCurrent, isBefore, isAfter]
  );
}
