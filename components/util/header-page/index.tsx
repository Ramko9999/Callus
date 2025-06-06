import { useThemeColoring, View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_HEIGHT = 100;
const ACTION_DIMENSION = 40;

const headerStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    height: HEADER_HEIGHT,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "3%",
    paddingHorizontal: "3%",
  },
  action: {
    height: ACTION_DIMENSION,
    width: ACTION_DIMENSION,
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    alignItems: "center",
  },
});

type HeaderProps = {
  title: string;
  rightAction?: React.ReactNode;
  leftAction: React.ReactNode;
};

function Header({ title, rightAction, leftAction }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[headerStyles.container, { paddingTop: insets.top }]}>
      <View style={headerStyles.action}>{leftAction ? leftAction : null}</View>
      <Text header>{title}</Text>
      <View style={headerStyles.action}>
        {rightAction ? rightAction : null}
      </View>
    </View>
  );
}

const headerPageStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
  },
  content: {
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
      <View style={headerPageStyles.content}>{children}</View>
    </View>
  );
}
