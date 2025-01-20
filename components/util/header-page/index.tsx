import { useThemeColoring, View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet } from "react-native";

const HEADER_HEIGHT = 100;

const headerStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    height: HEADER_HEIGHT,
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingBottom: "3%",
    paddingHorizontal: "3%",
  },
  actionPlaceholder: {
    height: 1,
    width: 1,
  },
});

type HeaderProps = {
  title: string;
  rightAction?: React.ReactNode;
  leftAction: React.ReactNode;
};

function Header({ title, rightAction, leftAction }: HeaderProps) {
  const headerBgColor = useThemeColoring("primaryViewBackground");

  return (
    <View style={[headerStyles.container, { backgroundColor: headerBgColor }]}>
      <StatusBar backgroundColor={headerBgColor}></StatusBar>
      {leftAction ? (
        leftAction
      ) : (
        <View style={headerStyles.actionPlaceholder} />
      )}
      <Text header>{title}</Text>
      {rightAction ? (
        rightAction
      ) : (
        <View style={headerStyles.actionPlaceholder} />
      )}
    </View>
  );
}

const headerPageStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
  },
});

type HeaderPageProps = {
  title: string;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  children: React.ReactNode;
};

export function HeaderPage({
  title,
  rightAction,
  leftAction,
  children,
}: HeaderPageProps) {
  const pageBgColor = useThemeColoring("appBackground");

  return (
    <View
      style={[headerPageStyles.container, { backgroundColor: pageBgColor }]}
    >
      <Header title={title} rightAction={rightAction} leftAction={leftAction} />
      {children}
    </View>
  );
}
