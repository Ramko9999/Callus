import { BottomSheet } from "@/components/bottom-sheet";
import { useThemeColoring } from "@/components/Themed";
import { ExerciseMeta } from "@/interface";
import { StyleUtils, WORKOUT_PLAYER_EDITOR_HEIGHT } from "@/util/styles";
import { useState, useRef, useCallback } from "react";
import { useWindowDimensions, TouchableOpacity, TextInput as DefaultTextInput, ScrollView, StyleSheet } from "react-native";
import {View, TextInput} from "@/components/Themed";
import { FinderExercise } from "../../core";
import { Back, Search } from "../../core/actions";

const exerciseFinderStyle = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
  },
  actions: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  content: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "3%",
  },
  input: {
    ...StyleUtils.flexRow(5),
    borderWidth: 1,
    borderRadius: 25,
    alignSelf: "center",
    width: "90%",
  },
  scroll: {
    paddingBottom: "5%",
  },
  results: {
    ...StyleUtils.flexColumn(5),
  },
});

type ExerciseFinderProps = {
  repository: ExerciseMeta[];
  show: boolean;
  hide: () => void;
  onSelect: (exerciseMeta: ExerciseMeta) => void;
};

export function ExerciseFinder({
  show,
  repository,
  hide,
  onSelect,
}: ExerciseFinderProps) {
  const [search, setSearch] = useState("");
  const searchRef = useRef<DefaultTextInput>(null);
  const { height } = useWindowDimensions();

  const onClickSearch = useCallback(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  return (
    <BottomSheet show={show} onBackdropPress={hide} hide={hide}>
      <View background style={exerciseFinderStyle.container}>
        <View style={exerciseFinderStyle.actions}>
          <Back onClick={hide} />
        </View>
        <View
          style={[
            exerciseFinderStyle.content,
            { height: height * WORKOUT_PLAYER_EDITOR_HEIGHT },
          ]}
        >
          <TouchableOpacity onPress={onClickSearch}>
            <View
              style={[
                exerciseFinderStyle.input,
                { borderColor: useThemeColoring("lightText") },
              ]}
            >
              <Search />
              <TextInput
                ref={searchRef}
                action
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={useThemeColoring("lightText")}
                placeholder="Search exercise"
              />
            </View>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={exerciseFinderStyle.scroll}>
            <View style={exerciseFinderStyle.results}>
              {repository
                .filter((meta) => meta.name.includes(search))
                .map((meta, index) => (
                  <FinderExercise
                    key={index}
                    meta={meta}
                    onClick={() => onSelect(meta)}
                  />
                ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </BottomSheet>
  );
}
