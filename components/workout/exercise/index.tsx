import {
  View,
  TextInput,
  Text,
  Icon,
  useThemeColoring,
  Action,
} from "@/components/Themed";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useState } from "react";
import { ExerciseMeta } from "@/interface";

const styles = StyleSheet.create({
  exerciseFinder: {
    width: "80%",
    borderRadius: 20,
  },
  exerciseFinderSearch: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 5,
    padding: "2%",
  },
  exerciseFinderSearchTextInput: {
    width: "100%",
  },
  exerciseFinderSearchResults: {
    display: "flex",
    flexDirection: "column",
    paddingTop: "2%",
    gap: 5,
    height: "70%",
  },
  exerciseFinderSearchResult: {
    paddingTop: "2%",
    paddingBottom: "2%",
    borderStyle: "solid",
    borderBottomWidth: 1,
  },
  exerciseFinderActions: {
    display: "flex",
    flexDirection: "row",
  },
  exerciseFinderContent: {
    paddingLeft: "4%",
    paddingRight: "4%",
  },
});

type Props = {
  allExercises: ExerciseMeta[];
  onSelect: (_: ExerciseMeta) => void;
  onCancel: () => void;
};

export function ExerciseFinder({ allExercises, onSelect, onCancel }: Props) {
  const searchColorStyle = useThemeColoring("searchBackground");

  const [search, setSearch] = useState("");

  const results = allExercises.filter(({ name }) => {
    return search.trim() === "" || name.includes(search);
  });

  return (
    <TouchableWithoutFeedback
      onPress={(event) => {
        event.stopPropagation();
      }}
    >
      <View style={styles.exerciseFinder}>
        <View style={styles.exerciseFinderActions}>
          <Action
            _action={{ name: "Cancel", type: "neutral" }}
            onPress={onCancel}
          />
        </View>
        <View style={styles.exerciseFinderContent}>
          <View style={[styles.exerciseFinderSearch, searchColorStyle]}>
            <Icon name="search" color="darkgrey" size={14} />
            <TextInput
              _type="neutral"
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={"darkgrey"}
              placeholder="Search exercise"
              style={styles.exerciseFinderSearchTextInput}
            />
          </View>
          <ScrollView style={styles.exerciseFinderSearchResults}>
            {results.map((exerciseMeta, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onSelect(exerciseMeta)}
              >
                <View style={styles.exerciseFinderSearchResult}>
                  <Text _type="neutral">{exerciseMeta.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
