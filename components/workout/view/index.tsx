import { Workout } from "@/interface";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/components/Themed";
import { useWorkoutActivity } from "@/context/WorkoutActivityContext";
import { useRouter } from "expo-router";

const styles = StyleSheet.create({
  workoutViewTileContainer: {
    width: "80%",
    borderRadius: 2,
    borderWidth: 1
  },
  workoutViewTile: {
    padding: 8,
  },
  workoutViewExerciseList: {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
});

type Props = {
  workout: Workout;
};

export function WorkoutViewTile({ workout }: Props) {
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
          <Text _type="small">{workout.name}</Text>
          <View style={styles.workoutViewExerciseList}>
            {workout.exercises.map((exercise, index) => (
              <View key={index}>
                <Text _type="neutral">
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
