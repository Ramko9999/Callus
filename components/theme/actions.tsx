import { useThemeColoring, View, Text } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import {
  ICON_ACTION_DIMENSION,
  StyleUtils,
  TEXT_ACTION_HEIGHT,
} from "@/util/styles";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { ViewStyle, StyleSheet, TouchableOpacity } from "react-native";

const iconActionStyles = StyleSheet.create({
  container: {
    height: ICON_ACTION_DIMENSION,
    width: ICON_ACTION_DIMENSION,
    borderRadius: Math.ceil(ICON_ACTION_DIMENSION / 2),
    ...StyleUtils.flexRowCenterAll(),
  },
});

const textActionStyles = StyleSheet.create({
  container: {
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 5,
    height: TEXT_ACTION_HEIGHT,
    ...StyleUtils.flexRowCenterAll(),
  },
});

type ActionProps = {
  onClick?: () => void;
  style?: ViewStyle;
};

export function Trash({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("dangerAction") },
          style,
        ]}
      >
        <FontAwesome
          name="trash"
          size={textTheme.large.fontSize}
          color={"white"}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Edit({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="pencil"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Close({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="close"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Back({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="arrow-left"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Add({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="plus"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Search({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="search"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Shuffle({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <Entypo
          name="shuffle"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Done({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="check"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Time({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="clock-o"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

type TextActionProps = ActionProps & { text: string };

export function SignificantAction({ onClick, style, text }: TextActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          textActionStyles.container,
          { backgroundColor: useThemeColoring("primaryAction") },
          style,
        ]}
      >
        <Text action style={{ color: "white" }}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function NeutralAction({ onClick, style, text }: TextActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        background
        style={[
          textActionStyles.container,
          { backgroundColor: useThemeColoring("neutralAction") },
          style,
        ]}
      >
        <Text action>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function DangerAction({ onClick, style, text }: TextActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          textActionStyles.container,
          { backgroundColor: useThemeColoring("dangerAction") },
          style,
        ]}
      >
        <Text action style={{ color: "white" }}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
