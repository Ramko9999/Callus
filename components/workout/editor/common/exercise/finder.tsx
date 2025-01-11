import { BottomSheet } from "@/components/util/popup/sheet";
import { useThemeColoring } from "@/components/Themed";
import { ExerciseMeta } from "@/interface";
import { StyleUtils, WORKOUT_PLAYER_EDITOR_HEIGHT } from "@/util/styles";
import { useState, useRef, useCallback } from "react";
import {
  useWindowDimensions,
  TouchableOpacity,
  TextInput as DefaultTextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import { View, TextInput, Text } from "@/components/Themed";
import { Back, Search } from "@/components/theme/actions";


// todo: replace this with a the same set set of components used in the exercises screen
const finderExerciseStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingVertical: "3%",
  },
  tags: {
    ...StyleUtils.flexRow(5),
    flexWrap: "wrap",
  },
  tag: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: "2%",
    paddingVertical: "1%",
  },
});

type FinderExerciseProps = {
  meta: ExerciseMeta;
  onClick: () => void;
};

export function FinderExercise({ meta, onClick }: FinderExerciseProps) {
  const { name } = meta;

  return (
    <TouchableOpacity onPress={onClick}>
      <View style={finderExerciseStyles.container}>
        <Text large>{name}</Text>
      </View>
    </TouchableOpacity>
  );
}

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

// todo: make this a flat list
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
