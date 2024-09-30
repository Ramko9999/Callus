import { Workout, WorkoutPlan } from "@/interface";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/components/Themed";
import { getWorkoutSummary, useWorkout } from "@/context/WorkoutContext";
import { useRouter } from "expo-router";
import { getTimePeriodDisplay } from "@/util";

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
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
});

type WorkoutPlanViewTileProps = {
  workoutPlan: WorkoutPlan;
};

export function WorkoutPlanViewTile({ workoutPlan }: WorkoutPlanViewTileProps) {
  const { actions } = useWorkout();
  const router = useRouter();

  const onStartWorkout = () => {
    actions.startWorkout(workoutPlan);
    router.push("/workout-player");
  };

  return (
    <View style={styles.workoutViewTileContainer}>
      <Pressable onPress={onStartWorkout}>
        <View style={styles.workoutViewTile}>
          <Text _type="small">{workoutPlan.name}</Text>
          <View style={styles.workoutViewExerciseList}>
            {workoutPlan.exercises.map((exercise, index) => (
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

type WorkoutViewTileProps = {
  workout: Workout
}

export function WorkoutViewTile({workout}: WorkoutViewTileProps) {
  const { actions, isInWorkout } = useWorkout();
  const {totalReps, totalWeightLifted, totalDuration} = getWorkoutSummary(workout);
  const router = useRouter();

  return (
    <View style={styles.workoutViewTileContainer}>
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
          <Text _type="small">{`${totalWeightLifted} lbs | ${totalReps} reps | ${getTimePeriodDisplay(totalDuration)}`}</Text>
        </View>
    </View>
  );
}
