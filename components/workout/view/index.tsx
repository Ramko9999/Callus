import { Workout } from "@/interface";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/components/Themed";
import { useWorkoutActivity } from "@/context/WorkoutActivityContext";
import { useRouter } from "expo-router";

const styles = StyleSheet.create({
  workoutViewTileContainer: {
    width: "80%",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "white"
  },
  workoutViewTile: {
    padding: 8,
  },
  workoutViewTitle: {
    fontSize: 12,
    color: "darkgrey",
  },
  workoutViewExerciseList: {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  workoutViewExerciseNameContainer: {
  },
  workoutViewExerciseName: {
    fontSize: 16,
  },
});

type Props = {
  workoutName: string;
  workout: Workout;
};

export function WorkoutViewTile({ workoutName, workout }: Props) {
  const { actions } = useWorkoutActivity();
  const router = useRouter();

  const onStartWorkout = () => {
    actions.startWorkout(workout);
    router.push("/workout-player");
  };

  return (
    <View style={styles.workoutViewTileContainer}>
      <Pressable onPress={onStartWorkout}>
        <View style={styles.workoutViewTile}>
          <Text style={styles.workoutViewTitle}>{workoutName}</Text>
          <View style={styles.workoutViewExerciseList}>
            {workout.exercises.map((exercise, index) => (
              <View style={styles.workoutViewExerciseNameContainer} key={index}>
                <Text style={styles.workoutViewExerciseName}>
                  {exercise.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </View>
  );
}
