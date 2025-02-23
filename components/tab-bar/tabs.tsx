import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View, Text, useThemeColoring } from "../Themed";
import React from "react";
import { TouchableWithoutFeedback, StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { textTheme } from "@/constants/Themes";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(2),
    alignItems: "center",
  },
});

type TabProps = {
  title: string;
  isFocused: boolean;
  renderIcon: (color: string) => React.ReactNode;
  onPress: () => void;
};

function Tab({ title, isFocused, renderIcon, onPress }: TabProps) {
  const focusedColor = useThemeColoring("primaryAction");
  const unfocusedColor = useThemeColoring("lightText");

  const color = isFocused ? focusedColor : unfocusedColor;

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={tabStyles.container}>
        {renderIcon(color)}
        <Text
          tab
          style={{
            color,
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const tabsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    paddingHorizontal: "8%",
    justifyContent: "space-between",
    paddingTop: "2%",
  },
});

export function Tabs({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[tabsStyles.container, { paddingBottom: insets.bottom }]}>
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
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Tab
            key={options.title as string}
            title={options.title as string}
            isFocused={isFocused}
            renderIcon={(color) =>
              options.tabBarIcon!({
                focused: isFocused,
                color,
                size: textTheme.action.fontSize,
              })
            }
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}
