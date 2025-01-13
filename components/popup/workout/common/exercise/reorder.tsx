import { Exercise } from "@/interface";
import { popAndInsert } from "@/util/misc";
import { EDITOR_EXERCISE_HEIGHT, StyleUtils } from "@/util/styles";
import { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { View, Text, useThemeColoring } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { textTheme } from "@/constants/Themes";

const reorderableExerciseStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    paddingLeft: "3%",
    paddingVertical: "3%",
    height: EDITOR_EXERCISE_HEIGHT,
  },
  title: {
    ...StyleUtils.flexColumn(5),
  },
  rightActions: {
    ...StyleUtils.flexRowCenterAll(),
    justifyContent: "flex-end",
    marginLeft: "auto",
    paddingRight: "3%",
  },
});

type ReorderableExerciseProps = {
  exercise: Exercise;
  onClickDown: () => void;
};

export function ReorderableExercise({
  exercise,
  onClickDown,
}: ReorderableExerciseProps) {
  return (
    <View background style={reorderableExerciseStyles.container}>
      <View style={reorderableExerciseStyles.title}>
        <Text large>{exercise.name}</Text>
      </View>
      <View style={reorderableExerciseStyles.rightActions}>
        <TouchableOpacity onPressIn={onClickDown}>
          <FontAwesome
            name="reorder"
            color={useThemeColoring("lightText")}
            size={textTheme.large.fontSize}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ExercisePlaceholder() {
  return (
    <View
      style={[
        reorderableExerciseStyles.container,
        { backgroundColor: useThemeColoring("search") },
      ]}
    ></View>
  );
}

const reorderableExercisesStyles = StyleSheet.create({
  container: {},
  placeholder: {
    width: "100%",
  },
});

const SCROLL_MARGIN = 30;

type ScrollParentMeasurements = {
  top: number;
  height: number;
};

type ReorderableExercisesProps = {
  scrollDown: () => void;
  scrollUp: () => void;
  scrollMeasurements: ScrollParentMeasurements;
  scrollRef: React.RefObject<ScrollView>;
  exercises: Exercise[];
  onReorder: (exerciseOrder: Exercise[]) => void;
};

type ReorderableState = {
  originalIndex: number;
  newIndex: number;
};

export function ReorderableExercises({
  exercises,
  onReorder,
  scrollDown,
  scrollUp,
  scrollRef,
  scrollMeasurements,
}: ReorderableExercisesProps) {
  const [reorderableState, setReorderableState] = useState<ReorderableState>();
  const origin = useSharedValue(0);
  const translation = useSharedValue(0);

  const { width } = useWindowDimensions();

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      origin.value = event.y;
      translation.value = event.y;
    })
    .onUpdate((event) => {
      if (reorderableState) {
        translation.value = event.translationY + origin.value;
        const indexDelta = Math.round(
          event.translationY / EDITOR_EXERCISE_HEIGHT
        ); // hardcoded;
        const newIndex = Math.min(
          Math.max((reorderableState?.originalIndex as number) + indexDelta, 0),
          exercises.length - 1
        );
        setReorderableState((state) => ({
          ...(state as ReorderableState),
          newIndex,
        }));

        const shouldScrollDown =
          scrollMeasurements.top + scrollMeasurements.height - SCROLL_MARGIN <
          event.absoluteY;

        const shouldScrollUp =
          scrollMeasurements.top - SCROLL_MARGIN > event.absoluteY;

        if (shouldScrollDown) {
          scrollDown();
        }
        if (shouldScrollUp) {
          scrollUp();
        }
      }
    })
    .onEnd((_) => {
      if (reorderableState) {
        onReorder(
          popAndInsert(
            exercises,
            reorderableState?.originalIndex as number,
            reorderableState?.newIndex as number
          )
        );
        setReorderableState(undefined);
      }
    })
    .hitSlop({
      right: 0,
      width: width * 0.2,
    })
    .blocksExternalGesture(scrollRef)
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: translation.value }],
      position: "absolute",
    }),
    []
  );

  const exercisesOrder = reorderableState
    ? popAndInsert(
        exercises,
        reorderableState.originalIndex,
        reorderableState.newIndex
      )
    : exercises;
  return (
    <GestureDetector gesture={panGesture}>
      <View background style={reorderableExercisesStyles.container}>
        {exercisesOrder.map((exercise, index) =>
          index === reorderableState?.newIndex ? (
            <ExercisePlaceholder key={index} />
          ) : (
            <ReorderableExercise
              key={index}
              exercise={exercise}
              onClickDown={() => {
                setReorderableState({ originalIndex: index, newIndex: index });
              }}
            />
          )
        )}
        {reorderableState && (
          <Animated.View
            style={[reorderableExercisesStyles.placeholder, animatedStyle]}
          >
            <ReorderableExercise
              exercise={exercises[reorderableState.originalIndex]}
              onClickDown={() => {}}
            />
          </Animated.View>
        )}
      </View>
    </GestureDetector>
  );
}
