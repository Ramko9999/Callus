import {
  Text as DefaultText,
  View as DefaultView,
  TextInput as DefaultTextInput,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
} from "react-native";

import {
  textTheme,
  UIColor,
  lightColorTheme,
  darkColorTheme,
} from "@/constants/Themes";
import { useColorScheme } from "./useColorScheme";
import {
  FontAwesome,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React from "react";

type ViewThemeProps = {
  _type?: "background" | "foreground";
};

export type TextType = keyof typeof textTheme;

type TextThemeProps = {
  _type: TextType;
};

type ActionThemeProps = {
  _action: {
    type: "neutral" | "danger";
    style?: TextStyle;
    name: string;
  };
};

export type ViewProps = DefaultView["props"] & ViewThemeProps;
export type TextProps = DefaultText["props"] & TextThemeProps;
export type TextInputProps = DefaultTextInput["props"] & TextThemeProps;
export type ActionProps = Omit<TouchableOpacity["props"], "children"> &
  ActionThemeProps;
export type IconProps = {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  size?: number;
  color?: string;
};
// todo: fix this nasty ish

export type FeatherIconProps = {
  name: React.ComponentProps<typeof Feather>["name"];
  size?: number;
  color?: string;
};

export type IoniconsIconProps = {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
};

export type MaterialCommunityIconProps = {
  name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  size?: number;
  color?: string;
};

export function useThemeColoring(color: UIColor) {
  const theme = useColorScheme() ?? "light";

  if (theme === "dark") {
    return darkColorTheme[color];
  }
  return lightColorTheme[color];
}

export function Text(props: TextProps) {
  const { style, _type, ...otherProps } = props;
  const coloring = useThemeColoring("text") as TextStyle;

  return (
    <DefaultText
      style={[coloring, textTheme[_type] as TextStyle, style]}
      {...otherProps}
    />
  );
}

export function View(props: ViewProps) {
  const { style, _type, ...otherProps } = props;

  const coloring = useThemeColoring(
    _type !== undefined && _type === "background"
      ? "viewBackground"
      : "viewForeground"
  ) as ViewStyle;

  return <DefaultView style={[coloring, style]} {...otherProps} />;
}

export function TextInput(props: TextInputProps) {
  const { style, _type, ...otherProps } = props;
  const coloring = useThemeColoring("text") as TextStyle;
  return (
    <DefaultTextInput
      style={[coloring, textTheme[_type] as TextStyle, style]}
      {...otherProps}
    />
  );
}

export function Action(props: ActionProps) {
  const { _action, ...otherProps } = props;
  const { type, style, name } = _action;
  const coloring = useThemeColoring(
    type === "danger" ? "actionDanger" : "actionNeutral"
  );
  return (
    <TouchableOpacity {...otherProps}>
      <Text _type="neutral" style={[coloring, { padding: "3%" }, style]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

// todo: clean this nasty ish up. Matter of fact, clean up the damn file
export function Icon({ name, size, color }: IconProps) {
  const coloring = useThemeColoring("text") as TextStyle;

  return (
    <FontAwesome name={name} color={color || coloring.color} size={size} />
  );
}

export function FeatherIcon({ name, size, color }: FeatherIconProps) {
  const coloring = useThemeColoring("text") as TextStyle;

  return <Feather name={name} color={color || coloring.color} size={size} />;
}

export function IoniconsIcon({ name, size, color }: IoniconsIconProps) {
  const coloring = useThemeColoring("text") as TextStyle;
  return <Ionicons name={name} color={color || coloring.color} size={size} />;
}

export function MaterialCommunityIcon({
  name,
  size,
  color,
}: MaterialCommunityIconProps) {
  const coloring = useThemeColoring("text") as TextStyle;
  return (
    <MaterialCommunityIcons
      name={name}
      color={color || coloring.color}
      size={size}
    />
  );
}
