import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from "react-native";
import { useThemeColoring, View } from "@/components/Themed";
import { TAB_BAR_HEIGHT } from "@/util/styles";
import { useCallback, useRef, useState } from "react";
import { ExerciseMeta, SearchExerciseSummary } from "@/interface";
import { WorkoutApi } from "@/api/workout";
import React from "react";
import { EXERCISE_REPOSITORY } from "@/api/exercise";
import { HeaderPage } from "@/components/util/header-page";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  FilterActions,
  getResultsToDisplay,
  SearchExercise,
  SearchExerciseGrouping,
  ExerciseDisplayResult,
  SearchBar,
  SearchExerciseGroupNav,
  SEARCH_EXERCISE_HEIGHT,
  ExerciseGridItem,
} from "@/components/exercise/search/common";
import * as Haptics from "expo-haptics";
import { tintColor } from "@/util/color";
import { usePopup } from "@/components/popup";
import { LayoutGrid, List } from "lucide-react-native";

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
  search: {
    paddingHorizontal: "3%",
  },
});

const verticalViewStyles = StyleSheet.create({
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
});

type VerticalViewProps = {
  results: ExerciseDisplayResult[];
  performedExerciseSummaries: SearchExerciseSummary[];
  onExercisePress: (exercise: ExerciseMeta) => void;
};

function VerticalView({
  results,
  performedExerciseSummaries,
  onExercisePress,
}: VerticalViewProps) {
  const flatListRef = useRef<FlatList>(null);

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
          onClick={() => onExercisePress(item.exercise as ExerciseMeta)}
        />
      ),
    [performedExerciseSummaries, onExercisePress]
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

  const groups = results
    .filter(({ resultType }) => resultType === "group")
    .map(({ group }) => group) as string[];

  return (
    <>
      <FlatList
        ref={flatListRef}
        style={verticalViewStyles.scroll}
        contentContainerStyle={verticalViewStyles.content}
        showsVerticalScrollIndicator={false}
        data={results}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
      <View style={verticalViewStyles.groupNavigation}>
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

const gridViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: "3%",
  },
  content: {
    paddingBottom: "10%",
  },
  item: {
    margin: 3,
    overflow: "hidden",
    borderRadius: 4,
  },
});

type GridItemProps = {
  exercise: ExerciseMeta;
  halfFlex: boolean;
  summary: string;
  onPress: (exerciseMeta: ExerciseMeta) => void;
};

const GridItem = React.memo(
  function GridItem({ exercise, halfFlex, summary, onPress }: GridItemProps){
    return (
      <TouchableOpacity
        style={[gridViewStyles.item, { flex: halfFlex ? 0.5 : 1 }]}
        onPress={() => onPress(exercise)}
      >
        <ExerciseGridItem
          exercise={exercise}
          summary={summary}
        />
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.exercise) === JSON.stringify(nextProps.exercise) &&
      prevProps.halfFlex === nextProps.halfFlex &&
      prevProps.summary === nextProps.summary &&
      prevProps.onPress === nextProps.onPress
    );
  }
);

type GridViewProps = {
  results: ExerciseDisplayResult[];
  performedExerciseSummaries: SearchExerciseSummary[];
  onExercisePress: (exercise: ExerciseMeta) => void;
};

function GridView({
  results,
  performedExerciseSummaries,
  onExercisePress,
}: GridViewProps) {
  const exercises = results.filter(
    (result) => result.resultType === "exercise"
  ) as { resultType: "exercise"; exercise: ExerciseMeta }[];

  const getSummary = useCallback(
    (meta: ExerciseMeta) => {
      const summaryIndex = performedExerciseSummaries
        .map(({ name }) => name)
        .indexOf(meta.name);
      if (summaryIndex > -1) {
        return `${performedExerciseSummaries[summaryIndex].totalSetsCompleted} sets`;
      }
      return "No sets completed";
    },
    [performedExerciseSummaries]
  );

  const renderGridItem = useCallback(
    ({ item, index }: { item: { resultType: "exercise"; exercise: ExerciseMeta }; index: number }) => {
      const shouldHaveHalfFlex = index === exercises.length - 1 && exercises.length % 2 === 1;
      return (
        <GridItem
          exercise={item.exercise}
          halfFlex={shouldHaveHalfFlex}
          summary={getSummary(item.exercise)}
          onPress={onExercisePress}
        />
      );
    },
    [exercises.length, getSummary, onExercisePress]
  );

  return (
    <FlatList
      style={gridViewStyles.container}
      contentContainerStyle={gridViewStyles.content}
      windowSize={100}
      removeClippedSubviews={false}
      data={exercises}
      renderItem={renderGridItem}
      keyExtractor={(item) => item.exercise.name}
      numColumns={2}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function Exercises() {
  const navigation = useNavigation();
  const { filterExercises } = usePopup();
  const [isGridView, setIsGridView] = useState(true);

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

  const onShowFilters = useCallback(() => {
    Keyboard.dismiss();
    filterExercises.open();
  }, [filterExercises]);

  const handleExercisePress = useCallback(
    (exercise: ExerciseMeta) => {
      // @ts-ignore
      navigation.navigate("exerciseInsight", {
        name: exercise.name,
      });
    },
    [navigation]
  );

  const toggleView = useCallback(() => {
    setIsGridView((prev) => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const hasFilters =
    filterExercises.muscleFilters.length > 0 ||
    filterExercises.exerciseTypeFilters.length > 0;

  return (
    <HeaderPage
      title="Exercises"
      rightAction={
        <TouchableOpacity onPress={toggleView}>
          {isGridView ? (
            <List size={24} color={useThemeColoring("primaryAction")} />
          ) : (
            <LayoutGrid size={24} color={useThemeColoring("primaryAction")} />
          )}
        </TouchableOpacity>
      }
    >
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
      {isGridView ? (
        <GridView
          results={results}
          performedExerciseSummaries={performedExerciseSummaries}
          onExercisePress={handleExercisePress}
        />
      ) : (
        <VerticalView
          results={results}
          performedExerciseSummaries={performedExerciseSummaries}
          onExercisePress={handleExercisePress}
        />
      )}
    </HeaderPage>
  );
}
