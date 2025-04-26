import { useThemeColoring, View, Text } from "@/components/Themed";
import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { Clock, Dumbbell } from "lucide-react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { WorkoutApi } from "@/api/workout";
import { WorkoutLifetimeStats } from "@/interface";
import { convertHexToRGBA } from "@/util/color";

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
  statItem: {
    ...StyleUtils.flexColumn(2),
    alignItems: "center",
    padding: "3%",
    borderRadius: 12,
    width: "45%",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: 5,
  },
});

export function LifetimeSummary() {
  const [stats, setStats] = useState<WorkoutLifetimeStats>({
    totalWorkouts: 0,
    totalWorkoutDuration: 0,
  });
  const accentColor = useThemeColoring("primaryAction");
  const statItemColor = convertHexToRGBA(accentColor, 0.1);

  useFocusEffect(
    useCallback(() => {
      WorkoutApi.getLifetimeStats().then(setStats);
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
        <View
          style={[
            lifetimeSummaryStyles.statItem,
            { backgroundColor: statItemColor },
          ]}
        >
          <View style={lifetimeSummaryStyles.iconContainer}>
            <Dumbbell size={20} color={accentColor} />
          </View>
          <Text style={lifetimeSummaryStyles.statValue}>
            {stats.totalWorkouts}
          </Text>
          <Text style={lifetimeSummaryStyles.statLabel}>Workouts</Text>
        </View>

        <View
          style={[
            lifetimeSummaryStyles.statItem,
            { backgroundColor: statItemColor },
          ]}
        >
          <View style={lifetimeSummaryStyles.iconContainer}>
            <Clock size={20} color={accentColor} />
          </View>
          <Text style={lifetimeSummaryStyles.statValue}>{hoursWorkedOut}h</Text>
          <Text style={lifetimeSummaryStyles.statLabel}>Time Logged</Text>
        </View>
      </View>
    </View>
  );
}
