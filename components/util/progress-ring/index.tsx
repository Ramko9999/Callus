import { useThemeColoring, View } from "@/components/Themed";
import { useWindowDimensions, StyleSheet } from "react-native";
import { Svg, Circle } from "react-native-svg";
import React from "react";
import { StyleUtils } from "@/util/styles";

const progressRingStyles = StyleSheet.create({
  content: {
    position: "absolute",
  },
});

type ProgressRingProps = {
  progress: number;
  dimension?: number;
  children?: React.ReactNode;
  strokeWidth?: number;
};

export function ProgressRing({
  progress,
  dimension,
  children,
  strokeWidth = 10,
}: ProgressRingProps) {
  const { width } = useWindowDimensions();

  const svgDimension = dimension ?? width * 0.9;
  const radius = svgDimension / 2.2;
  const circumference = Math.PI * 2 * radius;

  const ringProps = {
    cx: "50%",
    cy: "50%",
    r: radius,
    strokeWidth
  };

  return (
    <View style={{ ...StyleUtils.flexRowCenterAll()}}>
      <Svg height={svgDimension} width={svgDimension}>
        <Circle
          {...ringProps}
          fill="transparent"
          stroke={useThemeColoring("dynamicHeaderBorder")}
        />
        <Circle
          {...ringProps}
          fill="transparent"
          stroke={useThemeColoring("primaryAction")}
          strokeDasharray={circumference}
          strokeDashoffset={-1 * circumference * (1 - progress)}
        />
      </Svg>
      <View style={progressRingStyles.content}>{children}</View>
    </View>
  );
}
