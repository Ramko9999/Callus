import { convertHexToRGBA } from "@/util/color";
import {
  LucideHistory,
  User,
  BicepsFlexed,
  FolderKanban,
} from "lucide-react-native";
import { useThemeColoring } from "../Themed";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
} from "react-native-reanimated";
import { useEffect, useRef } from "react";

type TabBarIconProps = {
  color: string;
  focused: boolean;
  title: string;
  taps: number;
};

type SpringyTabIconProps = {
  children: React.ReactNode;
  isFocused: boolean;
  taps: number;
};

function SpringyTabIcon({ children, isFocused, taps }: SpringyTabIconProps) {
  const scale = useSharedValue(1);

  const tapsCount = useRef(taps);

  useEffect(() => {
    if (isFocused && tapsCount.current !== taps) {
      tapsCount.current = taps;
      scale.value = withSequence(
        withSpring(0.8, {
          damping: 15,
          stiffness: 180,
          mass: 0.4,
        }),
        withSpring(1, {
          damping: 15,
          stiffness: 180,
          mass: 0.4,
        })
      );
    }
  }, [isFocused, taps]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function TabIcon({ color, focused, title, taps }: TabBarIconProps) {
  const focusedFillColor = convertHexToRGBA(
    useThemeColoring("primaryAction"),
    0.3
  );
  const fillColor = focused ? focusedFillColor : "transparent";
  const iconProps = {
    size: 22,
    color,
    strokeWidth: 2,
    fill: fillColor,
  };

  return (
    <SpringyTabIcon isFocused={focused} taps={taps}>
      {title === "History" ? <LucideHistory {...iconProps} /> : null}
      {title === "Exercises" ? <BicepsFlexed {...iconProps} /> : null}
      {title === "Routines" ? <FolderKanban {...iconProps} /> : null}
      {title === "Profile" ? <User {...iconProps} /> : null}
    </SpringyTabIcon>
  );
}
