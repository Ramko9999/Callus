import { Workout, WorkoutPlan } from "@/interface";
import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { getWorkoutSummary } from "@/context/WorkoutContext";
import { getTimePeriodDisplay } from "@/util";

const styles = StyleSheet.create({
  workoutViewTileContainer: {
    borderRadius: 2,
    borderWidth: 1,
    width: "80%"
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
  onClick?: () => void;
};

export function WorkoutPlanViewTile({ workoutPlan, onClick }: WorkoutPlanViewTileProps) {
  return (
    <View style={styles.workoutViewTileContainer}>
      <Pressable onPress={onClick}>
        <View style={styles.workoutViewTile}>
          <Text _type="small">{workoutPlan.name}</Text>
          <View style={styles.workoutViewExerciseList}>
            {workoutPlan.exercises.map((exercise, index) => (
              <View key={index}>
                <Text _type="neutral">{exercise.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

type WorkoutViewTileProps = {
  workout: Workout;
  onClick?: () => void;
};

export function WorkoutViewTile({ workout, onClick }: WorkoutViewTileProps) {
  const { totalReps, totalWeightLifted, totalDuration } =
    getWorkoutSummary(workout);

  return (
    <View style={styles.workoutViewTileContainer}>
      <TouchableOpacity onPress={onClick}>
        <View style={styles.workoutViewTile}>
          <Text _type="small">{workout.name}</Text>
          <View style={styles.workoutViewExerciseList}>
            {workout.exercises.map((exercise, index) => (
              <View key={index}>
                <Text _type="neutral">{exercise.name}</Text>
              </View>
            ))}
          </View>
          <Text _type="small">{`${totalWeightLifted} lbs | ${totalReps} reps | ${getTimePeriodDisplay(
            totalDuration
          )}`}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
