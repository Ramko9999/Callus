import { StyleSheet } from "react-native";
import { useThemeColoring, View, Text } from "@/components/Themed";
import {
  FontAwesome6,
  FontAwesome5,
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
} from "react-native-reanimated";
import { useEffect } from "react";
import {
  BicepsFlexed,
  FlaskConical,
  FolderKanban,
  LucideHistory,
  User,
} from "lucide-react-native";

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

type DurationMetaIconProps = {
  durationInMillis: number;
};

export function DurationMetaIconProps({
  durationInMillis,
}: DurationMetaIconProps) {
  return (
    <View style={summaryIconStyles.container}>
      <Ionicons
        name="time"
        color={useThemeColoring("lightText")}
        size={textTheme.neutral.fontSize}
      />
      <Text neutral light>
        {getTimePeriodDisplay(durationInMillis)}
      </Text>
    </View>
  );
}

type TabBarIconProps = {
  color: string;
};

export function ProfileTabIcon({ color }: TabBarIconProps) {
  return <User size={textTheme.large.fontSize} color={color} />;
}

export function HistoryTabIcon({ color }: TabBarIconProps) {
  return <LucideHistory size={textTheme.large.fontSize} color={color} />;
}

export function ExerciseTabIcon({ color }: TabBarIconProps) {
  return <BicepsFlexed size={textTheme.large.fontSize} color={color} />;
}

export function RoutinesTabIcon({ color }: TabBarIconProps) {
  return <FolderKanban size={textTheme.large.fontSize} color={color} />;
}

export function ExampleTabIcon({ color }: TabBarIconProps) {
  return <FlaskConical size={textTheme.large.fontSize} color={color} />;
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
