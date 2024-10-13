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
import { FontAwesome } from "@expo/vector-icons";

type ViewThemeProps = {
  _type?: "background" | "foreground"
};

type TextThemeProps = {
  _type: keyof typeof textTheme;
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
  size?: number
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

  const coloring = useThemeColoring(_type !== undefined && _type === "background" ? "viewBackground" : "viewForeground") as ViewStyle;

  return <DefaultView style={[coloring, style]} {...otherProps} />;
}

export function TextInput(props: TextInputProps) {
  const { style, _type, ...otherProps } = props;
  const coloring = useThemeColoring("text") as TextStyle;
  return <DefaultTextInput style={[coloring, textTheme[_type] as TextStyle, style]} {...otherProps} />;
}

export function Action(props: ActionProps) {
  const { _action, ...otherProps } = props;
  const { type, style, name } = _action;
  const coloring = useThemeColoring(
    type === "danger" ? "actionDanger" : "actionNeutral"
  );
  return (
    <TouchableOpacity {...otherProps}>
      <Text _type="neutral" style={[coloring, {padding: "3%"}, style]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
} 

export function Icon({ name, size }: IconProps) {
  const coloring = useThemeColoring("text") as TextStyle;

  return <FontAwesome name={name} color={coloring.color} size={size} />;
}
