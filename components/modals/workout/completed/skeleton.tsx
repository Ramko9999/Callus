import { useThemeColoring, View } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StyleSheet, ViewStyle } from "react-native";
import { ExercisesEditorTopActions } from "./top-actions";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { ModalWrapper } from "../../common";

type SkeletonBarProps = {
  style?: ViewStyle;
};

function SkeletonBar({ style }: SkeletonBarProps) {
  const barColor = useSharedValue(0);
  const fromColor = useThemeColoring("calendarDayBackground");
  const toColor = useThemeColoring("calendarDayBackgroundTint");

  useEffect(() => {
    barColor.value = withRepeat(withTiming(1), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      barColor.value,
      [0, 1],
      [fromColor, toColor]
    ),
  }));

  return <Animated.View style={[animatedStyle, style]} />;
}

const metaSkeletonStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(3),
    paddingLeft: "3%",
    flex: 1,
  },
});

function MetaSkeleton() {
  return (
    <View style={metaSkeletonStyles.container}>
      <SkeletonBar style={{ width: "85%", height: "8%" }} />
      <SkeletonBar style={{ width: "40%", height: "3%" }} />
      <SkeletonBar style={{ width: "55%", height: "3%" }} />
    </View>
  );
}

const skeletionStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingTop: "3%",
  },
});

export function Skeleton() {
  return (
    <ModalWrapper>
      <View style={skeletionStyles.container}>
        <ExercisesEditorTopActions
          onClose={() => {}}
          onAdd={() => {}}
          onRepeat={() => {}}
          onTrash={() => {}}
        />
      </View>
    </ModalWrapper>
  );
}
