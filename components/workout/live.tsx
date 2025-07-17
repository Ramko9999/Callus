import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SharedValue,
  useAnimatedProps,
  interpolateColor,
} from "react-native-reanimated";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { tintColor } from "@/util/color";
import { Exercise, Workout, SetStatus } from "@/interface";
import { Svg, Circle } from "react-native-svg";
import { Minus, Plus, SkipForward } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const liveProgressBarStyles = StyleSheet.create({
  progressSegment: {
    height: "100%",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
});

type LiveProgressBarProps = {
  exercise: Exercise;
  flexValue: number;
};

function LiveProgressBar({ exercise, flexValue }: LiveProgressBarProps) {
  const primaryActionColor = useThemeColoring("primaryAction");
  const transitionColor = tintColor(primaryActionColor, 0.4);
  const inactiveColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const progressValue = useSharedValue(0);
  const isTransitioning = useSharedValue(false);

  // Update progress when exercise changes
  useEffect(() => {
    const completedSets = exercise.sets.filter(
      (set) =>
        set.status === SetStatus.FINISHED || set.status === SetStatus.RESTING
    ).length;
    const totalSets = exercise.sets.length;
    const progress = totalSets > 0 ? completedSets / totalSets : 0;

    isTransitioning.value = true;
    progressValue.value = withTiming(
      progress,
      {
        duration: 500,
      },
      () => {
        isTransitioning.value = false;
      }
    );
  }, [exercise.sets, progressValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = isTransitioning.value
      ? transitionColor
      : primaryActionColor;
    return {
      backgroundColor,
      transform: [{ scaleX: progressValue.value }],
      transformOrigin: "left",
    };
  });

  return (
    <View
      style={[
        liveProgressBarStyles.progressSegment,
        {
          flex: flexValue, // Use proportional flex based on number of sets
          backgroundColor: inactiveColor, // Inactive background color
        },
      ]}
    >
      <Animated.View
        style={[liveProgressBarStyles.progressFill, animatedStyle]}
      />
    </View>
  );
}

const liveProgressStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingBottom: "2%",
    paddingHorizontal: "5%",
  },
  progressContainer: {
    ...StyleUtils.flexRow(5),
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
});

type LiveProgressProps = {
  workout: Workout;
};

export function LiveProgress({ workout }: LiveProgressProps) {
  const exercisesWithSets = workout.exercises.filter(
    (exercise: Exercise) => exercise.sets && exercise.sets.length > 0
  );

  // Calculate total sets across exercises with sets
  const totalSets = exercisesWithSets.reduce(
    (total: number, exercise: Exercise) => total + exercise.sets.length,
    0
  );

  const totalCompletedSets = exercisesWithSets.reduce(
    (total: number, exercise: Exercise) =>
      total +
      exercise.sets.filter((set) => set.status !== SetStatus.UNSTARTED).length,
    0
  );

  const barGaps = useSharedValue(totalCompletedSets >= totalSets ? 0 : 5);

  useEffect(() => {
    barGaps.value = withTiming(totalCompletedSets >= totalSets ? 0 : 5, {
      duration: 500,
    });
  }, [totalCompletedSets, totalSets, barGaps]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      gap: barGaps.value,
    };
  });

  return (
    <View style={liveProgressStyles.container}>
      <Animated.View
        style={[liveProgressStyles.progressContainer, animatedStyle]}
      >
        {exercisesWithSets.map((exercise: Exercise, index: number) => {
          // Calculate flex value based on number of sets in this exercise
          const exerciseSetCount = exercise.sets.length;
          const flexValue = exerciseSetCount / totalSets;

          return (
            <LiveProgressBar
              key={exercise.id}
              exercise={exercise}
              flexValue={flexValue}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

const restingProgressStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumnCenterAll(),
  },
  content: {
    position: "absolute",
    alignSelf: "center",
    ...StyleUtils.flexColumnCenterAll(),
  },
  timeText: {
    fontSize: 64,
    fontWeight: "600",
  },
  durationText: {
    fontSize: 20,
  },
  controls: {
    ...StyleUtils.flexRow(15),
    alignItems: "center",
  },
  controlButton: {
    ...StyleUtils.flexRowCenterAll(),
    padding: "3%",
    borderRadius: "50%",
  },
  actionButtons: {
    position: 'absolute',
    ...StyleUtils.flexRow(20),
    justifyContent: "center",
    bottom: "17%",
    left: 0,
    right: 0,
  },
});

type RestingProgressProps = {
  progress: SharedValue<number>;
  dimension: number;
  timeRemaining: number;
  strokeWidth?: number;
  currentDuration: number;
  onEditDuration?: (newDuration: number) => void;
  onSkip: () => void;
};

export function RestingProgress({
  progress,
  dimension,
  timeRemaining,
  strokeWidth = 8,
  currentDuration,
  onEditDuration,
  onSkip,
}: RestingProgressProps) {
  const primaryActionColor = useThemeColoring("primaryAction");
  const primaryTextColor = useThemeColoring("primaryText");
  const lightTextColor = useThemeColoring("lightText");
  const borderColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const actionColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const lightPrimaryAction = primaryActionColor;

  const radius = dimension / 2.2;
  const circumference = Math.PI * 2 * radius;

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleDecrease = () => {
    if (onEditDuration) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newDuration = Math.max(0, currentDuration - 15);
      onEditDuration(newDuration);
    }
  };

  const handleIncrease = () => {
    if (onEditDuration) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newDuration = currentDuration + 15;
      onEditDuration(newDuration);
    }
  };

  const handleSkip = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSkip();
  };

  const animatedProps = useAnimatedProps(() => {
    const animatedColor = interpolateColor(
      progress.value,
      [0, 1],
      [lightPrimaryAction, primaryTextColor]
    );

    return {
      strokeDashoffset: circumference * progress.value,
      stroke: animatedColor,
    };
  });

  return (
    <View
      style={[
        restingProgressStyles.container,
        { width: dimension, height: dimension },
      ]}
    >
      <Svg height={dimension} width={dimension}>
        {/* Background circle */}
        <Circle
          cx="50%"
          cy="50%"
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          stroke={borderColor}
        />
        {/* Progress circle - diminishes as rest progresses */}
        <AnimatedCircle
          cx="50%"
          cy="50%"
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      <View style={restingProgressStyles.content}>
        <Text style={restingProgressStyles.timeText}>
          {formatTime(timeRemaining)}
        </Text>
        <Text light style={restingProgressStyles.durationText}>
          {formatTime(currentDuration)}
        </Text>
      </View>
      <View style={restingProgressStyles.actionButtons}>
        <TouchableOpacity
          style={[
            restingProgressStyles.controlButton,
            { backgroundColor: actionColor },
          ]}
          onPress={handleDecrease}
        >
          <Minus size={16} color={lightTextColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            restingProgressStyles.controlButton,
            { backgroundColor: actionColor },
          ]}
          onPress={handleIncrease}
        >
          <Plus size={16} color={lightTextColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            restingProgressStyles.controlButton,
            { backgroundColor: actionColor },
          ]}
          onPress={handleSkip}
        >
          <SkipForward size={16} color={lightTextColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
