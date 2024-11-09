import { useThemeColoring, View } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import { StyleUtils } from "@/util/styles";
import { FontAwesome } from "@expo/vector-icons";
import { ViewStyle, StyleSheet, TouchableOpacity } from "react-native";

const iconStyles = StyleSheet.create({
  container: {
    height: 45,
    width: 45,
    borderRadius: 22,
    ...StyleUtils.flexRowCenterAll(),
  },
});

type IconActionProps = {
  onClick: () => void;
  style?: ViewStyle;
};

export function Trash({ onClick, style }: IconActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconStyles.container,
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

export function Edit({ onClick, style }: IconActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconStyles.container, style]}>
        <FontAwesome
          name="pencil"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Close({ onClick, style }: IconActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconStyles.container, style]}>
        <FontAwesome
          name="close"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Back({ onClick, style }: IconActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconStyles.container, style]}>
        <FontAwesome
          name="arrow-left"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Add() {
  return (
    <View style={{ ...iconStyles.container, borderWidth: 1 }}>
      <FontAwesome
        name="plus"
        size={textTheme.large.fontSize}
        color={useThemeColoring("lightText")}
      />
    </View>
  );
}
