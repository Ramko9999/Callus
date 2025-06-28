import { WorkoutApi } from "@/api/workout";
import { CompletedExercise } from "@/interface";
import { createContext, useState, useEffect, useContext } from "react";
import { artificallyDelay } from "@/util/misc";

type ExerciseInsightsState = {
  completedExercises?: CompletedExercise[];
  selectedMetricIndex: number;
  setSelectedMetricIndex: (index: number) => void;
  isLoading: boolean;
};

const ExerciseInsightsContext = createContext<ExerciseInsightsState>({
  completedExercises: undefined,
  selectedMetricIndex: 0,
  setSelectedMetricIndex: () => {},
  isLoading: true,
});

type ExerciseInsightsProviderProps = {
  exerciseName: string;
  children: React.ReactNode;
};

export function ExerciseInsightsProvider({
  exerciseName,
  children,
}: ExerciseInsightsProviderProps) {
  const [completedExercises, setCompletedExercises] =
    useState<CompletedExercise[]>();
  const [selectedMetricIndex, setSelectedMetricIndex] = useState(0);

  useEffect(() => {
    setSelectedMetricIndex(0);
    artificallyDelay(WorkoutApi.getExerciseCompletions(exerciseName), 300).then(
      setCompletedExercises
    );
  }, [exerciseName]);

  return (
    <ExerciseInsightsContext.Provider
      value={{
        completedExercises,
        selectedMetricIndex,
        setSelectedMetricIndex,
        isLoading: completedExercises === undefined,
      }}
    >
      {children}
    </ExerciseInsightsContext.Provider>
  );
}

export function useExerciseInsights() {
  return useContext(ExerciseInsightsContext);
}
