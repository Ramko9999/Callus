import { useNavigation, usePathname, useRouter } from "expo-router";
import { Action, Icon, Text, View } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import {
  WorkoutPlanViewTile,
  WorkoutViewTile,
} from "@/components/workout/view";
import { getDateDisplay, truncTime, addDays, removeDays } from "@/util";
import { WorkoutItinerary, WorkoutApi } from "@/api/workout";
import { useWorkout } from "@/context/WorkoutContext";
import { Workout, WorkoutPlan } from "@/interface";
import { ProgramApi } from "@/api/program";

const styles = StyleSheet.create({
  expansiveCenterAlignedView: {
    height: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  workoutItineraryView: {
    flexDirection: "row",
    justifyContent: "center",
  },
  headerTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  headerView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    justifyContent: "center",
  },
  headerAction: {
    padding: "8%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  workoutView: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    alignItems: "center",
  },
  workoutViewTiles: {
    display: "flex",
    flexDirection: "column",
    margin: 20,
    width: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    gap: 20,
  },
  workoutViewPlan: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
    width: "100%",
    backgroundColor: "transparent"
  },
});

type HomeHeaderProps = {
  date: number;
  onLookBack: () => void;
  onLookForward: () => void;
  canLookForward: boolean;
};

function HomeHeader({
  date,
  onLookBack,
  onLookForward,
  canLookForward,
}: HomeHeaderProps) {
  return (
    <View _type="background" style={styles.headerView}>
      <TouchableOpacity onPress={onLookBack}>
        <View _type="background" style={styles.headerAction}>
          <Icon name={"caret-left"} size={24} />
        </View>
      </TouchableOpacity>
      <Text _type="neutral">{getDateDisplay(date)}</Text>
      {canLookForward && (
        <TouchableOpacity onPress={onLookForward}>
          <View _type="background" style={styles.headerAction}>
            <Icon name={"caret-right"} size={24} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

function WorkoutItineraryLoading() {
  return (
    <View _type="background" style={styles.expansiveCenterAlignedView}>
      <Text _type="neutral">Loading workouts...</Text>
    </View>
  );
}

type WorkoutItineraryProps = {
  workoutItinerary: WorkoutItinerary;
  date: number;
  comeBackToToday: () => void;
};

function WorkoutItineraryView({
  workoutItinerary,
  date,
  comeBackToToday
}: WorkoutItineraryProps) {
  const { actions, isInWorkout } = useWorkout();
  const router = useRouter();

  const { workouts, workoutPlans } = workoutItinerary;
  const completedWorkouts = workouts.filter(
    (workout) => workout.endedAt != undefined
  );
  const inProgressWorkouts = workouts.filter(
    (workout) => workout.endedAt == undefined
  );
  const isRestDay = workouts.length === 0 && workoutPlans.length === 0;

  const onResumeInProgressWorkout = (workout: Workout) => {
    actions.resumeInProgressWorkout(workout);
    router.push("/workout-player");
  };

  const onStartWorkout = (workoutPlan: WorkoutPlan) => {
    actions.startWorkout(workoutPlan);
    router.push("/workout-player");
  };

  const isToday = truncTime(Date.now()) === date;
  const isYesterday = removeDays(truncTime(Date.now()), 1) === date;
  const isFromPast = truncTime(Date.now()) > date;

  return isRestDay ? (
    <View _type="background" style={styles.expansiveCenterAlignedView}>
      <Text _type="neutral">It's a rest day. Take it easy :)</Text>
    </View>
  ) : (
    <View _type="background" style={styles.workoutView}>
      <View style={styles.workoutViewTiles}>
        {completedWorkouts.length > 0 && <Text _type="neutral">Completed</Text>}
        {completedWorkouts.map((workout, index) => (
          <WorkoutViewTile key={index} workout={workout} />
        ))}
        {inProgressWorkouts.length > 0 && (
          <Text _type="neutral">In Progress</Text>
        )}
        {inProgressWorkouts.map((workout, index) => (
          <WorkoutViewTile
            key={index}
            workout={workout}
            onClick={() => onResumeInProgressWorkout(workout)}
          />
        ))}
        {workoutPlans.length > 0 && (
          <Text _type="neutral">
            {isToday ? "Todo" : isFromPast ? "Missed" : "Upcoming"}
          </Text>
        )}
        {workoutPlans.map((workoutPlan, index) => (
          <View _type="background" style={styles.workoutViewPlan} key={index}>
            <WorkoutPlanViewTile
              workoutPlan={workoutPlan}
              onClick={
                isToday && !isInWorkout
                  ? () => {
                      onStartWorkout(workoutPlan);
                    }
                  : () => {}
              }
            />
            {isYesterday && (
              <Action
                _action={{ type: "neutral", name: "Do it today!" }}
                onPress={() => {
                  ProgramApi.skipDate(date).then(comeBackToToday);
                }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function Home() {
  const navigation = useNavigation();
  const router = useRouter();
  const pathname = usePathname();
  const [workoutDate, setWorkoutDate] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(true);
  const [workoutItinerary, setWorkoutItinerary] = useState<WorkoutItinerary>();
  const { actions } = useWorkout();

  useEffect(() => {
    WorkoutApi.getInProgressWorkout().then((workout) => {
      if (workout) {
        actions.resumeInProgressWorkout(workout);
        router.push("/workout-player");
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    navigation.setOptions({
      headerTitle: (props: any) => (
        <HomeHeader
          {...props}
          date={workoutDate}
          onLookBack={() => {
            setWorkoutDate((wd) => removeDays(wd, 1));
          }}
          onLookForward={() => {
            setWorkoutDate((wd) => addDays(wd, 1));
          }}
          canLookForward={true} //truncTime(addDays(workoutDate, 1)) <= truncTime(Date.now())}
        />
      ),
    });

    WorkoutApi.getWorkoutItinerary(truncTime(workoutDate))
      .then(setWorkoutItinerary)
      .finally(() => setLoading(false));
  }, [workoutDate, pathname]);

  return loading ? (
    <WorkoutItineraryLoading />
  ) : (
    <WorkoutItineraryView
      workoutItinerary={workoutItinerary as WorkoutItinerary}
      date={truncTime(workoutDate)}
      comeBackToToday={()=> setWorkoutDate(Date.now())}
    />
  );
}
