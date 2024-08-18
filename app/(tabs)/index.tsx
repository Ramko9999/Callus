import { NECK, PUSH } from "@/constants/SampleWorkouts";
import { useNavigation, useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";
import { StyleSheet, Button } from "react-native";
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

const workouts = [PUSH, NECK];

export default function Home() {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      title: "Today"
    });
  }, []);

  return (
    <View style={styles.workoutView}>
      <View style={styles.workoutViewTiles}>
        {workouts.map((workout, index) => (
          <WorkoutViewTile key={index} workout={workout} />
        ))}
      </View>
      <Button title={"Create Workout"} onPress={() => router.push("/workout-creator") }/>
    </View>
  );
}
