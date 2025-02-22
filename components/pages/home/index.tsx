import { Text, useThemeColoring, View } from "@/components/Themed";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { truncTime, getLongDateDisplay } from "@/util/date";
import { WorkoutApi } from "@/api/workout";
import { Workout } from "@/interface";
import { useWorkout } from "@/context/WorkoutContext";
import { CompletedWorkouts, NoWorkoutsLogged } from "./completed-workout";
import { HeaderPage } from "@/components/util/header-page";
import { CalendarHeaderAction, Calendar } from "./calendar";
import { useWorkedOutDays } from "./hooks/use-worked-out-days";
import { StyleUtils } from "@/util/styles";
import { useUserDetails } from "@/components/user-details";
import { Dumbbell } from "@/components/theme/custom-svg";
import * as Haptics from "expo-haptics";
import { WorkoutActions } from "@/api/model/workout";
import { useToast } from "react-native-toast-notifications";
import { useNavigation } from "@react-navigation/native";

const loadingWorkoutsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
    height: "100%",
  },
});

// todo: figure out a placeholder for when we don't have any workouts done for a day
function LoadingWorkouts() {
  return (
    <View style={loadingWorkoutsStyles.container}>
      <Text>Loading workouts...</Text>
    </View>
  );
}

const quickStartWorkoutStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    alignItems: "center",
    borderRadius: 5,
    padding: "2%",
  },
  scrollContainer: {
    marginTop: "3%",
    paddingHorizontal: "3%",
    flex: 1,
  },
  cta: {
    marginTop: -10,
  },
  icon: {
    marginTop: -20,
  },
  ctaText: {
    fontWeight: 600,
  },
});

type QuickStartWorkoutProps = {
  onClick: () => void;
};

function QuickStartWorkout({ onClick }: QuickStartWorkoutProps) {
  return (
    <ScrollView contentContainerStyle={quickStartWorkoutStyles.scrollContainer}>
      <TouchableOpacity
        style={[
          quickStartWorkoutStyles.container,
          { backgroundColor: useThemeColoring("primaryViewBackground") },
        ]}
        onPress={onClick}
      >
        <View style={quickStartWorkoutStyles.icon}>
          <Dumbbell
            color={useThemeColoring("primaryAction")}
            size={96}
            fill={useThemeColoring("primaryAction")}
            viewBox="0 0 48 48"
            strokeWidth={1}
          />
        </View>
        <View style={quickStartWorkoutStyles.cta}>
          <Text
            style={[
              { color: useThemeColoring("primaryAction") },
              quickStartWorkoutStyles.ctaText,
            ]}
          >
            Start an empty workout
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function Home() {
  const navigation = useNavigation();
  const { refetch, hasWorkedOut } = useWorkedOutDays(truncTime(Date.now()));
  const [workoutDate, setWorkoutDate] = useState<number>(truncTime(Date.now()));
  const [loading, setLoading] = useState<boolean>(true);
  const [completedWorkouts, setCompletedWorkouts] = useState<Workout[]>([]);
  const [showMonthCalendar, setShowMonthCalendar] = useState<boolean>(false);
  const { isInWorkout, actions } = useWorkout();
  const { userDetails } = useUserDetails();
  const toast = useToast();

  const loadWorkouts = async () => {
    WorkoutApi.getWorkouts(truncTime(workoutDate))
      .then(setCompletedWorkouts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWorkouts();
    refetch(workoutDate);
  }, [workoutDate]);

  // todo: load when route changes
  useEffect(() => {
    loadWorkouts();
    refetch(workoutDate, true);
  }, [isInWorkout]);

  return (
    <>
      <HeaderPage
        title={getLongDateDisplay(workoutDate)}
        rightAction={
          <CalendarHeaderAction
            toggle={() => setShowMonthCalendar((show) => !show)}
            showingMonthCalendar={showMonthCalendar}
          />
        }
      >
        <Calendar
          currentDate={workoutDate}
          onSelectDate={setWorkoutDate}
          showMonthCalendar={showMonthCalendar}
          isActive={hasWorkedOut}
        />
        {loading ? (
          <LoadingWorkouts />
        ) : (
          <>
            {completedWorkouts.length === 0 ? (
              truncTime(workoutDate) === truncTime(Date.now()) ? (
                <QuickStartWorkout
                  onClick={() => {
                    if (isInWorkout) {
                      toast.show(
                        "Please finish your current workout before trying to start another workout",
                        { type: "danger" }
                      );
                    } else {
                      const workout = WorkoutActions.createFromQuickStart(
                        userDetails?.bodyweight as number
                      );
                      actions.startWorkout(workout);
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success
                      );
                    }
                  }}
                />
              ) : (
                <NoWorkoutsLogged />
              )
            ) : (
              <CompletedWorkouts
                workouts={completedWorkouts}
                onSelect={(workout: Workout) => {
                  // @ts-ignore
                  navigation.navigate("completedWorkout", { id: workout.id });
                }}
              />
            )}
          </>
        )}
      </HeaderPage>
    </>
  );
}
