import { Pressable, StyleSheet, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const POPOVER_BACKDROP_VISIBLE_COLOR = "rgba(0, 0, 0, 0.1)";
export const BACKDROP_VISIBLE_COLOR = "rgba(0, 0, 0, 0.8)";

export const FULL_SHEET_HEIGHT_MULTIPLIER = 0.85;

const backdropStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

type BackdropProps = {
  animatedStyle: ViewStyle;
  onClick: () => void;
};

export function Backdrop({ animatedStyle, onClick }: BackdropProps) {
  return (
    <AnimatedPressable
      style={[backdropStyles.container, animatedStyle]}
      onPress={onClick}
    />
  );
}
