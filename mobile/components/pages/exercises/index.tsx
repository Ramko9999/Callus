import { StyleSheet, TouchableOpacity, FlatList, Keyboard } from "react-native";
import { useThemeColoring, View } from "@/components/Themed";
import { useCallback, useRef, useState } from "react";
import { ExerciseMeta, SearchExerciseSummary } from "@/interface";
import { WorkoutApi } from "@/api/workout";
import React from "react";
import { HeaderPage } from "@/components/util/header-page";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  FilterActions,
  SearchBar,
  ExerciseGridItem,
} from "@/components/exercise/search/common";
import { tintColor } from "@/util/color";
import { LiveWorkoutPreview } from "@/components/workout/preview";
import { PlusButton } from "@/components/pages/common";
import { useExercisesStore } from "@/components/store";
import { queryExercises } from "@/api/exercise";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FilterExercisesSheet } from "@/components/sheets";

const exercisesStyles = StyleSheet.create({
  search: {
    paddingHorizontal: "3%",
  },
});

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
  function GridItem({ exercise, halfFlex, summary, onPress }: GridItemProps) {
    return (
      <TouchableOpacity
        style={[gridViewStyles.item, { flex: halfFlex ? 0.5 : 1 }]}
        onPress={() => onPress(exercise)}
      >
        <ExerciseGridItem exercise={exercise} summary={summary} />
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.exercise) ===
        JSON.stringify(nextProps.exercise) &&
      prevProps.halfFlex === nextProps.halfFlex &&
      prevProps.summary === nextProps.summary &&
      prevProps.onPress === nextProps.onPress
    );
  }
);

type GridViewProps = {
  exercises: ExerciseMeta[];
  performedExerciseSummaries: SearchExerciseSummary[];
  onExercisePress: (exercise: ExerciseMeta) => void;
};

function GridView({
  exercises,
  performedExerciseSummaries,
  onExercisePress,
}: GridViewProps) {
  const getSummary = useCallback(
    (meta: ExerciseMeta) => {
      const summaryIndex = performedExerciseSummaries
        .map(({ metaId }) => metaId)
        .indexOf(meta.metaId);
      if (summaryIndex > -1) {
        return `${performedExerciseSummaries[summaryIndex].totalSetsCompleted} sets`;
      }
      return "No sets completed";
    },
    [performedExerciseSummaries]
  );

  const renderGridItem = useCallback(
    ({ item, index }: { item: ExerciseMeta; index: number }) => {
      const shouldHaveHalfFlex =
        index === exercises.length - 1 && exercises.length % 2 === 1;
      return (
        <GridItem
          exercise={item}
          halfFlex={shouldHaveHalfFlex}
          summary={getSummary(item)}
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
      keyExtractor={(item) => item.metaId}
      numColumns={2}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function Exercises() {
  const navigation = useNavigation();
  const filterExercisesSheetRef = useRef<BottomSheetModal>(null);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [exerciseTypeFilters, setExerciseTypeFilters] = useState<string[]>([]);

  const exercises = useExercisesStore((state) => state.exercises);

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

  const filteredExercises = queryExercises(
    searchQuery,
    exercises,
    muscleFilters,
    exerciseTypeFilters
  );

  const onShowFilters = useCallback(() => {
    Keyboard.dismiss();
    filterExercisesSheetRef.current?.present();
  }, []);

  const handleExercisePress = useCallback(
    (exercise: ExerciseMeta) => {
      // @ts-ignore
      navigation.navigate("exerciseInsightSheet", {
        id: exercise.metaId,
      });
    },
    [navigation]
  );

  const handleCreateExercise = useCallback(() => {
    // @ts-ignore
    navigation.navigate("createExerciseSheet");
  }, [navigation]);

  const hasFilters = muscleFilters.length > 0 || exerciseTypeFilters.length > 0;

  return (
    <>
      <HeaderPage
        title="Exercises"
        rightAction={<PlusButton onClick={handleCreateExercise} />}
      >
        <View style={exercisesStyles.search}>
          <SearchBar
            onChangeSearchQuery={setSearchQuery}
            style={{ backgroundColor: barColor }}
          />
        </View>
        <FilterActions
          hasFilters={hasFilters}
          muscleFilters={muscleFilters}
          exerciseTypeFilters={exerciseTypeFilters}
          onUpdateMuscleFilters={setMuscleFilters}
          onUpdateExerciseTypeFilters={setExerciseTypeFilters}
          onShowFilters={onShowFilters}
        />
        <GridView
          exercises={filteredExercises}
          performedExerciseSummaries={performedExerciseSummaries}
          onExercisePress={handleExercisePress}
        />
        <FilterExercisesSheet
          ref={filterExercisesSheetRef}
          muscleFilters={muscleFilters}
          exerciseTypeFilters={exerciseTypeFilters}
          onUpdateMuscleFilters={setMuscleFilters}
          onUpdateExerciseTypeFilters={setExerciseTypeFilters}
        />
      </HeaderPage>
      <LiveWorkoutPreview />
    </>
  );
}
