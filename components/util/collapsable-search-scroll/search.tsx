import { TextInput, useThemeColoring, View } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import { StyleUtils } from "@/util/styles";
import { Search } from "lucide-react-native";
import { useRef } from "react";
import {
  StyleSheet,
  TextInput as DefaultTextInput,
  TouchableOpacity,
} from "react-native";

export const SEARCH_BAR_HEIGHT = 35;

const searchBarStyles = StyleSheet.create({
  container: {
    marginTop: "3%",
    height: SEARCH_BAR_HEIGHT,
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
};

export function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  const inputRef = useRef<DefaultTextInput>(null);
  const lightText = useThemeColoring("lightText");

  return (
    <TouchableOpacity
      style={searchBarStyles.container}
      onPress={() => {
        inputRef.current?.focus();
      }}
    >
      <View background style={searchBarStyles.bar}>
        <Search size={textTheme.neutral.fontSize} color={lightText} />
        <TextInput
          neutral
          value={searchQuery}
          placeholder="Search for an exercise"
          placeholderTextColor={lightText}
          onChangeText={setSearchQuery}
          ref={inputRef}
        />
      </View>
    </TouchableOpacity>
  );
}
