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
import Svg, { Path } from "react-native-svg";

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
  const weightDisplay = Math.round(weight);
  return (
    <View style={summaryIconStyles.container}>
      <MaterialCommunityIcons
        name="weight"
        color={useThemeColoring("lightText")}
        size={textTheme.neutral.fontSize}
      />
      <Text neutral light>{`${weightDisplay} lb`}</Text>
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

type TwitterXProps = {
  size?: number;
  color?: string;
};

export function TwitterX({ size = 24, color = "#FFFFFF" }: TwitterXProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1200 1227" fill="none">
      <Path
        d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
        fill={color}
      />
    </Svg>
  );
}



