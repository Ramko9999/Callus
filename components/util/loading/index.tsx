import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { View, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";

const loadingStyles = StyleSheet.create({
  container: {
    height: "60%",
    ...StyleUtils.flexColumn(),
    alignItems: "center",
    justifyContent: "center",
  },
  dotsContainer: {
    ...StyleUtils.flexRow(5),
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

const DOT_ANIMATION_DURATION = 600;
const ANIMATION_DELAY = 200;

function LoadingDot({ delay }: { delay: number }) {
  const scale = useSharedValue(1);
  const textColor = useThemeColoring("primaryText");

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withRepeat(
      withDelay(
        delay,
        withSequence(
          withTiming(1.5, {
            duration: DOT_ANIMATION_DURATION / 2,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          withTiming(1, {
            duration: DOT_ANIMATION_DURATION / 2,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        )
      ),
      -1,
      true
    );
  }, []);

  return (
    <Animated.View
      style={[loadingStyles.dot, animatedStyle, { backgroundColor: textColor }]}
    />
  );
}

export function Loading() {
  return (
    <View style={loadingStyles.container}>
      <View style={loadingStyles.dotsContainer}>
        <LoadingDot delay={0} />
        <LoadingDot delay={ANIMATION_DELAY} />
        <LoadingDot delay={ANIMATION_DELAY * 2} />
      </View>
    </View>
  );
}
