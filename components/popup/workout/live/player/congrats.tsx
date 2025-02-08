import { WorkoutApi } from "@/api/workout";
import {
  DurationMetaIconProps,
  RepsMetaIcon,
  Star,
  WeightMetaIcon,
} from "@/components/theme/icons";
import { View, Text } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import { getWorkoutSummary } from "@/context/WorkoutContext";
import { Exercise, Workout } from "@/interface";
import { getNumberSuffix } from "@/util/misc";
import { StyleUtils } from "@/util/styles";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ScrollView } from "react-native-gesture-handler";

function getWorkoutCompletionMessage(completedWorkouts: number) {
  return `You just completed your ${completedWorkouts}${getNumberSuffix(
    completedWorkouts
  )} workout.`;
}

const EXERCISE_SUMMARY_BASE_ANIMATION_DELAY = 300;
const EXERCISE_SUMMARY_ANIMATION_GAP = 50;

const congratsFinishingWorkoutHeadingStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    alignItems: "center",
  },
  stars: {
    ...StyleUtils.flexRow(5),
    alignItems: "flex-end",
  },
});

type CongratsFinishingWorkoutHeadingProps = {
  completedWorkoutsBefore: number;
};

function CongratsFinishWorkoutHeading({
  completedWorkoutsBefore,
}: CongratsFinishingWorkoutHeadingProps) {
  const visibility = useSharedValue(0);

  useEffect(() => {
    visibility.value = withTiming(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: visibility.value }],
  }));

  return (
    <Animated.View
      style={[congratsFinishingWorkoutHeadingStyles.container, animatedStyle]}
    >
      <View style={congratsFinishingWorkoutHeadingStyles.stars}>
        <Star size={textTheme.extraLarge.fontSize} />
        <Star size={textTheme.stat.fontSize} />
        <Star size={textTheme.extraLarge.fontSize} />
      </View>
      <Text extraLarge>Congrats!</Text>
      <Text light>
        {getWorkoutCompletionMessage(completedWorkoutsBefore + 1)}
      </Text>
    </Animated.View>
  );
}

const congratsFinishingWorkoutExerciseStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
});

type CongratsFinishingWorkoutExerciseProps = {
  exercise: Exercise;
  index: number;
};

function CongratsFinishingWorkoutExercise({
  exercise,
  index,
}: CongratsFinishingWorkoutExerciseProps) {
  const visibility = useSharedValue(0);

  useEffect(() => {
    visibility.value = withDelay(
      (index + 1) * EXERCISE_SUMMARY_ANIMATION_GAP +
        EXERCISE_SUMMARY_BASE_ANIMATION_DELAY,
      withTiming(1)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visibility.value,
  }));

  return (
    <Animated.View
      style={[congratsFinishingWorkoutExerciseStyles.container, animatedStyle]}
    >
      <Text large>{exercise.name}</Text>
      <Text neutral light>
        {getHistoricalExerciseDescription(exercise)}
      </Text>
      {exercise.note && (
        <Text neutral light italic numberOfLines={1}>
          {exercise.note}
        </Text>
      )}
    </Animated.View>
  );
}

const congratsFinishingWorkoutSummaryStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
  },
  summary: {
    ...StyleUtils.flexRow(5),
  },
});

type CongratsFinishingWorkoutSummaryProps = {
  workout: Workout;
};

function CongratsFinishingWorkoutSummary({
  workout,
}: CongratsFinishingWorkoutSummaryProps) {
  const visibility = useSharedValue(0);

  const { totalDuration, totalReps, totalWeightLifted } =
    getWorkoutSummary(workout);

  useEffect(() => {
    visibility.value = withDelay(
      EXERCISE_SUMMARY_BASE_ANIMATION_DELAY,
      withTiming(1)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visibility.value,
  }));

  return (
    <Animated.View
      style={[congratsFinishingWorkoutSummaryStyles.container, animatedStyle]}
    >
      <Text large>{workout.name}</Text>
      <View style={congratsFinishingWorkoutSummaryStyles.summary}>
        <WeightMetaIcon weight={totalWeightLifted} />
        <RepsMetaIcon reps={totalReps} />
        <DurationMetaIconProps durationInMillis={totalDuration} />
      </View>
    </Animated.View>
  );
}

const congratsFinishingWorkoutStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  content: {
    ...StyleUtils.flexColumn(5),
    paddingHorizontal: "3%",
    marginTop: "5%",
  },
  summary: {
    ...StyleUtils.flexRow(5),
  },
  exercises: {
    marginTop: 10,
    ...StyleUtils.flexColumn(10),
  },
  exercise: {
    ...StyleUtils.flexColumn(),
  },
});

type CongratsFinishingWorkoutProps = {
  workout: Workout;
};

export function CongratsFinishingWorkout({
  workout,
}: CongratsFinishingWorkoutProps) {
  const [workoutsCompleted, setWorkoutsCompleted] = useState<number>();

  useEffect(() => {
    WorkoutApi.getCompletedWorkoutsBefore(workout.startedAt).then(
      (workoutsCompleted) => {
        setWorkoutsCompleted(workoutsCompleted);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    );
  }, []);

  if (workoutsCompleted == undefined) {
    return null;
  }

  return (
    <View style={congratsFinishingWorkoutStyles.container}>
      <CongratsFinishWorkoutHeading
        completedWorkoutsBefore={workoutsCompleted}
      />
      <View style={congratsFinishingWorkoutStyles.content}>
        <CongratsFinishingWorkoutSummary workout={workout} />
        <ScrollView
          contentContainerStyle={congratsFinishingWorkoutStyles.exercises}
        >
          {workout.exercises.map((exercise, index) => (
            <CongratsFinishingWorkoutExercise
              exercise={exercise}
              index={index}
              key={index}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
