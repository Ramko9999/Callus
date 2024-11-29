import { useThemeColoring, View } from "@/components/Themed";
import { useWindowDimensions, StyleSheet } from "react-native";
import { Svg, Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import React, { useEffect } from "react";
import { StyleUtils } from "@/util/styles";

const progressRingStyles = StyleSheet.create({
  content: {
    position: "absolute",
  },
});

type ProgressRingProps = {
  progress: number;
  children?: React.ReactNode;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({ progress, children }: ProgressRingProps) {
  const ringProgress = useSharedValue(progress);

  useEffect(() => {
    ringProgress.value = withTiming(progress);
  }, [progress]);

  const { width } = useWindowDimensions();

  const svgDimension = width * 0.9;
  const radius = svgDimension / 3;
  const circumference = Math.PI * 2 * radius;

  const animatedProgressProps = useAnimatedProps(() => ({
    strokeDasharray: `${circumference}`,
    strokeDashoffset: `${-1 * circumference * (1 - progress)}`,
  }));

  const ringProps = {
    cx: "50%",
    cy: "50%",
    r: radius,
    strokeWidth: "15",
  };

  return (
    <View style={{ ...StyleUtils.flexRowCenterAll() }}>
      <Svg height={svgDimension} width={svgDimension}>
        <Circle
          {...ringProps}
          fill="transparent"
          stroke={useThemeColoring("dynamicHeaderBorder")}
        />
        <AnimatedCircle
          animatedProps={animatedProgressProps}
          {...ringProps}
          fill="transparent"
          stroke={useThemeColoring("primaryAction")}
        />
      </Svg>
      <View style={progressRingStyles.content}>{children}</View>
    </View>
  );
}
