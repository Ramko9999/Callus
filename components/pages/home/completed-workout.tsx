import { Workout } from "@/interface";
import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { getWorkoutSummary } from "@/context/WorkoutContext";
import { StyleUtils } from "@/util/styles";
import {
  DurationMetaIcon,
  RepsMetaIcon,
  WeightMetaIcon,
} from "@/components/theme/icons";
import { getNumberSuffix } from "@/util/misc";
import { BookmarkX } from "lucide-react-native";

const completedWorkoutStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    padding: "3%",
    borderRadius: 5,
    marginBottom: "2%",
  },
  content: {
    ...StyleUtils.flexColumn(5),
    flex: 1,
  },
  header: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
  },
  exercises: {
    ...StyleUtils.flexColumn(2),
  },
  summary: {
    ...StyleUtils.flexRow(10),
    paddingTop: "1%",
  },
});

type CompletedWorkoutProps = {
  workout: Workout;
  onClick: () => void;
};

function CompletedWorkout({ workout, onClick }: CompletedWorkoutProps) {
  const { totalWeightLifted, totalReps, totalDuration } =
    getWorkoutSummary(workout);

  const date = new Date(workout.startedAt);
  const formattedDate = `${date.toLocaleString("default", {
    weekday: "short",
  })}. ${date.toLocaleString("default", {
    month: "long",
  })} ${date.getDate()}${getNumberSuffix(
    date.getDate()
  )}, ${date.getFullYear()}`;

  return (
    <TouchableOpacity
      style={[
        completedWorkoutStyles.container,
        { backgroundColor: useThemeColoring("primaryViewBackground") },
      ]}
      onPress={onClick}
    >
      <View style={completedWorkoutStyles.content}>
        <View style={completedWorkoutStyles.header}>
          <Text neutral>{workout.name}</Text>
          <Text light>{formattedDate}</Text>
        </View>
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
          <DurationMetaIcon durationInMillis={totalDuration} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const noWorkoutsLoggedStyles = StyleSheet.create({
  container: {
    height: "60%",
    ...StyleUtils.flexColumn(10),
    alignItems: "center",
    justifyContent: "center",
  },
});

export function NoWorkoutsLogged() {
  return (
    <View style={noWorkoutsLoggedStyles.container}>
      <BookmarkX
        size={100}
        strokeWidth={1.5}
        color={useThemeColoring("lightText")}
      />
      <Text light>Looks like your gym log is empty</Text>
    </View>
  );
}

const completedWorkoutsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    marginTop: "1%",
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
  if (workouts.length === 0) {
    return <NoWorkoutsLogged />;
  }

  return (
    <View style={completedWorkoutsStyles.container}>
      {workouts.map((workout, index) => (
        <CompletedWorkout
          key={index}
          workout={workout}
          onClick={() => onSelect(workout)}
        />
      ))}
    </View>
  );
}
