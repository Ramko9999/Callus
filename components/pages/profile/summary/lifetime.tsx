import React, { useState, useCallback, ReactNode } from "react";
import { useThemeColoring, View, Text } from "@/components/Themed";
import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { Clock, Dumbbell } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { WorkoutApi } from "@/api/workout";
import { WorkoutLifetimeStats } from "@/interface";
import { convertHexToRGBA } from "@/util/color";
import { TextSkeleton } from "@/components/util/loading";


type LifetimeSummaryStatProps = {
  value: string;
  label: string;
  icon: ReactNode;
  isLoading?: boolean;
};

const lifetimeStatStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(2),
    alignItems: "center",
    padding: "3%",
    borderRadius: 12,
    width: "45%",
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: 5,
  }
});

function LifetimeSummaryStat({ value, label, icon, isLoading = false }: LifetimeSummaryStatProps) {
  const accentColor = useThemeColoring("primaryAction");
  const statItemColor = convertHexToRGBA(accentColor, 0.1);


  return (
    <View
      style={[
        lifetimeStatStyles.container,
        { backgroundColor: statItemColor },
      ]}
    >
      <View style={lifetimeStatStyles.iconContainer}>
        {icon}
      </View>

      {isLoading ? (
        <TextSkeleton
          text="1000"
          style={lifetimeStatStyles.value}
        />
      ) : (
        <Text style={lifetimeStatStyles.value}>
          {value}
        </Text>
      )}

      {isLoading ? (
        <TextSkeleton
          text={label}
          style={lifetimeStatStyles.label}
        />
      ) : (
        <Text style={lifetimeStatStyles.label}>
          {label}
        </Text>
      )}
    </View>
  );
}


const lifetimeSummaryStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(15),
  },
  header: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
  },
  statsContainer: {
    ...StyleUtils.flexRow(15),
    justifyContent: "space-around",
  },
});

export function LifetimeSummary() {
  const [stats, setStats] = useState<WorkoutLifetimeStats>({
    totalWorkouts: 0,
    totalWorkoutDuration: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const accentColor = useThemeColoring("primaryAction");

  useFocusEffect(
    useCallback(() => {
      WorkoutApi.getLifetimeStats()
        .then((data) => {
          setStats(data);
          setIsLoading(false);
        });
    }, [])
  );

  // Calculate hours with one decimal place
  const hoursWorkedOut = (stats.totalWorkoutDuration / 1000 / 3600).toFixed(1);

  return (
    <View style={lifetimeSummaryStyles.container}>
      <View style={lifetimeSummaryStyles.header}>
        <Text header emphasized>
          Lifetime
        </Text>
      </View>

      <View style={lifetimeSummaryStyles.statsContainer}>
        <LifetimeSummaryStat
          value={String(stats.totalWorkouts)}
          label="Workouts"
          icon={<Dumbbell size={20} color={accentColor} />}
          isLoading={isLoading}
        />

        <LifetimeSummaryStat
          value={`${hoursWorkedOut}h`}
          label="Time Logged"
          icon={<Clock size={20} color={accentColor} />}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
}
