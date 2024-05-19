import { NECK, PUSH, UPPER_BODY } from "@/constants/SampleWorkouts";
import { useWorkoutActivity } from "@/context/WorkoutActivityContext";
import { useNavigation, useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";
import { Button, StyleSheet } from "react-native";
import { useEffect } from "react";
import { WorkoutViewTile } from "@/components/workout/view";

const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: "600",
    fontSize: 16,
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

const workouts = [
  { name: "Push", workout: PUSH },
  { name: "Neck", workout: NECK },
];

function HomeHeader() {
  return <Text style={styles.headerTitle}>{"Today"}</Text>;
}

export default function Home() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerTitle: (_) => <HomeHeader /> });
  }, []);

  return (
    <View style={styles.workoutView}>
      <View style={styles.workoutViewTiles}>
        {workouts.map(({ name, workout }, index) => (
          <WorkoutViewTile key={index} workoutName={name} workout={workout} />
        ))}
      </View>
    </View>
  );
}
