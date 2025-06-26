import { View, Text, useThemeColoring } from "@/components/Themed";
import {
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import React, { forwardRef, useRef, useEffect } from "react";
import { Exercise } from "@/interface";
import { getExerciseDemonstration } from "@/api/exercise";
import { StyleUtils } from "@/util/styles";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import { MoreHorizontal, ChevronRight } from "lucide-react-native";
import { PopoverRef } from "@/components/util/popover";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import { TextSkeleton } from "@/components/util/loading";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolateColor,
  LinearTransition,
} from "react-native-reanimated";
import { convertHexToRGBA } from "@/util/color";

const exerciseListStyles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  headerContainer: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: "3%",
  },
  sectionTitle: {
    fontWeight: "600",
  },
  exerciseItem: {
    ...StyleUtils.flexRow(15),
    paddingVertical: "3%",
    paddingHorizontal: "3%",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    minHeight: 80,
    alignItems: "center",
  },
  exerciseImage: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: 8,
  },
  exerciseContent: {
    ...StyleUtils.flexColumn(5),
    flex: 1,
  },
  exerciseSkeletonContent: {
    ...StyleUtils.flexColumn(5),
  },
  chevronContainer: {
    ...StyleUtils.flexRowCenterAll(),
    marginLeft: "auto",
    paddingRight: "2%",
  },
  skeletonImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
});

type ExerciseItemProps = {
  exercise: Exercise;
  onDelete: (exerciseId: string) => void;
};

function ExerciseItem({ exercise, onDelete }: ExerciseItemProps) {
  const demonstration = getExerciseDemonstration(exercise.name);
  const { width } = useWindowDimensions();
  const lightTextColor = useThemeColoring("lightText");

  const handleDelete = () => {
    onDelete(exercise.id);
  };

  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={(_, drag) => (
        <SwipeableDelete drag={drag} onDelete={handleDelete} dimension={80} />
      )}
    >
      <View style={exerciseListStyles.exerciseItem}>
        <View style={[exerciseListStyles.exerciseImage]}>
          {demonstration && (
            <Image
              source={demonstration}
              style={{ width: width * 0.15, height: width * 0.15 }}
              resizeMode="contain"
            />
          )}
        </View>
        <View style={exerciseListStyles.exerciseContent}>
          <Text>{exercise.name}</Text>
          <Text light sneutral>
            {getHistoricalExerciseDescription(exercise)}
          </Text>
          {exercise.note && (
            <Text light italic small numberOfLines={2} ellipsizeMode="tail">
              {exercise.note}
            </Text>
          )}
        </View>
        <View style={exerciseListStyles.chevronContainer}>
          <ChevronRight size={20} color={lightTextColor} />
        </View>
      </View>
    </Swipeable>
  );
}

type MoreExercisesButtonProps = {
  onClick: () => void;
};

const MoreExercisesButton = forwardRef<any, MoreExercisesButtonProps>(
  ({ onClick }, ref) => {
    return (
      <TouchableOpacity ref={ref} onPress={onClick}>
        <MoreHorizontal color={useThemeColoring("primaryAction")} />
      </TouchableOpacity>
    );
  }
);

export type ExercisesRef = {
  openExercisesPopover: () => void;
};

type ExercisesProps = {
  exercises: Exercise[];
  exercisesPopoverRef: React.RefObject<PopoverRef | null>;
  onDelete: (exerciseId: string) => void;
};

export const Exercises = forwardRef<ExercisesRef, ExercisesProps>(
  ({ exercises, exercisesPopoverRef, onDelete }, ref) => {
    const moreButtonRef = useRef<any>(null);

    const handleMorePress = () => {
      if (moreButtonRef.current && exercisesPopoverRef.current) {
        moreButtonRef.current.measure(
          (
            x: number,
            y: number,
            width: number,
            height: number,
            pageX: number,
            pageY: number
          ) => {
            exercisesPopoverRef.current?.open(pageX + width + 5, pageY + 20);
          }
        );
      }
    };

    return (
      <View style={exerciseListStyles.container}>
        <View style={exerciseListStyles.headerContainer}>
          <Text header style={exerciseListStyles.sectionTitle}>
            Exercises
          </Text>
          <MoreExercisesButton ref={moreButtonRef} onClick={handleMorePress} />
        </View>
        {exercises.map((exercise, index) => (
          <Animated.View key={exercise.id} layout={LinearTransition}>
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              onDelete={onDelete}
            />
          </Animated.View>
        ))}
      </View>
    );
  }
);

function ExerciseSkeleton() {
  const skeletonColor = useThemeColoring("primaryAction");
  const animationProgress = useSharedValue(0);
  const pulsateFromColor = convertHexToRGBA(skeletonColor, 0.2);
  const pulsateToColor = convertHexToRGBA(skeletonColor, 0.3);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animationProgress.value,
      [0, 1],
      [pulsateFromColor, pulsateToColor]
    ),
  }));

  return (
    <View style={exerciseListStyles.exerciseItem}>
      <View style={exerciseListStyles.exerciseImage}>
        <Animated.View
          style={[exerciseListStyles.skeletonImage, animatedImageStyle]}
        />
      </View>
      <View style={exerciseListStyles.exerciseSkeletonContent}>
        <TextSkeleton
          text="Bench Press"
          style={{ fontSize: 16, fontWeight: "500" }}
        />
        <TextSkeleton
          text="3 sets • 225 lbs × 8 reps"
          style={{ fontSize: 14 }}
        />
        <TextSkeleton
          text="Great form today, felt strong"
          style={{ fontSize: 12 }}
        />
      </View>
      <View style={exerciseListStyles.chevronContainer}>
        <ChevronRight size={20} color={useThemeColoring("lightText")} />
      </View>
    </View>
  );
}

export function ExercisesSkeleton() {
  return (
    <View style={exerciseListStyles.container}>
      <View style={exerciseListStyles.headerContainer}>
        <Text header style={exerciseListStyles.sectionTitle}>
          Exercises
        </Text>
      </View>
      {Array.from({ length: 5 }).map((_, index) => (
        <ExerciseSkeleton key={index} />
      ))}
    </View>
  );
}
