import { useNavigation, usePathname } from "expo-router";
import { Icon, Text, View } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import {
  WorkoutPlanViewTile,
  WorkoutViewTile,
} from "@/components/workout/view";
import { getDateDisplay, truncTime, addDays, removeDays } from "@/util";
import { WorkoutItinerary, WorkoutStoreApi } from "@/app/api/workout-store";

const styles = StyleSheet.create({
  expansiveCenterAlignedView: {
    height: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
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
    backgroundColor: "transparent",
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
});

type HomeHeaderProps = {
  date: number;
  onLookBack: () => void;
  onLookForward: () => void;
};

function HomeHeader({ date, onLookBack, onLookForward }: HomeHeaderProps) {
  return (
    <View _type="background" style={styles.headerView}>
      <TouchableOpacity onPress={onLookBack}>
        <View _type="background" style={styles.headerAction}>
          <Icon name={"caret-left"} size={24} />
        </View>
      </TouchableOpacity>
      <Text _type="neutral">{getDateDisplay(date)}</Text>
      <TouchableOpacity onPress={onLookForward}>
        <View _type="background" style={styles.headerAction}>
          <Icon name={"caret-right"} size={24} />
        </View>
      </TouchableOpacity>
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
  isForToday: boolean
};

function WorkoutItineraryView({ workoutItinerary, isForToday }: WorkoutItineraryProps) {
  const { workouts, workoutPlans } = workoutItinerary;
  const completedWorkouts = workouts.filter(
    (workout) => workout.endedAt != undefined
  );
  const inProgressWorkouts = workouts.filter(
    (workout) => workout.endedAt == undefined
  );
  const isRestDay = workouts.length === 0 && workoutPlans.length === 0;

  return isRestDay ? (
    <View _type="background" style={styles.expansiveCenterAlignedView}>
      <Text _type="neutral">It's a rest day. Take it easy :)</Text>
    </View>
  ) : (
    <View style={styles.workoutView}>
      <View style={styles.workoutViewTiles}>
        {completedWorkouts.length > 0 && <Text _type="neutral">Completed</Text>}
        {completedWorkouts.map((workout, index) => (
          <WorkoutViewTile key={index} workout={workout} />
        ))}
        {inProgressWorkouts.length > 0 && (
          <Text _type="neutral">In Progress</Text>
        )}
        {inProgressWorkouts.map((workout, index) => (
          <WorkoutViewTile key={index} workout={workout} />
        ))}
        {workoutPlans.length > 0 && <Text _type="neutral">{isForToday ? "Upcoming": "Missed"}</Text>}
        {workoutPlans.map((workoutPlan, index) => (
          <WorkoutPlanViewTile key={index} workoutPlan={workoutPlan} />
        ))}
      </View>
    </View>
  );
}

export default function Home() {
  const navigation = useNavigation();
  const pathname = usePathname();
  const [workoutDate, setWorkoutDate] = useState<number>(truncTime(Date.now()));
  const [loading, setLoading] = useState<boolean>(true);
  const [workoutItinerary, setWorkoutItinerary] = useState<WorkoutItinerary>();

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
        />
      ),
    });

    WorkoutStoreApi.getWorkoutItineray(workoutDate)
      .then(setWorkoutItinerary)
      .finally(() => setLoading(false));
  }, [workoutDate, pathname]);

  return loading ? (
    <WorkoutItineraryLoading />
  ) : (
    <WorkoutItineraryView
      workoutItinerary={workoutItinerary as WorkoutItinerary}
      isForToday={workoutDate === truncTime(Date.now())}
    />
  );
}
