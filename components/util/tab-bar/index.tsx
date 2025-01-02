import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { StyleUtils, TAB_BAR_HEIGHT } from "@/util/styles";
import { textTheme } from "@/constants/Themes";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { convertHexToRGBA } from "@/util/color";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useTabBar } from "./context";
import { useEffect } from "react";

const tabBarStyles = StyleSheet.create({
  container: {
    position: "absolute",
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    width: "100%",
    borderTopWidth: 1,
    paddingBottom: 10,
    bottom: 0,
  },
  tab: {
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isOpen } = useTabBar();

  const tabBarHeight = useSharedValue(TAB_BAR_HEIGHT);

  useEffect(() => {
    if (isOpen) {
      tabBarHeight.value = withTiming(TAB_BAR_HEIGHT);
    } else {
      tabBarHeight.value = withTiming(0);
    }
  }, [isOpen]);

  const colors = {
    focused: useThemeColoring("primaryText"),
    notFocused: convertHexToRGBA(useThemeColoring("primaryText"), 0.2),
  };

  const { width } = useWindowDimensions();
  const totalTabs = state.routes.length;

  const animatedStyle = useAnimatedStyle(() => ({
    height: tabBarHeight.value,
    display: tabBarHeight.value === 0 ? "none" : "flex",
  }));

  return (
    <Animated.View
      style={[
        tabBarStyles.container,
        {
          backgroundColor: useThemeColoring("appBackground"),
          borderColor: colors.notFocused,
        },
        animatedStyle,
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableWithoutFeedback
            key={index}
            onPress={onPress}
            style={[tabBarStyles.tab, { width: width / totalTabs }]}
          >
            {options.tabBarIcon &&
              options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? colors.focused : colors.notFocused,
                size: textTheme.action.fontSize,
              })}
          </TouchableWithoutFeedback>
        );
      })}
    </Animated.View>
  );
}
