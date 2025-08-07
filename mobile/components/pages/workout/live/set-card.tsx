import React, { useEffect } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  LinearTransition,
} from "react-native-reanimated";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { SetActions, WorkoutQuery } from "@/api/model/workout";
import { Exercise, Set, DifficultyType, SetStatus, Workout } from "@/interface";

import { tintColor } from "@/util/color";
import * as Haptics from "expo-haptics";
import { useSound } from "@/components/sounds";
import { RestingProgress } from "@/components/workout/live";
import { useRest } from "@/components/hooks/use-rest";
import {
  SetRow,
  SetHeader,
  EditField,
} from "@/components/pages/workout/common";
import { ExerciseStoreSelectors, useExercisesStore } from "@/components/store";
import { ExerciseImage } from "@/components/exercise/image";
import { useShallow } from "zustand/shallow";

type LiveSetRowProps = {
  set: Set;
  index: number;
  difficultyType: DifficultyType;
  onCompleteSet: (setId: string) => void;
  onEditSet: (setId: string, field: EditField) => void;
};

function LiveSetRow({
  set,
  index,
  difficultyType,
  onCompleteSet,
  onEditSet,
}: LiveSetRowProps) {
  const primaryActionColor = useThemeColoring("primaryAction");
  const animationProgress = useSharedValue(
    set.status === SetStatus.UNSTARTED ? 0 : 1
  );
  const { play } = useSound();

  useEffect(() => {
    if (set.status === SetStatus.UNSTARTED) {
      animationProgress.value = 0;
    } else {
      animationProgress.value = withTiming(1);
    }
  }, [set.status]);

  const animatedStyle = useAnimatedStyle(() => {
    const scaleValue =
      animationProgress.value <= 0.5
        ? 1 + animationProgress.value * 2 * 0.05
        : 1 + (1 - animationProgress.value) * 2 * 0.05;

    return {
      transform: [{ scale: scaleValue }],
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: animationProgress.value * 0.3,
    backgroundColor: primaryActionColor,
  }));

  const handleToggle = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (set.status === SetStatus.UNSTARTED) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      play("positive_ring");
      onCompleteSet(set.id);
    }
  };

  return (
    <SetRow
      useAltBackground={true}
      set={set}
      index={index}
      difficultyType={difficultyType}
      containerAnimatedStyle={animatedStyle}
      overlayAnimatedStyle={overlayAnimatedStyle}
      onEdit={onEditSet}
      onToggle={handleToggle}
      showSwipeActions={false}
      onDelete={() => {}}
    />
  );
}

const setCardStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: "3%",
    paddingTop: "2%",
    paddingBottom: "4%",
    marginHorizontal: "4%",
    borderRadius: 16,
    borderWidth: 2,
  },
  headerRow: {
    ...StyleUtils.flexColumn(),
    justifyContent: "space-between",
    width: "100%",
    marginBottom: "4%",
  },
  mediaContainer: {
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    overflow: "hidden",
  },
  pageContainer: {
    ...StyleUtils.flexRowCenterAll(),
  },
  imageContainer: {
    borderRadius: 20,
  },
  exerciseImage: {
    borderRadius: 20,
  },
  restingContainer: {
    ...StyleUtils.flexColumnCenterAll(),
  },
  setsContainer: {
    width: "100%",
    marginTop: "4%",
  },
});

export type SetCardProps = {
  exercise: Exercise;
  set: Set;
  onCompleteSet: (setId: string) => void;
  onSkipRest: () => void;
  onUpdateWorkout: (updatedWorkout: any) => void;
  workout: any;
  onEditSet?: (exerciseId: string, setId: string, field: EditField) => void;
};

