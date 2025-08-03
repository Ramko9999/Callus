import { WorkoutApi } from "@/api/workout";
import { useDebounce } from "@/components/hooks/use-debounce";
import { Routine } from "@/interface";
import { PLACEHOLDER_ROUTINE } from "@/util/mock";
import { createContext, useContext, useEffect, useState } from "react";
import { Skeleton } from "./skeleton";

type RoutineState = {
  routine: Routine;
  onSave: (routine: Routine) => void;
};

const context = createContext<RoutineState>({
  routine: PLACEHOLDER_ROUTINE,
  onSave: () => {},
});

type RoutineProviderProps = {
  routineId: string;
  children: React.ReactNode;
};

export function RoutineProvider({ routineId, children }: RoutineProviderProps) {
  const [routine, setRoutine] = useState<Routine>();
  const { invoke } = useDebounce({ delay: 200 });

  useEffect(() => {
    WorkoutApi.getRoutine(routineId).then(setRoutine);
  }, []);

  const onSave = (routine: Routine) => {
    setRoutine(routine);
    //@ts-ignore
    invoke(WorkoutApi.saveRoutine)(routine);
  };

  if (!routine) {
    return <Skeleton />;
  }

  return (
    <context.Provider value={{ routine, onSave }}>{children}</context.Provider>
  );
}

export function useRoutine() {
  return useContext(context);
}
