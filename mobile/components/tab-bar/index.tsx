import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { StyleSheet, useWindowDimensions } from "react-native";
import { StyleUtils } from "@/util/styles";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTabBar } from "./context";
import { useEffect } from "react";
import { Tabs } from "./tabs";

const tabBarStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  tabs: {
    ...StyleUtils.flexRow(),
  },
  tab: {
    ...StyleUtils.flexColumn(2),
    alignItems: "center",
  },
});

const TO_HIDE_TRANSLATION_MULTIPLIER = 0.14;

export function TabBar(props: MaterialTopTabBarProps) {
  const { isOpen } = useTabBar();
  const { height } = useWindowDimensions();
  const translation = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      translation.value = withTiming(0);
    } else {
      translation.value = withTiming(height * TO_HIDE_TRANSLATION_MULTIPLIER);
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: translation.value }],
    }),
    []
  );

  return (
    <Animated.View style={[tabBarStyles.container, animatedStyle]}>
      <Tabs {...props} />
    </Animated.View>
  );
}
