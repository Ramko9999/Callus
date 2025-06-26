import { popAndInsert } from "@/util/misc";
import React, { useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
  withTiming,
  scrollTo,
  cancelAnimation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AUTO_SCROLL_THRESHOLD = {
  top: -10,
  bottom: 30,
};

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type ReorderableProps<T> = {
  items: T[];
  hasActivatedReordering: SharedValue<boolean>;
  contentStyle?: ViewStyle;
  scrollStyle?: ViewStyle;
  dragItemStyle?: ViewStyle;
  getItemHeight: (item: T) => number;
  renderItem: (item: T) => React.ReactNode;
  renderPlaceholder: (item: T) => React.ReactNode;
  renderInDragItem: (item: T) => React.ReactNode;
  onReorder: (newItems: T[]) => void;
};

type ReorderableState = {
  originIndex: number;
  destinationIndex: number;
};

export function Reorderable<T>({
  items,
  hasActivatedReordering,
  contentStyle,
  scrollStyle,
  dragItemStyle,
  getItemHeight,
  renderItem,
  renderPlaceholder,
  renderInDragItem,
  onReorder,
}: ReorderableProps<T>) {
  // used to track the translation from the pan gesture
  const totalTranslation = useSharedValue(0);
  const lastTranslation = useSharedValue(0);

  const scrollHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  // used for autoscrolling during dragging
  const autoScrollOffset = useSharedValue(0);
  const isAutoScrolling = useSharedValue(false);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const scrollOffset = useScrollViewOffset(scrollRef);

  const [reorderableState, setReorderableState] = useState<ReorderableState>();

  useAnimatedReaction(
    () => autoScrollOffset.value,
    (offset: number) => scrollTo(scrollRef, 0, offset, false)
  );

  useEffect(() => {
    if (reorderableState?.destinationIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [reorderableState?.destinationIndex]);

  const findIndexAtOffset = (offset: number) => {
    let remainingOffset = offset;
    const itemHeights = items.map(getItemHeight);
    for (let index = 0; index < itemHeights.length; index++) {
      if (remainingOffset < itemHeights[index]) {
        return index;
      }
      remainingOffset -= itemHeights[index];
    }
    return items.length - 1;
  };

  const setDragOrigin = (offset: number) => {
    const indexToLock = findIndexAtOffset(offset);
    setReorderableState({
      originIndex: indexToLock,
      destinationIndex: indexToLock,
    });
  };

  const setDragDestination = (offset: number) => {
    setReorderableState((state) => ({
      ...(state as ReorderableState),
      destinationIndex: findIndexAtOffset(offset),
    }));
  };

  const finalizeReorder = () => {
    if (reorderableState) {
      onReorder(
        popAndInsert(
          items,
          reorderableState?.originIndex,
          reorderableState?.destinationIndex
        )
      );
      setReorderableState(undefined);
    }
  };

  const panGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((event, manager) => {
      if (hasActivatedReordering.value) {
        manager.activate();
      } else {
        manager.fail();
      }
    })
    .onStart((event) => {
      totalTranslation.value = event.y - scrollOffset.value;
      lastTranslation.value = 0;
      autoScrollOffset.value = scrollOffset.value;
      runOnJS(setDragOrigin)(event.y);
    })
    .onUpdate((event) => {
      const newTranslation =
        totalTranslation.value + event.translationY - lastTranslation.value;

      const clampedTranslation = Math.min(
        Math.max(AUTO_SCROLL_THRESHOLD.top, newTranslation),
        scrollHeight.value - AUTO_SCROLL_THRESHOLD.bottom
      );

      totalTranslation.value = clampedTranslation;
      lastTranslation.value = event.translationY;

      const requiresAutoScroll =
        clampedTranslation <= AUTO_SCROLL_THRESHOLD.top ||
        clampedTranslation >= scrollHeight.value - AUTO_SCROLL_THRESHOLD.bottom;

      if (requiresAutoScroll) {
        if (!isAutoScrolling.value) {
          if (clampedTranslation <= AUTO_SCROLL_THRESHOLD.top) {
            autoScrollOffset.value = withTiming(0, { duration: 2500 });
          } else {
            autoScrollOffset.value = withTiming(contentHeight.value, {
              duration: 2500,
            });
          }
        }
        isAutoScrolling.value = true;
      } else {
        cancelAnimation(autoScrollOffset);
        isAutoScrolling.value = false;
      }
      runOnJS(setDragDestination)(totalTranslation.value + scrollOffset.value);
    })
    .onEnd(() => {
      hasActivatedReordering.value = false;
      runOnJS(finalizeReorder)();
    })
    .blocksExternalGesture(scrollRef);

  const draggingItemAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollOffset.value + totalTranslation.value }],
    position: "absolute",
  }));

  const newItemOrder = reorderableState
    ? popAndInsert(
        items,
        reorderableState.originIndex,
        reorderableState.destinationIndex
      )
    : items;

  return (
    <AnimatedScrollView
      contentContainerStyle={contentStyle}
      style={scrollStyle}
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      onLayout={({ nativeEvent }) => {
        scrollHeight.value = nativeEvent.layout.height;
      }}
    >
      <GestureDetector gesture={panGesture}>
        <View
          onLayout={({ nativeEvent }) =>
            (contentHeight.value = nativeEvent.layout.height)
          }
        >
          {newItemOrder.map((item, index) =>
            reorderableState && reorderableState.destinationIndex === index
              ? renderPlaceholder(items[reorderableState.originIndex])
              : renderItem(item)
          )}
        </View>
      </GestureDetector>
      {reorderableState && (
        <Animated.View style={[draggingItemAnimatedStyle, dragItemStyle]}>
          {renderInDragItem(items[reorderableState.originIndex])}
        </Animated.View>
      )}
    </AnimatedScrollView>
  );
}
