import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { View, Text, useThemeColoring } from "../Themed";
import React, { useCallback, useState } from "react";
import { StyleSheet, Platform, Pressable } from "react-native";
import { StyleUtils } from "@/util/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { convertHexToRGBA } from "@/util/color";
import { TabIcon } from "./icons";

const tabStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(2),
    alignItems: "center",
    paddingVertical: "2%",
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
});

type TabProps = {
  title: string;
  isFocused: boolean;
  onPress: () => void;
};

function Tab({ title, isFocused, onPress }: TabProps) {
  const focusedTextColor = useThemeColoring("primaryAction");
  const unfocusedTextColor = useThemeColoring("lightText");
  const overlayColor = convertHexToRGBA(useThemeColoring("primaryAction"), 0.1);
  const [taps, setTaps] = useState(0);

  const handlePress = useCallback(() => {
    onPress();
    setTaps((taps) => taps + 1);
  }, [onPress]);

  const color = isFocused ? focusedTextColor : unfocusedTextColor;

  return (
    <Pressable onPress={handlePress} style={tabStyles.container}>
      <TabIcon color={color} focused={isFocused} title={title} taps={taps} />
      <Text
        tab
        style={{
          color,
        }}
      >
        {title}
      </Text>
      {isFocused && (
        <View style={[tabStyles.overlay, { backgroundColor: overlayColor }]} />
      )}
    </Pressable>
  );
}

const tabsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    paddingHorizontal: "2%",
    justifyContent: "space-between",
    paddingTop: "2%",
    borderTopWidth: 1,
  },
});

export function Tabs({
  state,
  descriptors,
  navigation,
  position,
}: MaterialTopTabBarProps) {
  const backgroundColor = useThemeColoring("appBackground");
  const insets = useSafeAreaInsets();
  const paddingBottom =
    Platform.OS === "android" ? insets.bottom + 20 : insets.bottom;
  const borderColor = convertHexToRGBA(useThemeColoring("lightText"), 0.15);

  const onTabPress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation]
  );

  return (
    <View
      style={[
        tabsStyles.container,
        { paddingBottom, backgroundColor, borderColor },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const isFocused = state.index === index;

        return (
          <Tab
            key={options.title as string}
            title={options.title as string}
            isFocused={isFocused}
            onPress={() => onTabPress(route.key, route.name, isFocused)}
          />
        );
      })}
    </View>
  );
}
