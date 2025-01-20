import { Workout } from "@/interface";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
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
    padding: "3%",
    borderRadius: 5,
  },
});

type CompletedWorkoutProps = {
  workout: Workout;
  onClick: () => void;
};

function CompletedWorkout({ workout, onClick }: CompletedWorkoutProps) {
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
      <Text neutral>{workout.name}</Text>
      <View style={completedWorkoutStyles.exercises}>
        {workout.exercises.map((exercise, index) => (
          <Text neutral light key={index}>
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

const completedWorkoutsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
    marginTop: 20,
    paddingHorizontal: "3%",
  },
});

type CompletedWorkoutsProps = {
  workouts: Workout[];
  onSelect: (workout: Workout) => void;
};

export function CompletedWorkouts({
  workouts,
  onSelect,
}: CompletedWorkoutsProps) {
  return (
    <ScrollView contentContainerStyle={completedWorkoutsStyles.container}>
      {workouts.map((workout, index) => (
        <CompletedWorkout
          key={index}
          workout={workout}
          onClick={() => onSelect(workout)}
        />
      ))}
    </ScrollView>
  );
}
