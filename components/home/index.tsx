import { useNavigation, useRouter } from "expo-router";
import { Icon, Text, View } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { WorkoutPlanViewTile, WorkoutViewTile } from "@/components/workout/view";
import { getDateDisplay, truncTime, addDays, removeDays } from "@/util";
import { Workout, WorkoutPlan } from "@/interface";
import { WorkoutStoreApi } from "@/app/api/workout-store";

const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  headerView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    justifyContent: "center"
  },
  headerAction: {
    padding: "8%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
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

export default function Home() {
  const navigation = useNavigation();
  const [workoutDate, setWorkoutDate] = useState<number>(truncTime(Date.now()));
  const [plannedWorkouts, setPlannedWorkouts] = useState<WorkoutPlan[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
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
    WorkoutStoreApi.getPlannedWorkouts(workoutDate).then(setPlannedWorkouts);
    WorkoutStoreApi.getWorkouts(workoutDate).then(setWorkouts);
  }, [workoutDate]);

  return (
    <View style={styles.workoutView}>
      <View style={styles.workoutViewTiles}>
        {
        workouts.map((workout, index) => (
            <WorkoutViewTile key={index} workout={workout}/>
        ))
        }
        {plannedWorkouts.map((workoutPlan, index) => (
          <WorkoutPlanViewTile key={index} workoutPlan={workoutPlan} />
        ))}
      </View>
    </View>
  );
}
