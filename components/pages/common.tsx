import { Pressable, TouchableOpacity, View as RNView } from "react-native";
import { useThemeColoring, View } from "../Themed";
import { ChevronLeft, MoreHorizontal, Plus, X } from "lucide-react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { forwardRef } from "react";

type CloseButtonProps = {
  onClick: () => void;
};

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <X color={useThemeColoring("primaryAction")} />
    </TouchableOpacity>
  );
}

type MoreButtonProps = {
  onClick: () => void;
  progress: SharedValue<number>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MoreButton = forwardRef<RNView, MoreButtonProps>(
  ({ onClick, progress }, ref) => {
    const opacity = useAnimatedStyle(() => {
      return {
        opacity: interpolate(progress.value, [0, 1], [1, 0.7]),
      };
    });

    return (
      <View ref={ref}>
        <AnimatedPressable onPress={onClick} style={opacity}>
          <MoreHorizontal size={28} color={useThemeColoring("primaryAction")} />
        </AnimatedPressable>
      </View>
    );
  }
);

type BackButtonProps = {
  onClick: () => void;
};

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <ChevronLeft size={28} color={useThemeColoring("primaryAction")} />
    </TouchableOpacity>
  );
}

type PlusButtonProps = {
  onClick: () => void;
};

export function PlusButton({ onClick }: PlusButtonProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <Plus size={26} color={useThemeColoring("primaryAction")} />
    </TouchableOpacity>
  );
}
