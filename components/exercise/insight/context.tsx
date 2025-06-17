import React, { createContext, useContext, useState, useMemo } from "react";
import { MetricConfig } from "@/interface";
import * as MetricApi from "@/api/metric";
import { getDifficultyType } from "@/api/exercise";
import { useUserDetails } from "@/components/user-details";

type ExerciseInsightContextType = {
  selectedMetricConfig?: MetricConfig;
  setSelectedMetricConfigIndex: (index: number) => void;
  setExerciseName: (name: string) => void;
  name: string;
};

const ExerciseInsightContext = createContext<ExerciseInsightContextType>({
  setSelectedMetricConfigIndex: () => {},
  setExerciseName: () => {},
  name: "",
});

type ExerciseInsightProviderProps = {
  children: React.ReactNode;
  initialExerciseName?: string;
};

export function ExerciseInsightProvider({
  children,
  initialExerciseName,
}: ExerciseInsightProviderProps) {
  const { userDetails } = useUserDetails();
  const [exerciseName, setExerciseName] = useState(initialExerciseName || "");
  const [selectedMetricIndex, setSelectedMetricIndex] = useState(0);

  const type = useMemo(
    () => (exerciseName ? getDifficultyType(exerciseName) : null),
    [exerciseName]
  );

  const metricConfigs = useMemo(
    () =>
      type
        ? MetricApi.getPossibleMetrics(type, userDetails?.bodyweight as number)
        : [],
    [type, userDetails?.bodyweight]
  );

  const selectedMetricConfig = metricConfigs[selectedMetricIndex];

  // Reset selected index when configs change
  React.useEffect(() => {
    setSelectedMetricIndex(0);
  }, [exerciseName]);

  const value = useMemo(
    () => ({
      selectedMetricConfig,
      setSelectedMetricConfigIndex: setSelectedMetricIndex,
      setExerciseName,
      name: exerciseName,
    }),
    [selectedMetricConfig, exerciseName]
  );

  return (
    <ExerciseInsightContext.Provider value={value}>
      {children}
    </ExerciseInsightContext.Provider>
  );
}

export function useExerciseInsight() {
  return useContext(ExerciseInsightContext);
}
