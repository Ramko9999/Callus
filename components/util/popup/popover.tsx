import React, { useEffect } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Backdrop, POPOVER_BACKDROP_VISIBLE_COLOR } from "./util";

const popoverStyles = StyleSheet.create({
  content: {
    position: "absolute",
    zIndex: 2,
    overflow: "hidden",
  },
});

export type PopoverAnchor = {
  x: number;
  y: number;
};

type PopoverProps = {
  show: boolean;
  onHide: () => void;
  children: React.ReactNode;
  anchor: PopoverAnchor;
  contentStyle?: ViewStyle;
};

export function Popover({
  show,
  onHide,
  children,
  anchor,
  contentStyle,
}: PopoverProps) {
  const contentHeightPercentage = useSharedValue(0);

  useEffect(() => {
    if (show) {
      contentHeightPercentage.value = withTiming(100);
    } else {
      contentHeightPercentage.value = withTiming(0);
    }
  }, [show]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    display: Math.abs(contentHeightPercentage.value) === 0 ? "none" : "flex",
    backgroundColor: interpolateColor(
      contentHeightPercentage.value,
      [0, 100],
      ["rgba(0, 0, 0, 0)", POPOVER_BACKDROP_VISIBLE_COLOR]
    ),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    display: Math.abs(contentHeightPercentage.value) === 0 ? "none" : "flex",
    height: `${contentHeightPercentage.value}%`,
    opacity: interpolate(contentHeightPercentage.value, [0, 100], [0, 1]),
  }));

  return (
    <>
      <Backdrop animatedStyle={backdropAnimatedStyle} onClick={onHide} />
      <Animated.View
        style={[
          popoverStyles.content,
          contentStyle,
          contentAnimatedStyle,
          { top: anchor.y, left: anchor.x },
        ]}
      >
        {children}
      </Animated.View>
    </>
  );
}
