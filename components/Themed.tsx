import {
  Text as DefaultText,
  View as DefaultView,
  TextInput as DefaultTextInput,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import {
  darkColors,
  lightColors,
  textTheme,
  UIColor,
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
  background?: boolean;
  foreground?: boolean;
};

export type TextType = keyof typeof textTheme;

type TextThemeProps = {
  _type?: TextType;
  small?: boolean;
  neutral?: boolean;
  large?: boolean;
  extraLarge?: boolean;
  emphasized?: boolean;
  light?: boolean;
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

function getFontStyle({
  small,
  neutral,
  large,
  extraLarge,
  emphasized,
  light,
}: TextProps) {
  let style = textTheme.neutral;
  if (small) {
    style = textTheme.small;
  } else if (neutral) {
    style = textTheme.neutral;
  } else if (large) {
    style = textTheme.large;
  } else if (extraLarge) {
    style = textTheme.extraLarge;
  }

  if (emphasized) {
    style = { ...style, ...textTheme.emphasized };
  }

  if (light) {
    style = { ...style };
  }

  return style;
}

export function useThemeColoring(color: UIColor) {
  const theme = useColorScheme() ?? "light";

  if (theme === "dark") {
    return darkColors[color];
  }
  return lightColors[color];
}

export function Text(props: TextProps) {
  const { style, _type, light, ...otherProps } = props;
  const color = useThemeColoring(light ? "lightText" : "primaryText");

  //_type is deprecated
  let fontStyle = {};
  if (_type) {
    fontStyle = textTheme[_type] as TextStyle;
  } else {
    fontStyle = getFontStyle(props);
  }

  return <DefaultText style={[{ color }, fontStyle, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, _type, background, foreground, ...otherProps } = props;

  let defaultStyle: ViewStyle = {};

  if (_type) {
    const isBackground = _type === "background";
    defaultStyle = {
      backgroundColor: useThemeColoring(
        isBackground ? "primaryViewBackground" : "secondaryViewBackground"
      ),
      borderColor: useThemeColoring(
        isBackground ? "primaryViewBorder" : "secondaryViewBorder"
      ),
    };
  }

  if(background){
    defaultStyle = {
      backgroundColor: useThemeColoring("primaryViewBackground"),
      borderColor: useThemeColoring("primaryViewBorder")
    }
  } else {
    defaultStyle = {
      backgroundColor: useThemeColoring("secondaryViewBackground"),
      borderColor: useThemeColoring("secondaryViewBorder")
    }
  }

  return (
    <DefaultView
      style={[defaultStyle, style]}
      {...otherProps}
    />
  );
}

export function TextInput(props: TextInputProps) {
  const { style, _type, light, ...otherProps } = props;
  const color = useThemeColoring(light ? "lightText" : "primaryText");

  //_type is deprecated
  let fontStyle = {};
  if (_type) {
    fontStyle = textTheme[_type] as TextStyle;
  } else {
    fontStyle = getFontStyle(props);
  }

  return <DefaultTextInput style={[{ color }, fontStyle]} {...otherProps} />;
}

export function Action(props: ActionProps) {
  const { _action, ...otherProps } = props;
  const { type, style, name } = _action;
  const color = useThemeColoring(
    type === "danger" ? "dangerAction" : "neutralAction"
  );
  return (
    <TouchableOpacity {...otherProps}>
      <Text _type="neutral" style={[{ color }, { padding: "3%" }, style]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

// todo: clean this nasty ish up. Matter of fact, clean up the damn file
export function Icon({ name, size, color }: IconProps) {
  const defaultColor = useThemeColoring("primaryText");

  return <FontAwesome name={name} color={color || defaultColor} size={size} />;
}

export function FeatherIcon({ name, size, color }: FeatherIconProps) {
  const defaultColor = useThemeColoring("primaryText");

  return <Feather name={name} color={color || defaultColor} size={size} />;
}

export function IoniconsIcon({ name, size, color }: IoniconsIconProps) {
  const defaultColor = useThemeColoring("primaryText");
  return <Ionicons name={name} color={color || defaultColor} size={size} />;
}

export function MaterialCommunityIcon({
  name,
  size,
  color,
}: MaterialCommunityIconProps) {
  const defaultColor = useThemeColoring("primaryText");
  return (
    <MaterialCommunityIcons
      name={name}
      color={color || defaultColor}
      size={size}
    />
  );
}
