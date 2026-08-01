import { WorkoutApi } from "@/api/workout";
import { useDebounce } from "@/components/hooks/use-debounce";
import { Routine } from "@/interface";
import { PLACEHOLDER_ROUTINE } from "@/util/mock";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  isDraft?: boolean;
  children: React.ReactNode;
};

export function RoutineProvider({
  routineId,
  isDraft = false,
  children,
}: RoutineProviderProps) {
  const [routine, setRoutine] = useState<Routine | undefined>(
    isDraft ? { id: routineId, name: "New Routine", plan: [] } : undefined
  );
  const hasPersisted = useRef(!isDraft);
  const { invoke } = useDebounce({ delay: 200 });

  useEffect(() => {
    if (!isDraft) {
      WorkoutApi.getRoutine(routineId).then(setRoutine);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDraft, routineId]);

  const onSave = (updated: Routine) => {
    setRoutine(updated);
    const isMeaningful =
      updated.name !== "New Routine" || updated.plan.length > 0;
    if (!hasPersisted.current && !isMeaningful) {
      return;
    }
    hasPersisted.current = true;
    //@ts-ignore
    invoke(WorkoutApi.saveRoutine)(updated);
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
