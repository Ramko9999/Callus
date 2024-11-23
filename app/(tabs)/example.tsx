import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { useEffect, useRef, useState } from "react";
import {
  Gesture,
  GestureDetector,
  Directions,
  TouchableOpacity,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { clamp } from "@/util/function";
import { Roulette } from "@/components/workout/core/datetime-picker/roulette";
import { DateTimePicker } from "@/components/workout/core/datetime-picker";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

const items = ["Ramki", "Rohan", "Tanush", "Raghava", "Rahul", "Vikram"];

function Example() {
  const [focus, setFocus] = useState(false);

  return (
    <View
      background
      style={{
        ...StyleUtils.flexColumn(20),
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <ScrollableLock values={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} />
    </View>
  );
}

const ELEMENT_HEIGHT = 50;
const ELEMENTS_HEIGHT = ELEMENT_HEIGHT * 5;
const SELECTION_TOP = ELEMENT_HEIGHT * 2;

const scrollableLockStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
  },
  item: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    height: ELEMENT_HEIGHT,
  },
  selection: {
    position: "absolute",
    backgroundColor: "rgba(55, 56, 58, 0.2)",
    height: ELEMENT_HEIGHT,
    top: SELECTION_TOP,
    width: "100%",
  },
  scroll: {
    height: ELEMENTS_HEIGHT,
    overflow: "hidden",
  },
});

type ScrollableLockProps = {
  values: number[];
};

function ScrollableLock({ values }: ScrollableLockProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollOffset = useSharedValue(0);
  const inScrollOffset = useSharedValue(0);
  const contentRef = useRef<Animated.View>(null);

  useEffect(() => {
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

      setSelectedIndex(
        clamp(
          Math.floor((-1 * newScrollOffset) / ELEMENT_HEIGHT),
          values.length - 1,
          0
        )
      );
    })
    .onEnd((event) => {
      const oldInscrollOffset = inScrollOffset.value;
      let newScrollOffset =
        scrollOffset.value - oldInscrollOffset + event.translationY;
      contentRef.current?.measure((x, y, width, height, pageX, pageY) => {
        if (Math.abs(newScrollOffset) > height - ELEMENT_HEIGHT) {
          newScrollOffset = -1 * (height - ELEMENT_HEIGHT);
        } else if (newScrollOffset >= 0) {
          newScrollOffset = 0;
        } else {
          const scrollOffsetTip = Math.abs(newScrollOffset) % ELEMENT_HEIGHT;
          if (scrollOffsetTip > ELEMENT_HEIGHT / 2) {
            newScrollOffset =
              newScrollOffset - (ELEMENT_HEIGHT - scrollOffsetTip);
          } else {
            newScrollOffset = newScrollOffset + scrollOffsetTip;
          }
        }
        scrollOffset.value = withTiming(newScrollOffset, { duration: 300 });
        setSelectedIndex(
          clamp(
            Math.floor((-1 * newScrollOffset) / ELEMENT_HEIGHT),
            values.length - 1,
            0
          )
        );
      });
    })
    .runOnJS(true);

  const scrollAnimationStyle = useAnimatedStyle(() => ({
    top: scrollOffset.value,
  }));

  return (
    <View background>
      <GestureDetector gesture={panGesture}>
        <View style={scrollableLockStyles.scroll}>
          <View style={{ height: ELEMENT_HEIGHT * 2 }} />
          <Animated.View style={scrollAnimationStyle} ref={contentRef}>
            {values.map((value, index) => {
              const indexDelta = useSharedValue(0);
              useEffect(() => {
                indexDelta.value = withTiming(index - selectedIndex, {
                  duration: 100,
                });
              }, [index, selectedIndex]);

              const animatedItemStyle = useAnimatedStyle(() => ({
                transform: [
                  { perspective: 1000 },
                  { rotateX: `${indexDelta.value * 20}deg` },
                ],
                opacity: 1 - Math.abs(indexDelta.value / items.length),
              }));

              return (
                <Animated.View
                  key={value}
                  style={[
                    scrollableLockStyles.item,
                    index !== selectedIndex ? animatedItemStyle : {},
                  ]}
                >
                  <Text large light>
                    {value}
                  </Text>
                </Animated.View>
              );
            })}
          </Animated.View>
          <View style={scrollableLockStyles.selection}></View>
        </View>
      </GestureDetector>
    </View>
  );
}

type DateSelectorProps = {};

function DateSelector() {}
