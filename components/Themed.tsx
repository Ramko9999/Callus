import {
  Text as DefaultText,
  View as DefaultView,
  TextInput as DefaultTextInput,
  TextStyle,
  ViewStyle,
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
  background?: boolean;
};

export type TextType = keyof typeof textTheme;

type TextThemeProps = {
  tab?: boolean;
  small?: boolean;
  neutral?: boolean;
  header?: boolean;
  large?: boolean;
  extraLarge?: boolean;
  action?: boolean;
  stat?: boolean;
  emphasized?: boolean;
  light?: boolean;
  italic?: boolean;
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
export type TextInputProps = DefaultTextInput["props"] &
  TextThemeProps &
  React.RefAttributes<DefaultTextInput>;
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
  action,
  extraLarge,
  emphasized,
  stat,
  light,
  italic,
  header,
  tab,
}: TextProps) {
  let style = textTheme.neutral;
  if (tab) {
    style = textTheme.tab;
  } else if (small) {
    style = textTheme.small;
  } else if (neutral) {
    style = textTheme.neutral;
  } else if (header) {
    style = textTheme.header;
  } else if (action) {
    style = textTheme.action;
  } else if (large) {
    style = textTheme.large;
  } else if (extraLarge) {
    style = textTheme.extraLarge;
  } else if (stat) {
    style = textTheme.stat;
  }

  if (emphasized) {
    style = { ...style, ...textTheme.emphasized };
  }

  if (italic) {
    style = { ...style, ...textTheme.italic };
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
  const { style, light, ...otherProps } = props;
  const color = useThemeColoring(light ? "lightText" : "primaryText");
  const fontStyle = getFontStyle(props);

  return <DefaultText style={[{ color }, fontStyle, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, background, ...otherProps } = props;

  let defaultStyle: ViewStyle = {};

  if (background) {
    defaultStyle = {
      backgroundColor: useThemeColoring("primaryViewBackground"),
      borderColor: useThemeColoring("primaryViewBorder"),
    };
  }

  return <DefaultView style={[defaultStyle, style]} {...otherProps} />;
}

export const TextInput = React.forwardRef(
  (props: TextInputProps, ref: React.ForwardedRef<DefaultTextInput>) => {
    const { style, light, ...otherProps } = props;
    const color = useThemeColoring(light ? "lightText" : "primaryText");
    const fontStyle = getFontStyle(props);

    return (
      <DefaultTextInput
        ref={ref}
        style={[{ color }, fontStyle]}
        {...otherProps}
      />
    );
  }
);
