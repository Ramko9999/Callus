import { TextInput, useThemeColoring, View } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import { StyleUtils } from "@/util/styles";
import { Search } from "lucide-react-native";
import { useRef } from "react";
import {
  StyleSheet,
  TextInput as DefaultTextInput,
  TouchableOpacity,
  ViewStyle,
  useWindowDimensions,
} from "react-native";

// todo: figure out search bar height
export const SEARCH_BAR_HEIGHT = 45;

const searchBarStyles = StyleSheet.create({
  container: {
    marginTop: "3%",
    ...StyleUtils.flexRow(5),
    alignItems: "center",
    paddingHorizontal: "3%",
  },
  bar: {
    ...StyleUtils.flexRow(5),
    alignItems: "center",
    paddingHorizontal: "3%",
  },
});

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  style?: ViewStyle;
};

export function SearchBar({
  searchQuery,
  setSearchQuery,
  style,
}: SearchBarProps) {
  const { height } = useWindowDimensions();
  const inputRef = useRef<DefaultTextInput>(null);
  const lightText = useThemeColoring("lightText");

  return (
    <TouchableOpacity
      style={[searchBarStyles.container, style, { height: height * 0.04 }]}
      onPress={() => {
        inputRef.current?.focus();
      }}
    >
      <Search size={textTheme.neutral.fontSize} color={lightText} />
      <TextInput
        neutral
        value={searchQuery}
        placeholder="Search for an exercise"
        placeholderTextColor={lightText}
        onChangeText={setSearchQuery}
        ref={inputRef}
      />
    </TouchableOpacity>
  );
}
