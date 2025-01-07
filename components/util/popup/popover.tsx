import React, { useEffect } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const popoverStyles = StyleSheet.create({
  content: {
    position: "absolute",
    zIndex: 2,
    overflow: "hidden",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export type PopoverAnchor = {
  x: number;
  y: number;
};

type PopoverProps = {
  show: boolean;
  onBackdropPress: () => void;
  children: React.ReactNode;
  anchor: PopoverAnchor;
  contentStyle?: ViewStyle;
};

export function Popover({
  show,
  onBackdropPress,
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
      ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.7)"]
    ),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    display: Math.abs(contentHeightPercentage.value) === 0 ? "none" : "flex",
    height: `${contentHeightPercentage.value}%`,
    opacity: interpolate(contentHeightPercentage.value, [0, 100], [0, 1]),
  }));

  return (
    <>
      <AnimatedPressable
        style={[popoverStyles.backdrop, backdropAnimatedStyle]}
        onPress={onBackdropPress}
      />
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
