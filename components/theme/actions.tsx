import { useThemeColoring, View, Text } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import { ICON_ACTION_DIMENSION, StyleUtils } from "@/util/styles";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import {
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  TextStyle,
} from "react-native";

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
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    ...StyleUtils.flexRowCenterAll(),
  },
  text: {
    fontWeight: 600,
    color: "white",
  },
});

type ActionProps = {
  onClick?: () => void;
  iconSize?: number;
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

export function Start({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("primaryAction") },
          style,
        ]}
      >
        <FontAwesome
          name="play"
          size={textTheme.large.fontSize}
          color={"white"}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Edit({ onClick, style, iconSize }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="pencil"
          size={iconSize ?? textTheme.large.fontSize}
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

export function Add({ onClick, style, iconSize }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="plus"
          size={iconSize ?? textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Minus({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="minus"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Search({ onClick, style, iconSize }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="search"
          size={iconSize ?? textTheme.large.fontSize}
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

export function Repeat({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="repeat"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Settings({ onClick, iconSize, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="gear"
          size={iconSize ?? textTheme.large.fontSize}
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
        <Text neutral style={textActionStyles.text}>
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
          { backgroundColor: useThemeColoring("dynamicHeaderBorder") },
          style,
        ]}
      >
        <Text neutral style={textActionStyles.text}>
          {text}
        </Text>
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
        <Text neutral style={textActionStyles.text}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
