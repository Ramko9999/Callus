import { StyleSheet } from "react-native";
import { useThemeColoring, View, Text } from "@/components/Themed";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
  FontAwesome,
} from "@expo/vector-icons";
import { textTheme } from "@/constants/Themes";
import { StyleUtils } from "@/util/styles";
import { getTimePeriodDisplay } from "@/util/date";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";
import {
  Badge,
  BicepsFlexed,
  ChartNoAxesColumnIncreasing,
  FolderKanban,
  LucideHistory,
  User,
} from "lucide-react-native";
import { Dumbbell } from "./custom-svg";

const dragIndicatorStyles = StyleSheet.create({
  container: {
    alignSelf: "center",
    width: 40,
    borderRadius: 5,
    height: 6,
  },
});

export function DragIndicator() {
  return (
    <View
      style={[
        dragIndicatorStyles.container,
        { backgroundColor: useThemeColoring("dynamicHeaderBorder") },
      ]}
    />
  );
}

const typingIndicatorStyles = StyleSheet.create({
  container: {
    width: 2,
    borderRadius: 5,
    height: 20,
  },
});

export function TypingIndicator() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(1), withTiming(0)), -1);
  }, []);

  const typingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        typingIndicatorStyles.container,
        typingAnimatedStyle,
        { backgroundColor: useThemeColoring("primaryText") },
      ]}
    />
  );
}

type DisplayIconProps = {
  size?: number;
  color?: string;
};

export function TrendingUp({ size, color }: DisplayIconProps) {
  return (
    <MaterialIcons
      name="trending-up"
      size={size ?? textTheme.large.fontSize}
      color={color ?? useThemeColoring("lightText")}
    />
  );
}

export function TrendingDown({ size, color }: DisplayIconProps) {
  return (
    <MaterialIcons
      name="trending-down"
      size={size ?? textTheme.large.fontSize}
      color={color ?? useThemeColoring("lightText")}
    />
  );
}

export function TrendingNeutral({ size, color }: DisplayIconProps) {
  return (
    <MaterialIcons
      name="trending-neutral"
      size={size ?? textTheme.large.fontSize}
      color={color ?? useThemeColoring("lightText")}
    />
  );
}

const paginationDotStyles = StyleSheet.create({
  on: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  off: {
    width: 7,
    height: 7,
    borderRadius: 4,
    opacity: 0.5,
  },
});

type PaginationDotProps = {
  isOn: boolean;
};

export function PaginationDot({ isOn }: PaginationDotProps) {
  return (
    <View
      style={[
        isOn ? paginationDotStyles.on : paginationDotStyles.off,
        { backgroundColor: useThemeColoring("primaryText") },
      ]}
    />
  );
}

const summaryIconStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(5),
    alignItems: "center",
  },
});

type WeightMetaIconProps = {
  weight: number;
};

export function WeightMetaIcon({ weight }: WeightMetaIconProps) {
  return (
    <View style={summaryIconStyles.container}>
      <MaterialCommunityIcons
        name="weight"
        color={useThemeColoring("lightText")}
        size={textTheme.neutral.fontSize}
      />
      <Text neutral light>{`${weight} lb`}</Text>
    </View>
  );
}

type RepsMetaIconProps = {
  reps: number;
};

export function RepsMetaIcon({ reps }: RepsMetaIconProps) {
  return (
    <View style={summaryIconStyles.container}>
      <MaterialCommunityIcons
        name="arm-flex"
        color={useThemeColoring("lightText")}
        size={textTheme.neutral.fontSize}
      />
      <Text neutral light>{`${reps} reps`}</Text>
    </View>
  );
}

type DurationMetaIcon = {
  durationInMillis: number;
  shouldDisplayDecimalHours?: boolean;
};

export function DurationMetaIcon({
  durationInMillis,
  shouldDisplayDecimalHours = false,
}: DurationMetaIcon) {
  return (
    <View style={summaryIconStyles.container}>
      <Ionicons
        name="time"
        color={useThemeColoring("lightText")}
        size={textTheme.neutral.fontSize}
      />
      <Text neutral light>
        {shouldDisplayDecimalHours
          ? `${(durationInMillis / (1000 * 60 * 60)).toFixed(1)}h`
          : getTimePeriodDisplay(durationInMillis)}
      </Text>
    </View>
  );
}

type TabBarIconProps = {
  color: string;
  focused: boolean;
};

export function AnimatedTabIcon({
  children,
  focused,
}: {
  children: React.ReactNode;
  focused: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 0.9 : 1, {
      damping: 10,
      stiffness: 100,
      mass: 0.5,
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function ProfileTabIcon({ color, focused }: TabBarIconProps) {
  return (
    <AnimatedTabIcon focused={focused}>
      <User size={textTheme.large.fontSize} color={color} strokeWidth={1} />
    </AnimatedTabIcon>
  );
}

export function HistoryTabIcon({ color, focused }: TabBarIconProps) {
  return (
    <AnimatedTabIcon focused={focused}>
      <LucideHistory
        size={textTheme.large.fontSize}
        color={color}
        strokeWidth={1}
      />
    </AnimatedTabIcon>
  );
}

export function ExerciseTabIcon({ color, focused }: TabBarIconProps) {
  return (
    <AnimatedTabIcon focused={focused}>
      <BicepsFlexed
        size={textTheme.large.fontSize}
        color={color}
        strokeWidth={1}
      />
    </AnimatedTabIcon>
  );
}

export function RoutinesTabIcon({ color, focused }: TabBarIconProps) {
  return (
    <AnimatedTabIcon focused={focused}>
      <FolderKanban
        size={textTheme.large.fontSize}
        color={color}
        strokeWidth={1}
      />
    </AnimatedTabIcon>
  );
}

export function DeleteKeypadIcon() {
  return (
    <Feather
      name="delete"
      size={textTheme.action.fontSize}
      color={useThemeColoring("primaryText")}
    />
  );
}

type StarProps = {
  size?: number;
  color?: string;
};

export function Star({ size, color }: StarProps) {
  return (
    <FontAwesome
      name="star"
      size={size ?? textTheme.large.fontSize}
      color={color ?? useThemeColoring("primaryAction")}
    />
  );
}

export function OnboardingWeightIcon() {
  return (
    <Dumbbell
      color={useThemeColoring("primaryAction")}
      size={64}
      fill={useThemeColoring("primaryAction")}
      viewBox="0 0 48 48"
      strokeWidth={1}
    />
  );
}

export function OnboardingProgressIcon() {
  return (
    <ChartNoAxesColumnIncreasing
      color={useThemeColoring("primaryAction")}
      strokeWidth={3}
      size={40}
    />
  );
}

const onboardingFreeIconStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
  },
  overlay: {
    position: "absolute",
  },
});

export function OnboardingFreeIcon() {
  const overlayColor = useThemeColoring("primaryViewBackground");

  return (
    <View style={onboardingFreeIconStyles.container}>
      <Badge
        color={useThemeColoring("primaryAction")}
        size={52}
        fill={useThemeColoring("primaryAction")}
      />
      <View style={onboardingFreeIconStyles.overlay}>
        <Text small style={{ color: overlayColor }}>
          FREE
        </Text>
      </View>
    </View>
  );
}