export function SetCard({
  exercise,
  set,
  onCompleteSet,
  onSkipRest,
  onUpdateWorkout,
  workout,
  onEditSet,
}: SetCardProps) {
  const { width, height } = useWindowDimensions();
  const borderColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const primaryActionColor = useThemeColoring("primaryAction");
  const bgColor = tintColor(useThemeColoring("appBackground"), 0.05);

  const difficultyType = useExercisesStore(
    (state) =>
      ExerciseStoreSelectors.getExercise(exercise.metaId, state).difficultyType
  );

  const exerciseName = useExercisesStore(
    (state) => ExerciseStoreSelectors.getExercise(exercise.metaId, state).name
  );

  const isResting = set.status === SetStatus.RESTING;
  const { remainingRestMs, restProgress } = useRest({
    isResting,
    restDurationMs: set.restDuration ? set.restDuration * 1000 : 0,
    restStartedAtMs: set.restStartedAt ?? 0,
  });

  const currentSetIndex = exercise.sets.findIndex((s) => s.id === set.id);
  const totalSets = exercise.sets.length;

  const handleEditSet = (setId: string, field: EditField) => {
    onEditSet?.(exercise.id, setId, field);
  };

  const mediaDimensions = {
    width: width * 0.94,
    height: height * 0.4,
  };

  return (
    <View
      style={[
        setCardStyles.container,
        { borderColor, backgroundColor: bgColor },
      ]}
    >
      <View style={setCardStyles.headerRow}>
        <Text action style={{ fontWeight: "600" }}>
          {exerciseName}
        </Text>
        <Text style={{ color: primaryActionColor }}>
          Set {currentSetIndex + 1} of {totalSets}
        </Text>
      </View>
      <Animated.View
        style={[setCardStyles.mediaContainer, mediaDimensions]}
        layout={LinearTransition.springify().damping(20).stiffness(150)}
      >
        {!isResting && (
          <Animated.View
            key="spacer-start"
            style={mediaDimensions}
            layout={LinearTransition.springify().damping(20).stiffness(150)}
          />
        )}

        <Animated.View
          key="demonstration"
          style={[setCardStyles.pageContainer, mediaDimensions]}
          layout={LinearTransition.springify().damping(20).stiffness(150)}
        >
          <View style={setCardStyles.imageContainer}>
            <ExerciseImage
              metaId={exercise.metaId}
              imageStyle={{
                ...setCardStyles.exerciseImage,
                ...mediaDimensions,
              }}
              fallbackSize={mediaDimensions.width}
              fallbackColor={primaryActionColor}
            />
          </View>
        </Animated.View>

        <Animated.View
          key="resting-progress"
          style={[setCardStyles.pageContainer, mediaDimensions]}
          layout={LinearTransition.springify().damping(20).stiffness(150)}
        >
          <View style={setCardStyles.restingContainer}>
            <RestingProgress
              progress={restProgress}
              dimension={Math.min(width * 0.8, height * 0.5)}
              strokeWidth={10}
              timeRemaining={Math.floor(remainingRestMs / 1000)}
              currentDuration={set.restDuration || 0}
              onEditDuration={(newDuration) => {
                // shouldn't need copy of workout here
                if (workout) {
                  const updatedWorkout = SetActions(workout, set.id).update({
                    restDuration: newDuration,
                  });
                  onUpdateWorkout(updatedWorkout);
                }
              }}
              onSkip={onSkipRest}
            />
          </View>
        </Animated.View>

        {isResting && (
          <Animated.View
            key="spacer-end"
            style={mediaDimensions}
            layout={LinearTransition.springify().damping(20).stiffness(150)}
          />
        )}
      </Animated.View>

      <View style={setCardStyles.setsContainer}>
        <SetHeader difficultyType={difficultyType} />
        <LiveSetRow
          set={set}
          index={currentSetIndex}
          difficultyType={difficultyType}
          onCompleteSet={onCompleteSet}
          onEditSet={handleEditSet}
        />
      </View>
    </View>
  );
}

const completionCardStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "3%",
    paddingTop: "4%",
    paddingBottom: "6%",
    marginHorizontal: "4%",
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 200,
  },
  content: {
    ...StyleUtils.flexColumnCenterAll(),
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: "4%",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: "8%",
    textAlign: "center",
    opacity: 0.8,
  },
  summaryContainer: {
    ...StyleUtils.flexColumn(),
    width: "100%",
    marginBottom: "8%",
  },
  summaryRow: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    marginBottom: "2%",
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionsContainer: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    width: "100%",
    gap: "4%",
  },
  actionButton: {
    flex: 1,
    paddingVertical: "4%",
    paddingHorizontal: "6%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  primaryButtonText: {
    fontWeight: "600",
  },
  secondaryButtonText: {
    fontWeight: "500",
  },
});

export type CompletionCardProps = {
  workout: Workout;
  onAddExercises: () => void;
  onFinishWorkout: () => void;
};

