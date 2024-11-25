import { StyleSheet } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { useEffect, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { clamp } from "@/util/function";
import { StyleUtils } from "@/util/styles";

const VISIBLE_ELEMENTS = 5;
const ROULETTE_ITEM_HEIGHT = 40;

const rouletteStyles = StyleSheet.create({
  scroll: {
    height: ROULETTE_ITEM_HEIGHT * VISIBLE_ELEMENTS,
    overflow: "hidden",
  },
  item: {
    ...StyleUtils.flexRowCenterAll(),
    height: ROULETTE_ITEM_HEIGHT,
  },
  content: {
    ...StyleUtils.flexColumn(),
    paddingRight: "5%",
  },
  selection: {
    position: "absolute",
    height: ROULETTE_ITEM_HEIGHT,
    top: ROULETTE_ITEM_HEIGHT * 2,
    width: "100%",
  },
});

type RouletteProps = {
  numberOfItems: number;
  currentIndex: number;
  render: (index: number) => React.ReactNode;
  onLock: (index: number) => void;
  loadMoreTop?: (index: number) => void;
  loadMoreBottom?: (index: number) => void;
};

// todo: fix animation lag when fast scrolling
// todo: add opacity/rotateX
// todo: make it infinite scrollable
export function Roulette({
  numberOfItems,
  currentIndex,
  render,
  onLock,
  loadMoreTop,
  loadMoreBottom,
}: RouletteProps) {
  const inScrollOffset = useSharedValue(0);
  const scrollOffset = useSharedValue(-1 * currentIndex * ROULETTE_ITEM_HEIGHT);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(currentIndex);
  const scrollableRef = useRef<Animated.View>(null);

  const selectionColor = useThemeColoring("rouletteSelection");

  useEffect(() => {
    onLock(selectedIndex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [selectedIndex]);

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      inScrollOffset.value = 0;
    })
    .onUpdate((event) => {
      const oldInscrollOffset = inScrollOffset.value;
      const newScrollOffset =
        scrollOffset.value - oldInscrollOffset + event.translationY;
      scrollOffset.value = newScrollOffset;
      inScrollOffset.value = event.translationY;

      const newIndex = clamp(
        Math.floor((-1 * newScrollOffset) / ROULETTE_ITEM_HEIGHT),
        numberOfItems,
        0
      );

      setSelectedIndex(newIndex);
    })
    .onEnd((event) => {
      const oldInscrollOffset = inScrollOffset.value;
      let newScrollOffset =
        scrollOffset.value - oldInscrollOffset + event.translationY;
      scrollableRef.current?.measure((x, y, width, height, pageX, pageY) => {
        if (Math.abs(newScrollOffset) > height - ROULETTE_ITEM_HEIGHT) {
          newScrollOffset = -1 * (height - ROULETTE_ITEM_HEIGHT);
        } else if (newScrollOffset >= 0) {
          newScrollOffset = 0;
        } else {
          const scrollOffsetTip =
            Math.abs(newScrollOffset) % ROULETTE_ITEM_HEIGHT;
          if (scrollOffsetTip > ROULETTE_ITEM_HEIGHT / 2) {
            newScrollOffset =
              newScrollOffset - (ROULETTE_ITEM_HEIGHT - scrollOffsetTip);
          } else {
            newScrollOffset = newScrollOffset + scrollOffsetTip;
          }
        }
        scrollOffset.value = withTiming(newScrollOffset, { duration: 300 });
        setSelectedIndex(
          clamp(
            Math.floor((-1 * newScrollOffset) / ROULETTE_ITEM_HEIGHT),
            numberOfItems,
            0
          )
        );
      });
    })
    .runOnJS(true);

  const scrollableAnimationStyle = useAnimatedStyle(() => ({
    top: scrollOffset.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={rouletteStyles.scroll}>
        <View background style={rouletteStyles.content}>
          <View style={{ height: ROULETTE_ITEM_HEIGHT * 2 }} />

          <Animated.View style={scrollableAnimationStyle} ref={scrollableRef}>
            {Array.from({ length: numberOfItems }).map((_, index) => (
              <View key={index} style={[rouletteStyles.item]}>
                {render(index)}
              </View>
            ))}
          </Animated.View>
          <View
            style={[
              rouletteStyles.selection,
              { backgroundColor: selectionColor },
            ]}
          />
        </View>
      </View>
    </GestureDetector>
  );
}

type RouletteItemProps = {
  value: string;
};

export function RouletteItem({ value }: RouletteItemProps) {
  return (
    <Text neutral light>
      {value}
    </Text>
  );
}
