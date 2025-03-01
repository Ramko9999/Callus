import { Exercise, ExercisePlan, Workout } from "@/interface";
import {
  EDITOR_EXERCISE_HEIGHT,
  EDITOR_EXERCISE_WITH_NOTE_HEIGHT,
  StyleUtils,
} from "@/util/styles";
import { memo, useEffect } from "react";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import {
  getHistoricalExerciseDescription,
  getLiveExerciseDescription,
} from "@/util/workout/display";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import { TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { FontAwesome } from "@expo/vector-icons";
import { textTheme } from "@/constants/Themes";
import {
  getCurrentWorkoutActivity,
  useWorkout,
} from "@/context/WorkoutContext";

export function getExerciseHeight(exercise: Exercise) {
  return exercise.note != undefined
    ? EDITOR_EXERCISE_WITH_NOTE_HEIGHT
    : EDITOR_EXERCISE_HEIGHT;
}

function areExercisePropsSame(
  prevProps: ExerciseProps,
  nextProps: ExerciseProps
) {
  return (
    JSON.stringify(prevProps.exercise) === JSON.stringify(nextProps.exercise) &&
    Object.is(prevProps.onClick, nextProps.onClick) &&
    Object.is(prevProps.onLongClick, nextProps.onLongClick) &&
    Object.is(prevProps.onTrash, nextProps.onTrash) &&
    prevProps.isDragging === nextProps.isDragging
  );
}

export type ExerciseProps = {
  exercise: Exercise | ExercisePlan;
  onClick: (exerciseId: string) => void;
  onLongClick: () => void;
  onTrash: (exerciseId: string) => void;
  isDragging?: boolean;
};

const exerciseStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    paddingLeft: "3%",
    paddingVertical: "3%",
  },
  title: {
    ...StyleUtils.flexColumn(5),
    width: "90%",
  },
  rightActions: {
    ...StyleUtils.flexRowCenterAll(20),
    justifyContent: "flex-end",
    marginLeft: "auto",
    paddingRight: "3%",
  },
});

export const CompletedWorkoutExercise = memo(
  ({ exercise, onClick, onLongClick, onTrash }: ExerciseProps) => {
    const historicalWorkoutExercise = exercise as Exercise;

    return (
      <Swipeable
        overshootRight={false}
        renderRightActions={(_, drag) => (
          <SwipeableDelete
            drag={drag}
            onDelete={() => onTrash(historicalWorkoutExercise.id)}
            dimension={getExerciseHeight(historicalWorkoutExercise)}
          />
        )}
      >
        <TouchableOpacity
          onPress={() => onClick(historicalWorkoutExercise.id)}
          onLongPress={onLongClick}
          style={[
            exerciseStyles.container,
            { height: getExerciseHeight(historicalWorkoutExercise) },
          ]}
        >
          <View style={exerciseStyles.title}>
            <Text large>{exercise.name}</Text>
            <Text neutral light>
              {getHistoricalExerciseDescription(exercise)}
            </Text>
            {historicalWorkoutExercise.note && (
              <Text neutral light italic numberOfLines={1}>
                {historicalWorkoutExercise.note}
              </Text>
            )}
          </View>
          <View style={exerciseStyles.rightActions}>
            <FontAwesome
              name="angle-right"
              color={useThemeColoring("lightText")}
              size={textTheme.large.fontSize}
            />
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  },
  areExercisePropsSame
);

export const RoutineExercise = memo(
  ({ exercise, onClick, onLongClick, onTrash }: ExerciseProps) => {
    const exercisePlan = exercise as ExercisePlan;
    return (
      <Swipeable
        overshootRight={false}
        renderRightActions={(_, drag) => (
          <SwipeableDelete
            drag={drag}
            onDelete={() => onTrash(exercisePlan.id)}
            dimension={EDITOR_EXERCISE_HEIGHT}
          />
        )}
      >
        <TouchableOpacity
          onPress={() => onClick(exercisePlan.id)}
          onLongPress={onLongClick}
          style={[exerciseStyles.container, { height: EDITOR_EXERCISE_HEIGHT }]}
        >
          <View style={exerciseStyles.title}>
            <Text large>{exercise.name}</Text>
            <Text neutral light>
              {getHistoricalExerciseDescription(exercise)}
            </Text>
          </View>
          <View style={exerciseStyles.rightActions}>
            <FontAwesome
              name="angle-right"
              color={useThemeColoring("lightText")}
              size={textTheme.large.fontSize}
            />
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  },
  areExercisePropsSame
);

export const LiveWorkoutExercise = memo(
  ({ exercise, onClick, onLongClick, onTrash, isDragging }: ExerciseProps) => {
    const liveWorkoutExercise = exercise as Exercise;
    const { editor } = useWorkout();
    const currentExerciseId = getCurrentWorkoutActivity(
      editor.workout as Workout
    ).activityData.exercise?.id;
    const activeAnimationColor = useSharedValue(0);
    const activeColor = useThemeColoring("highlightedAnimationColor");

    useEffect(() => {
      if (currentExerciseId === liveWorkoutExercise.id && !isDragging) {
        activeAnimationColor.value = withRepeat(
          withTiming(1, { duration: 1000 }),
          -1,
          true
        );
      } else {
        activeAnimationColor.value = 0;
      }
    }, [currentExerciseId, isDragging]);

    const animatedStyle = useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(
        activeAnimationColor.value,
        [0, 1],
        ["transparent", activeColor]
      ),
    }));

    return (
      <Swipeable
        overshootRight={false}
        renderRightActions={(_, drag) => (
          <SwipeableDelete
            drag={drag}
            onDelete={() => onTrash(liveWorkoutExercise.id)}
            dimension={getExerciseHeight(liveWorkoutExercise)}
          />
        )}
      >
        <TouchableOpacity
          onPress={() => onClick(liveWorkoutExercise.id)}
          onLongPress={onLongClick}
        >
          <Animated.View
            style={[
              exerciseStyles.container,
              animatedStyle,
              { height: getExerciseHeight(liveWorkoutExercise) },
            ]}
          >
            <View style={exerciseStyles.title}>
              <Text large>{exercise.name}</Text>
              <Text neutral light>
                {getLiveExerciseDescription(exercise as Exercise)}
              </Text>
              {liveWorkoutExercise.note && (
                <Text neutral light italic numberOfLines={1}>
                  {liveWorkoutExercise.note}
                </Text>
              )}
            </View>
            <View style={exerciseStyles.rightActions}>
              <FontAwesome
                name="angle-right"
                color={useThemeColoring("lightText")}
                size={textTheme.large.fontSize}
              />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Swipeable>
    );
  },
  areExercisePropsSame
);