export function CompletionCard({
  workout,
  onAddExercises,
  onFinishWorkout,
}: CompletionCardProps) {
  const borderColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const primaryActionColor = useThemeColoring("primaryAction");
  const bgColor = tintColor(useThemeColoring("appBackground"), 0.05);
  const secondaryTextColor = useThemeColoring("lightText");

  // Get difficulty types for exercises
  const metaIdToDifficultyType = useExercisesStore(
    useShallow(ExerciseStoreSelectors.getMetaIdToDifficultyType)
  );

  // Function to format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Calculate workout summary using WorkoutQuery.summarize
  const totalExercises = workout.exercises.length;
  const totalSets = workout.exercises.reduce(
    (sum: number, exercise: any) => sum + exercise.sets.length,
    0
  );
  const completedSets = workout.exercises.reduce(
    (sum: number, exercise: any) =>
      sum +
      exercise.sets.filter((set: any) => set.status !== SetStatus.UNSTARTED)
        .length,
    0
  );
  const workoutDuration = workout.startedAt
    ? Math.floor((Date.now() - workout.startedAt) / 1000 / 60) // minutes
    : 0;

  const { totalReps, totalWeightLifted, totalDuration, totalHoldTime } =
    WorkoutQuery.summarize(workout, metaIdToDifficultyType);

  // Check if there are time-based exercises
  const hasTimeExercises = workout.exercises.some((exercise: Exercise) => {
    const difficultyType = metaIdToDifficultyType[exercise.metaId];
    return difficultyType === DifficultyType.TIME;
  });

  return (
    <View
      style={[
        completionCardStyles.container,
        { borderColor, backgroundColor: bgColor },
      ]}
    >
      <View style={completionCardStyles.content}>
        <Text style={completionCardStyles.title}>Workout Complete! 🎉</Text>
        <Text style={completionCardStyles.subtitle}>
          Great job! You've finished all your planned exercises.
        </Text>

        <View style={completionCardStyles.summaryContainer}>
          <View style={completionCardStyles.summaryRow}>
            <Text style={completionCardStyles.summaryLabel}>Exercises:</Text>
            <Text style={completionCardStyles.summaryValue}>
              {totalExercises}
            </Text>
          </View>
          <View style={completionCardStyles.summaryRow}>
            <Text style={completionCardStyles.summaryLabel}>
              Sets Completed:
            </Text>
            <Text style={completionCardStyles.summaryValue}>
              {completedSets} / {totalSets}
            </Text>
          </View>
          <View style={completionCardStyles.summaryRow}>
            <Text style={completionCardStyles.summaryLabel}>Duration:</Text>
            <Text style={completionCardStyles.summaryValue}>
              {workoutDuration} min
            </Text>
          </View>
          {totalReps > 0 && (
            <View style={completionCardStyles.summaryRow}>
              <Text style={completionCardStyles.summaryLabel}>Total Reps:</Text>
              <Text style={completionCardStyles.summaryValue}>{totalReps}</Text>
            </View>
          )}
          {totalWeightLifted > 0 && (
            <View style={completionCardStyles.summaryRow}>
              <Text style={completionCardStyles.summaryLabel}>
                Total Volume:
              </Text>
              <Text style={completionCardStyles.summaryValue}>
                {Math.round(totalWeightLifted)} lbs
              </Text>
            </View>
          )}
          {hasTimeExercises && totalDuration > 0 && (
            <View style={completionCardStyles.summaryRow}>
              <Text style={completionCardStyles.summaryLabel}>Hold Time:</Text>
              <Text style={completionCardStyles.summaryValue}>
                {formatDuration(totalHoldTime)}
              </Text>
            </View>
          )}
        </View>

        <View style={completionCardStyles.actionsContainer}>
          <TouchableOpacity
            style={[
              completionCardStyles.actionButton,
              completionCardStyles.secondaryButton,
              { borderColor: secondaryTextColor },
            ]}
            onPress={onAddExercises}
          >
            <Text
              style={[
                completionCardStyles.secondaryButtonText,
                { color: secondaryTextColor },
              ]}
            >
              Add More
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              completionCardStyles.actionButton,
              completionCardStyles.primaryButton,
              { borderColor: primaryActionColor },
            ]}
            onPress={onFinishWorkout}
          >
            <Text
              style={[
                completionCardStyles.primaryButtonText,
                { color: primaryActionColor },
              ]}
            >
              Finish Workout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
