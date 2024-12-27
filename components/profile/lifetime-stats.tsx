import { WorkoutLifetimeStats } from "@/interface";
import { StyleUtils } from "@/util/styles";
import { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "../Themed";
import { WorkoutApi } from "@/api/workout";
import { Duration, getDuration, roundToNearestMinute } from "@/util/date";
import React from "react";
import { usePathname } from "expo-router";

const lifetimeStatStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    flex: 1,
    borderRadius: 10,
  },
  content: {
    height: "90%",
    marginLeft: "8%",
    marginVertical: "3%",
    ...StyleUtils.flexColumn(),
  },
});

type LifetimeStatProps = {
  title: string;
  children: React.ReactNode;
};

function LifetimeStat({ title, children }: LifetimeStatProps) {
  return (
    <View background style={lifetimeStatStyles.container}>
      <View style={lifetimeStatStyles.content}>
        <Text neutral light>
          {title}
        </Text>
        {children}
      </View>
    </View>
  );
}

const totalWorkoutDurationDisplayStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(2),
    alignItems: "baseline",
  },
});

type TotalWorkoutDurationDisplayProps = {
  duration: Duration;
};

function TotalWorkoutDurationDisplay({
  duration,
}: TotalWorkoutDurationDisplayProps) {
  const { hours, minutes, seconds } = duration;
  if (hours === 0 && minutes === 0 && seconds === 0) {
    return (
      <View style={totalWorkoutDurationDisplayStyles.container}>
        <Text stat>00</Text>
        <Text large light emphasized>
          {"m"}
        </Text>
      </View>
    );
  }

  return (
    <View style={totalWorkoutDurationDisplayStyles.container}>
      {hours > 0 && (
        <>
          <Text stat>{hours}</Text>
          <Text large light emphasized>
            {"h"}
          </Text>
        </>
      )}
      {minutes > 0 && (
        <>
          <Text stat>
            {minutes.toString().padStart(2, "0")}
          </Text>
          <Text large light emphasized>
            {"m"}
          </Text>
        </>
      )}
    </View>
  );
}

const totalWorkoutCountDisplayStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(2),
    alignItems: "baseline",
  },
});

type TotalWorkoutCountDisplayProps = {
  workoutCount: number;
};

function TotalWorkoutCountDisplay({
  workoutCount,
}: TotalWorkoutCountDisplayProps) {
  return (
    <View style={totalWorkoutCountDisplayStyles.container}>
      <Text stat>{workoutCount}</Text>
      <Text large light emphasized>
        #
      </Text>
    </View>
  );
}

const lifetimeStatsStyles = StyleSheet.create({
  content: {
    flex: 1,
    ...StyleUtils.flexRow(10),
    justifyContent: "space-around",
  },
  container: {
    ...StyleUtils.flexColumn(10),
  },
});

type LifetimeStatsState = WorkoutLifetimeStats;

export function LifetimeStats() {
  const pathname = usePathname();
  const [{ totalWorkouts, totalWorkoutDuration }, setStats] =
    useState<LifetimeStatsState>({ totalWorkouts: 0, totalWorkoutDuration: 0 });

  useEffect(() => {
    WorkoutApi.getLifetimeStats().then(setStats);
  }, [pathname]);

  return (
    <View style={lifetimeStatsStyles.container}>
      <Text action>Lifetime</Text>
      <View style={lifetimeStatsStyles.content}>
        <LifetimeStat title="Completed Workouts">
          <TotalWorkoutCountDisplay workoutCount={totalWorkouts} />
        </LifetimeStat>
        <LifetimeStat title="Time Worked Out">
          <TotalWorkoutDurationDisplay
            duration={getDuration(roundToNearestMinute(totalWorkoutDuration))}
          />
        </LifetimeStat>
      </View>
    </View>
  );
}
