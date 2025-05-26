import { StyleSheet, TouchableOpacity, Keyboard } from "react-native";
import { useThemeColoring, View } from "@/components/Themed";
import { TAB_BAR_HEIGHT } from "@/util/styles";
import { useCallback, useRef, useState } from "react";
import { ExerciseMeta, SearchExerciseSummary } from "@/interface";
import { WorkoutApi } from "@/api/workout";
import React from "react";
import { EXERCISE_REPOSITORY } from "@/api/exercise";
import { HeaderPage } from "@/components/util/header-page";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { FlatList } from "react-native-gesture-handler";
import {
  FilterActions,
  getResultsToDisplay,
  SearchExercise,
  SearchExerciseGrouping,
  ExerciseDisplayResult,
  SearchBar,
  SearchExerciseGroupNav,
  SEARCH_EXERCISE_HEIGHT,
} from "@/components/exercise/search/common";
import * as Haptics from "expo-haptics";
import { tintColor } from "@/util/color";
import { usePopup } from "@/components/popup";

type SearchExerciseWithSummaryProps = {
  meta: ExerciseMeta;
  summary?: SearchExerciseSummary;
  onClick: () => void;
};

function SearchExerciseWithSummary({
  meta,
  summary,
  onClick,
}: SearchExerciseWithSummaryProps) {
  const description = summary ? `- ${summary.totalSetsCompleted} sets` : "";

  return (
    <TouchableOpacity onPress={onClick}>
      <SearchExercise meta={meta} description={description} />
    </TouchableOpacity>
  );
}

const exercisesStyles = StyleSheet.create({
  scroll: {
    flex: 1,
    paddingHorizontal: "3%",
  },
  content: {
    paddingBottom: "10%",
  },
  groupNavigation: {
    position: "absolute",
    left: "97%",
    bottom: TAB_BAR_HEIGHT + 20,
  },
  search: {
    paddingHorizontal: "3%",
  },
});

export function Exercises() {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const { filterExercises } = usePopup();

  const [performedExerciseSummaries, setPerformedExerciseSummaries] = useState<
    SearchExerciseSummary[]
  >([]);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const barColor = tintColor(useThemeColoring("primaryViewBackground"), 0.05);

  useFocusEffect(
    useCallback(() => {
      WorkoutApi.getExerciseSummaries().then(setPerformedExerciseSummaries);
    }, [])
  );

  const results = getResultsToDisplay(
    searchQuery,
    EXERCISE_REPOSITORY,
    filterExercises.muscleFilters,
    filterExercises.exerciseTypeFilters
  );

  const groups = results
    .filter(({ resultType }) => resultType === "group")
    .map(({ group }) => group) as string[];

  const getSummary = (meta: ExerciseMeta) => {
    const summaryIndex = performedExerciseSummaries
      .map(({ name }) => name)
      .indexOf(meta.name);
    if (summaryIndex > -1) {
      return performedExerciseSummaries[summaryIndex];
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ExerciseDisplayResult }) =>
      item.resultType === "group" ? (
        <SearchExerciseGrouping group={item.group as string} />
      ) : (
        <SearchExerciseWithSummary
          meta={item.exercise as ExerciseMeta}
          summary={getSummary(item.exercise as ExerciseMeta)}
          onClick={() => {
            // @ts-ignore
            navigation.navigate("exerciseInsight", {
              name: (item.exercise as ExerciseMeta).name,
            });
          }}
        />
      ),
    [performedExerciseSummaries, navigation]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SEARCH_EXERCISE_HEIGHT,
      offset: SEARCH_EXERCISE_HEIGHT * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback(
    ({ resultType, exercise, group }: ExerciseDisplayResult) =>
      exercise ? `${resultType}-${exercise.name}` : `${resultType}-${group}`,
    []
  );

  const onShowFilters = useCallback(() => {
    Keyboard.dismiss();
    filterExercises.open();
  }, [filterExercises]);

  const hasFilters =
    filterExercises.muscleFilters.length > 0 ||
    filterExercises.exerciseTypeFilters.length > 0;

  return (
    <>
      <HeaderPage title="Exercises">
        <View style={exercisesStyles.search}>
          <SearchBar
            onChangeSearchQuery={setSearchQuery}
            style={{ backgroundColor: barColor }}
          />
        </View>
        <FilterActions
          hasFilters={hasFilters}
          muscleFilters={filterExercises.muscleFilters}
          exerciseTypeFilters={filterExercises.exerciseTypeFilters}
          onUpdateMuscleFilters={filterExercises.onUpdateMuscleFilters}
          onUpdateExerciseTypeFilters={
            filterExercises.onUpdateExerciseTypeFilters
          }
          onShowFilters={onShowFilters}
        />
        <FlatList
          ref={flatListRef}
          style={exercisesStyles.scroll}
          contentContainerStyle={exercisesStyles.content}
          showsVerticalScrollIndicator={false}
          data={results}
          getItemLayout={getItemLayout}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      </HeaderPage>

      <View style={exercisesStyles.groupNavigation}>
        <SearchExerciseGroupNav
          enabledGroups={groups}
          onClick={(selectedGroup) => {
            const scrollIndex = results
              .map(({ resultType, group }) =>
                resultType === "group" ? group : ""
              )
              .indexOf(selectedGroup);
            flatListRef.current?.scrollToIndex({
              animated: true,
              index: scrollIndex,
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        />
      </View>
    </>
  );
}
