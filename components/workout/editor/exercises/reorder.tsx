import { Exercise } from "@/interface";
import { popAndInsert } from "@/util/function";
import { EDITOR_EXERCISE_HEIGHT, StyleUtils } from "@/util/styles";
import { useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { ExercisePlaceholder, ReorderableExercise } from "../../core";
import { View } from "@/components/Themed";

const reorderableExercisesStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
  },
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
                }
              }
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
