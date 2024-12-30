import { Workout, WorkoutPlan } from "@/interface";
import { Pressable, StyleSheet, TouchableOpacity } from "react-native";
import {
  View,
  Text,
  Icon,
  MaterialCommunityIcon,
  useThemeColoring,
} from "@/components/Themed";
import { getWorkoutSummary } from "@/context/WorkoutContext";
import { getTimePeriodDisplay } from "@/util/date";
import { textTheme } from "@/constants/Themes";
import { Ionicons } from "@expo/vector-icons";
import { StyleUtils } from "@/util/styles";
import {
  DurationMetaIconProps,
  RepsMetaIcon,
  WeightMetaIcon,
} from "@/components/theme/icons";

const styles = StyleSheet.create({
  workoutViewTileContainer: {
    borderRadius: 2,
    borderWidth: 1,
    width: "80%",
  },
  workoutViewTile: {
    padding: 8,
  },
  workoutViewExerciseList: {
    marginTop: 5,
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  workoutViewTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

type WorkoutPlanViewTileProps = {
  workoutPlan: WorkoutPlan;
  onClick?: () => void;
};

// todo: delete this ish when the time is right
export function WorkoutPlanViewTile({
  workoutPlan,
  onClick,
}: WorkoutPlanViewTileProps) {
  return (
    <View style={styles.workoutViewTileContainer}>
      <Pressable onPress={onClick}>
        <View style={styles.workoutViewTile}>
          <View style={styles.workoutViewTitle}>
            <Text _type="small">{workoutPlan.name}</Text>
            <View _type="background">
              <Text
                _type="neutral"
                style={{ fontSize: 36, marginTop: -20, padding: 2 }}
              >
                ...
              </Text>
            </View>
          </View>
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

const newStyles = StyleSheet.create({
  summary: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    paddingTop: "1%",
  },
  summaryMetric: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  view: {
    display: "flex",
    flexDirection: "column",
    width: "90%",
    padding: "3%",
    borderWidth: 1,
    borderRadius: 5,
  },
});

const workoutSummaryStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
  },
});

type WorkoutSummaryProps = {
  workout: Workout;
};

export function WorkoutSummary({ workout }: WorkoutSummaryProps) {
  const { totalReps, totalWeightLifted, totalDuration } =
    getWorkoutSummary(workout);

  return (
    <View style={workoutSummaryStyles.container}>
      <WeightMetaIcon weight={totalWeightLifted} />
      <RepsMetaIcon reps={totalReps} />
      <DurationMetaIconProps durationInMillis={totalDuration} />
    </View>
  );
}

export function NewWorkoutViewTile({ workout, onClick }: WorkoutViewTileProps) {
  return (
    <View style={newStyles.view} _type="background">
      <TouchableOpacity onPress={onClick}>
        <Text large>{workout.name}</Text>
        <View style={styles.workoutViewExerciseList} _type="background">
          {workout.exercises.map((exercise, index) => (
            <View key={index} _type="background">
              <Text neutral light>
                {exercise.name}
              </Text>
            </View>
          ))}
        </View>
        <WorkoutSummary workout={workout} />
      </TouchableOpacity>
    </View>
  );
}
