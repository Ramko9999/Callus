import { Text, useThemeColoring, View } from "@/components/Themed";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  truncTime,
  getDurationDisplay,
  getTimePeriodDisplay,
} from "@/util/date";
import { WorkoutApi } from "@/api/workout";
import {
  Workout,
  WorkoutActivityType,
  ExercisingActivity,
  RestingActivity,
} from "@/interface";
import { CompletedWorkouts } from "./completed-workout";
import { HeaderPage } from "@/components/util/header-page";
import { StyleUtils } from "@/util/styles";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Calendar, CalendarItem } from "./calendar";
import {
  DurationMetaIcon,
  RepsMetaIcon,
  WeightMetaIcon,
} from "@/components/theme/icons";
import { getWorkoutSummary } from "@/context/WorkoutContext";
import { getNumberSuffix } from "@/util/misc";
import { Loading } from "@/components/util/loading";
import { usePopup } from "@/components/popup";
import * as Haptics from "expo-haptics";
import { Plus } from "lucide-react-native";
import { LiveWorkoutPreview } from "@/components/workout/preview";
import { PlusButton } from "@/components/pages/common";
import { useRestSounds } from "@/components/hooks/use-rest";



const completedWorkoutsSummaryStyles = StyleSheet.create({
  container: {
    paddingHorizontal: "4%",
    paddingVertical: "3%",
  },
  summary: {
    ...StyleUtils.flexRow(10),
    flexWrap: "wrap",
    paddingTop: "1%",
  },
  workoutCount: {
    ...StyleUtils.flexRow(5),
    alignItems: "center",
  },
});

const homeStyles = StyleSheet.create({
  calendar: {
    marginTop: "3%",
  },
});

type CompletedWorkoutsSummaryProps = {
  workouts: Workout[];
  calendarItem: CalendarItem;
};

function CompletedWorkoutsSummary({
  workouts,
  calendarItem,
}: CompletedWorkoutsSummaryProps) {
  const totalStats = workouts.reduce(
    (acc, workout) => {
      const { totalWeightLifted, totalReps, totalDuration } =
        getWorkoutSummary(workout);
      return {
        totalWeightLifted: acc.totalWeightLifted + totalWeightLifted,
        totalReps: acc.totalReps + totalReps,
        totalDuration: acc.totalDuration + totalDuration,
      };
    },
    { totalWeightLifted: 0, totalReps: 0, totalDuration: 0 }
  );

  const date = new Date(
    calendarItem.year,
    calendarItem.month,
    calendarItem.day ?? 1
  );
  const monthYear = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const formattedDate = calendarItem.day
    ? `${date.toLocaleString("default", { month: "long" })} ${
        calendarItem.day
      }${getNumberSuffix(calendarItem.day)}, ${calendarItem.year}`
    : monthYear;

  return (
    <View style={completedWorkoutsSummaryStyles.container}>
      <Text emphasized style={{ fontSize: 18 }}>
        {formattedDate}
      </Text>
      <View style={completedWorkoutsSummaryStyles.summary}>
        {!calendarItem.day && (
          <View style={completedWorkoutsSummaryStyles.workoutCount}>
            <Text light neutral>
              {workouts.length} {workouts.length === 1 ? "workout" : "workouts"}
            </Text>
          </View>
        )}
        <WeightMetaIcon weight={totalStats.totalWeightLifted} />
        <RepsMetaIcon reps={totalStats.totalReps} />
        <DurationMetaIcon
          durationInMillis={totalStats.totalDuration}
          shouldDisplayDecimalHours={true}
        />
      </View>
    </View>
  );
}

export default function Home() {
  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState<CalendarItem>(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: null,
    };
  });
  const [monthWorkouts, setMonthWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { startWorkout } = usePopup();

  useRestSounds();

  useFocusEffect(
    useCallback(() => {
      getWorkoutHistory(selectedItem)
        .then(setMonthWorkouts)
        .finally(() => setIsLoading(false));
    }, [selectedItem.year, selectedItem.month])
  );
  useEffect(() => {
    setIsLoading(true);
    getWorkoutHistory(selectedItem)
      .then(setMonthWorkouts)
      .finally(() => setIsLoading(false));
  }, [selectedItem.year, selectedItem.month]);

  const filteredWorkouts = getFilteredWorkouts(
    monthWorkouts,
    selectedItem.year,
    selectedItem.month,
    selectedItem.day
  );

  const handleStartWorkout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    startWorkout.open();
  }, [startWorkout]);

  return (
    <>
      <HeaderPage
        title="History"
        rightAction={<PlusButton onClick={handleStartWorkout} />}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={homeStyles.calendar}>
            <Calendar onDateChange={setSelectedItem} />
          </View>
          <CompletedWorkoutsSummary
            workouts={filteredWorkouts}
            calendarItem={selectedItem}
          />
          {isLoading ? (
            <Loading />
          ) : (
            <CompletedWorkouts
              workouts={filteredWorkouts}
              onSelect={(workout: Workout) => {
                // @ts-ignore
                //navigation.navigate("heatmap", { workoutId: workout.id });
                navigation.navigate("completedWorkoutSheet", {
                  id: workout.id,
                });
              }}
            />
          )}
        </ScrollView>
      </HeaderPage>
      <LiveWorkoutPreview />
    </>
  );
}

function getFilteredWorkouts(
  workouts: Workout[],
  year: number,
  month: number,
  day: number | null
): Workout[] {
  if (day === null) {
    return workouts.sort((a, b) => b.startedAt - a.startedAt);
  }

  const dayStart = new Date(year, month, day);
  const dayEnd = new Date(year, month, day + 1);
  return workouts
    .filter(
      (workout) =>
        workout.startedAt >= truncTime(dayStart.getTime()) &&
        workout.startedAt < truncTime(dayEnd.getTime())
    )
    .sort((a, b) => b.startedAt - a.startedAt);
}

async function getWorkoutHistory(item: CalendarItem): Promise<Workout[]> {
  const startDate = new Date(item.year, item.month, 1);
  const endDate = new Date(item.year, item.month + 1, 1);
  return WorkoutApi.getWorkoutsFromRange(
    truncTime(startDate.getTime()),
    truncTime(endDate.getTime())
  );
}
