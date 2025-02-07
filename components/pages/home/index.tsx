import { usePathname } from "expo-router";
import { Text, useThemeColoring, View } from "@/components/Themed";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { truncTime, getLongDateDisplay } from "@/util/date";
import { WorkoutApi } from "@/api/workout";
import { Workout } from "@/interface";
import { HistoricalEditorSheet } from "@/components/popup/workout/historical/index";
import { useLiveIndicator } from "@/components/popup/workout/live/index";
import { useWorkout } from "@/context/WorkoutContext";
import { createWorkoutFromWorkout } from "@/util/workout";
import { PLACEHOLDER_WORKOUT } from "@/util/mock";
import { CompletedWorkouts, NoWorkoutsLogged } from "./completed-workout";
import { useTabBar } from "@/components/util/tab-bar/context";
import { HeaderPage } from "@/components/util/header-page";
import { CalendarHeaderAction, Calendar } from "./calendar";
import { useWorkedOutDays } from "./hooks/use-worked-out-days";
import { StyleUtils } from "@/util/styles";
import { useUserDetails } from "@/components/user-details";
import { useDebounce } from "@/components/hooks/use-debounce";
import { Dumbbell } from "@/components/theme/custom-svg";
import * as Haptics from "expo-haptics";
import { WorkoutActions } from "@/api/model/workout";
import { useToast } from "react-native-toast-notifications";

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
  const pathname = usePathname();

  const { refetch, hasWorkedOut } = useWorkedOutDays(truncTime(Date.now()));
  const [workoutDate, setWorkoutDate] = useState<number>(truncTime(Date.now()));
  const [loading, setLoading] = useState<boolean>(true);
  const [completedWorkouts, setCompletedWorkouts] = useState<Workout[]>([]);
  const [workoutToUpdate, setWorkoutToUpdate] = useState<Workout>();
  const [showMonthCalendar, setShowMonthCalendar] = useState<boolean>(false);
  const { isInWorkout, actions } = useWorkout();
  const { userDetails } = useUserDetails();
  const { invoke } = useDebounce({ delay: 200 });
  const toast = useToast();

  const tabBarActions = useTabBar();
  const liveIndicatorActions = useLiveIndicator();

  const loadWorkouts = async () => {
    WorkoutApi.getWorkouts(truncTime(workoutDate))
      .then(setCompletedWorkouts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWorkouts();
    refetch(workoutDate);
  }, [workoutDate]);

  useEffect(() => {
    loadWorkouts();
    refetch(workoutDate, true);
  }, [workoutToUpdate, isInWorkout, pathname]);

  useEffect(() => {
    if (workoutToUpdate) {
      tabBarActions.close();
      liveIndicatorActions.hide();
    } else {
      tabBarActions.open();
      liveIndicatorActions.show();
    }
  }, [workoutToUpdate]);

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
                  liveIndicatorActions.hide();
                  setWorkoutToUpdate(workout);
                }}
              />
            )}
          </>
        )}
      </HeaderPage>
      <HistoricalEditorSheet
        show={workoutToUpdate != undefined}
        hide={() => {
          setWorkoutToUpdate(undefined);
        }}
        onSave={(workout) => {
          // todo: ensure we save whenever we exit the app before releasing actuallly
          setWorkoutToUpdate(workout);
          // @ts-ignore
          invoke(WorkoutApi.saveWorkout)(workout);
        }}
        canRepeat={!isInWorkout}
        onRepeat={(workout) => {
          // todo: send an alert for why you can't start a workout if you are already in one
          actions.startWorkout(
            createWorkoutFromWorkout(workout, userDetails?.bodyweight as number)
          );
        }}
        trash={() => WorkoutApi.deleteWorkout((workoutToUpdate as Workout).id)}
        workout={(workoutToUpdate ?? PLACEHOLDER_WORKOUT) as Workout}
      />
    </>
  );
}
