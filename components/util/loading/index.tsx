import React, { useEffect } from "react";
import { StyleSheet, StyleProp, TextStyle } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
  Easing,
  interpolateColor,
} from "react-native-reanimated";
import { convertHexToRGBA } from "@/util/color";

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
  skeletonContainer: {
    position: "relative",
  },
  skeletonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  hiddenText: {
    opacity: 0,
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

type TextSkeletonProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  animationDuration?: number;
  color?: string;
};

export function TextSkeleton({
  text,
  style,
  color,
  animationDuration = 1000,
}: TextSkeletonProps) {
  const skeletonColor = color ?? useThemeColoring("primaryAction");

  const fromColor = convertHexToRGBA(skeletonColor, 0.2);
  const toColor = convertHexToRGBA(skeletonColor, 0.3);

  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, { duration: animationDuration }),
      -1,
      true
    );
  }, [animationDuration]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animationProgress.value,
      [0, 1],
      [fromColor, toColor]
    ),
  }));

  return (
    <View style={loadingStyles.skeletonContainer}>
      <Text style={[style, loadingStyles.hiddenText]}>{text}</Text>
      <Animated.View style={[loadingStyles.skeletonOverlay, animatedStyle]} />
    </View>
  );
}
