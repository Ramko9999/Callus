import { usePathname } from "expo-router";
import { Text, View } from "@/components/Themed";
import { StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { truncTime, getLongDateDisplay } from "@/util/date";
import { WorkoutApi } from "@/api/workout";
import { Workout } from "@/interface";
import { HistoricalEditorSheet } from "@/components/popup/workout/historical/index";
import { useLiveIndicator } from "@/components/popup/workout/live/index";
import { useWorkout } from "@/context/WorkoutContext";
import { createWorkoutFromWorkout } from "@/util/workout";
import { PLACEHOLDER_WORKOUT } from "@/util/mock";
import { CompletedWorkouts } from "./completed-workout";
import { useTabBar } from "@/components/util/tab-bar/context";
import { HeaderPage } from "@/components/util/header-page";
import { CalendarHeaderAction, Calendar } from "./calendar";
import { useWorkedOutDays } from "./hooks/use-worked-out-days";
import { StyleUtils } from "@/util/styles";

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

export default function Home() {
  const pathname = usePathname();

  const { refetch, hasWorkedOut } = useWorkedOutDays(truncTime(Date.now()));
  const [workoutDate, setWorkoutDate] = useState<number>(truncTime(Date.now()));
  const [loading, setLoading] = useState<boolean>(true);
  const [completedWorkouts, setCompletedWorkouts] = useState<Workout[]>([]);
  const [workoutToUpdate, setWorkoutToUpdate] = useState<Workout>();
  const [showMonthCalendar, setShowMonthCalendar] = useState<boolean>(false);
  const { isInWorkout, actions } = useWorkout();

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
            <CompletedWorkouts
              workouts={completedWorkouts}
              onSelect={(workout: Workout) => {
                liveIndicatorActions.hide();
                setWorkoutToUpdate(workout);
              }}
            />
          </>
        )}
      </HeaderPage>
      <HistoricalEditorSheet
        show={workoutToUpdate != undefined}
        hide={() => {
          setWorkoutToUpdate(undefined);
        }}
        onSave={(workout) => {
          WorkoutApi.saveWorkout(workout).then(() =>
            setWorkoutToUpdate(workout)
          );
        }}
        canRepeat={!isInWorkout}
        onRepeat={(workout) => {
          // todo: send an alert for why you can't start a workout if you are already in one
          actions.startWorkout(createWorkoutFromWorkout(workout));
        }}
        trash={() => WorkoutApi.deleteWorkout((workoutToUpdate as Workout).id)}
        workout={(workoutToUpdate ?? PLACEHOLDER_WORKOUT) as Workout}
      />
    </>
  );
}
