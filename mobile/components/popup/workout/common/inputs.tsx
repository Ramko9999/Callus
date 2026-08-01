import { View, Text, useThemeColoring } from "@/components/Themed";
import { EDITOR_SET_HEIGHT, StyleUtils } from "@/util/styles";
import { Check } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const inputStyles = StyleSheet.create({
  label: {
    ...StyleUtils.flexColumn(3),
  },
});

const setIndexStyles = StyleSheet.create({
  index: {
    alignSelf: "center",
  },
});

type SetIndexProps = {
  index: number;
};

export function SetIndex({ index }: SetIndexProps) {
  return (
    <View style={inputStyles.label}>
      <Text light>Set</Text>
      <View style={setIndexStyles.index}>
        <Text large>{index + 1}</Text>
      </View>
    </View>
  );
}

const setStatusInputStyles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
  check: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: 5,
    height: EDITOR_SET_HEIGHT - 20,
    width: EDITOR_SET_HEIGHT - 20,
    alignSelf: "flex-end",
  },
});

type SetStatusInputProps = {
  isActive: boolean;
  onToggle: () => void;
};

export function SetStatusInput({ isActive, onToggle }: SetStatusInputProps) {
  const setColor = useSharedValue(isActive ? 1 : 0);
  const notStartedColor = useThemeColoring("calendarDayBackground");
  const finishedColor = useThemeColoring("primaryAction");

  useEffect(() => {
    setColor.value = withTiming(isActive ? 1 : 0);
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        setColor.value,
        [0, 1],
        [notStartedColor, finishedColor]
      ),
    }),
    []
  );

  return (
    <TouchableOpacity onPress={onToggle} style={setStatusInputStyles.container}>
      <Animated.View style={[setStatusInputStyles.check, animatedStyle]}>
        <Check color={useThemeColoring("primaryText")} strokeWidth={3} />
      </Animated.View>
    </TouchableOpacity>
  );
}
