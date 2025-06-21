import { useThemeColoring, View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTION_DIMENSION = 40;

const headerStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingBottom: "3%",
    paddingHorizontal: "3%",
  },
  mainRow: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "space-between",
  },
  action: {
    height: ACTION_DIMENSION,
    width: ACTION_DIMENSION,
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    ...StyleUtils.flexColumn(),
    alignItems: "center",
  },
  subtitleContainer: {
    ...StyleUtils.flexRowCenterAll()
  },
});

type HeaderProps = {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  leftAction: React.ReactNode;
};

function Header({ title, subtitle, rightAction, leftAction }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[headerStyles.container, { paddingTop: insets.top }]}>
      <View style={headerStyles.mainRow}>
        <View style={headerStyles.action}>{leftAction ? leftAction : null}</View>
        <View style={headerStyles.titleContainer}>
          <Text header>{title}</Text>
        </View>
        <View style={headerStyles.action}>
          {rightAction ? rightAction : null}
        </View>
      </View>
      {subtitle && (
        <View style={headerStyles.subtitleContainer}>
          <Text light>{subtitle}</Text>
        </View>
      )}
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
  subtitle?: string;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  children: React.ReactNode;
};

export function HeaderPage({
  title,
  subtitle,
  rightAction,
  leftAction,
  children,
}: HeaderPageProps) {
  const pageBgColor = useThemeColoring("appBackground");

  return (
    <View
      style={[headerPageStyles.container, { backgroundColor: pageBgColor }]}
    >
      <Header title={title} subtitle={subtitle} rightAction={rightAction} leftAction={leftAction} />
      <View style={headerPageStyles.content}>{children}</View>
    </View>
  );
}
