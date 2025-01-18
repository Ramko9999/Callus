import { Workout } from "@/interface";
import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { getWorkoutSummary } from "@/context/WorkoutContext";
import { StyleUtils } from "@/util/styles";
import {
  DurationMetaIconProps,
  RepsMetaIcon,
  WeightMetaIcon,
} from "@/components/theme/icons";

const completedWorkoutStyles = StyleSheet.create({
  summary: {
    ...StyleUtils.flexRow(10),
    paddingTop: "1%",
  },
  exercises: {
    ...StyleUtils.flexColumn(5),
    marginTop: 5,
    marginBottom: 10,
  },
  container: {
    ...StyleUtils.flexColumn(),
    width: "90%",
    padding: "3%",
    borderRadius: 5,
  },
});

type CompletedWorkoutProps = {
  workout: Workout;
  onClick: () => void;
};

export function CompletedWorkout({ workout, onClick }: CompletedWorkoutProps) {
  const { totalWeightLifted, totalReps, totalDuration } =
    getWorkoutSummary(workout);

  return (
    <TouchableOpacity
      style={[
        completedWorkoutStyles.container,
        { backgroundColor: useThemeColoring("primaryViewBackground") },
      ]}
      onPress={onClick}
    >
      <Text large>{workout.name}</Text>
      <View style={completedWorkoutStyles.exercises}>
        {workout.exercises.map((exercise, index) => (
          <Text key={index} neutral light>
            {exercise.name}
          </Text>
        ))}
      </View>
      <View style={completedWorkoutStyles.summary}>
        <WeightMetaIcon weight={totalWeightLifted} />
        <RepsMetaIcon reps={totalReps} />
        <DurationMetaIconProps durationInMillis={totalDuration} />
      </View>
    </TouchableOpacity>
  );
}
