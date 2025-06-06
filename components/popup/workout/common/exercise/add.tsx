import { EXERCISE_REPOSITORY, getMeta } from "@/api/exercise";
import { SignificantAction } from "@/components/theme/actions";
import { View, useThemeColoring } from "@/components/Themed";
import { ExerciseMeta } from "@/interface";
import { StyleUtils } from "@/util/styles";
import React, { useCallback, useEffect } from "react";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { FlatList } from "react-native-gesture-handler";
import {
  FilterActions,
  getResultsToDisplay,
  SearchExerciseGrouping,
  ExerciseDisplayResult,
  SEARCH_EXERCISE_HEIGHT,
  SearchExercise,
  SearchExerciseGroupNav,
  SearchBar,
  ExerciseGridItem,
} from "@/components/exercise/search/common";

// Constants
const SEARCH_EXERCISE_SELECTED_INDICATOR_WIDTH = 5;

// SelectableSearchExercise Component
const selectableSearchExercise = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(5),
    height: SEARCH_EXERCISE_HEIGHT,
    alignItems: "center",
  },
  selected: {
    width: SEARCH_EXERCISE_SELECTED_INDICATOR_WIDTH,
    height: SEARCH_EXERCISE_HEIGHT - 15,
    borderRadius: 10,
  },
});

type SelectableSearchExerciseProps = {
  name: string;
  isSelected: boolean;
  onToggle: (exerciseMeta: ExerciseMeta) => void;
};

const SelectableSearchExercise = React.memo(
  ({ name, isSelected, onToggle }: SelectableSearchExerciseProps) => {
    const meta = getMeta(name);
    const translation = useSharedValue(
      -SEARCH_EXERCISE_SELECTED_INDICATOR_WIDTH - 5
    );

    useEffect(() => {
      if (isSelected) {
        translation.value = withTiming(0, { duration: 100 });
      } else {
        translation.value = withTiming(
          -SEARCH_EXERCISE_SELECTED_INDICATOR_WIDTH - 5,
          { duration: 100 }
        );
      }
    }, [isSelected]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translation.value }],
    }));

    const selectionAnimatedStyle = useAnimatedStyle(() => ({
      opacity: isSelected ? 1 : 0,
    }));

    return (
      <TouchableOpacity onPress={() => onToggle(meta)}>
        <Animated.View
          style={[animatedStyle, selectableSearchExercise.container]}
        >
          <Animated.View
            style={[
              selectableSearchExercise.selected,
              selectionAnimatedStyle,
              { backgroundColor: useThemeColoring("primaryAction") },
            ]}
          />
          <SearchExercise meta={meta} />
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

const selectableExerciseGridItemStyles = StyleSheet.create({
  container: {
    position: "relative",
    margin: 3,
    borderRadius: 5,
    overflow: "hidden",
  },
  selectionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    zIndex: 1,
  },
});

type SelectableExerciseGridItemProps = {
  exercise: ExerciseMeta;
  index: number;
  totalCount: number;
  summary: string;
  isSelected: boolean;
  onToggle: (exercise: ExerciseMeta) => void;
};

function SelectableExerciseGridItem({
  exercise,
  index,
  totalCount,
  summary,
  isSelected,
  onToggle,
}: SelectableExerciseGridItemProps) {
  const selectionProgress = useSharedValue(isSelected ? 1 : 0);
  const primaryAction = useThemeColoring("primaryAction");
  const shouldHaveHalfFlex = index === totalCount - 1 && totalCount % 2 === 1;

  useEffect(() => {
    selectionProgress.value = withTiming(isSelected ? 1 : 0, { duration: 150 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: selectionProgress.value * 0.2,
    backgroundColor: primaryAction,
    borderColor: interpolateColor(
      selectionProgress.value,
      [0, 1],
      ["transparent", primaryAction]
    ),
  }));

  return (
    <TouchableOpacity
      style={[
        selectableExerciseGridItemStyles.container,
        { flex: shouldHaveHalfFlex ? 0.5 : 1 },
      ]}
      onPress={() => onToggle(exercise)}
    >
      <Animated.View
        style={[
          selectableExerciseGridItemStyles.selectionOverlay,
          animatedStyle,
        ]}
      />
      <ExerciseGridItem exercise={exercise} summary={summary} />
    </TouchableOpacity>
  );
}

const verticalViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: "3%",
  },
  content: {
    paddingBottom: "10%",
  },
  groupNavigation: {
    position: "absolute",
    left: "95%",
    bottom: "10%",
  },
});

type VerticalViewProps = {
  results: ExerciseDisplayResult[];
  exercisesToAdd: ExerciseMeta[];
  onToggle: (exercise: ExerciseMeta) => void;
};

function VerticalView({
  results,
  exercisesToAdd,
  onToggle,
}: VerticalViewProps) {
  const flatListRef = useRef<FlatList>(null);

  const groups = results
    .filter(({ resultType }) => resultType === "group")
    .map(({ group }) => group) as string[];

  const renderItem = useCallback(
    ({ item }: { item: ExerciseDisplayResult }) =>
      item.resultType === "group" ? (
        <SearchExerciseGrouping group={item.group as string} />
      ) : (
        <SelectableSearchExercise
          name={(item.exercise as ExerciseMeta).name}
          isSelected={
            exercisesToAdd
              .map(({ name }) => name)
              .indexOf((item.exercise as ExerciseMeta).name) > -1
          }
          onToggle={onToggle}
        />
      ),
    [exercisesToAdd, onToggle]
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

  return (
    <>
      <FlatList
        ref={flatListRef}
        style={verticalViewStyles.container}
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
});

type GridViewProps = {
  exercises: { resultType: "exercise"; exercise: ExerciseMeta }[];
  exercisesToAdd: ExerciseMeta[];
  onToggle: (exercise: ExerciseMeta) => void;
};

function GridView({ exercises, exercisesToAdd, onToggle }: GridViewProps) {
  const renderGridItem = useCallback(
    ({
      item,
      index,
    }: {
      item: { resultType: "exercise"; exercise: ExerciseMeta };
      index: number;
    }) => (
      <SelectableExerciseGridItem
        exercise={item.exercise}
        index={index}
        totalCount={exercises.length}
        summary={`${
          exercisesToAdd.map(({ name }) => name).indexOf(item.exercise.name) >
          -1
            ? "Selected"
            : "Tap to select"
        }`}
        isSelected={
          exercisesToAdd.map(({ name }) => name).indexOf(item.exercise.name) >
          -1
        }
        onToggle={onToggle}
      />
    ),
    [exercises.length, exercisesToAdd, onToggle]
  );

  return (
    <FlatList
      style={gridViewStyles.container}
      contentContainerStyle={gridViewStyles.content}
      data={exercises}
      renderItem={renderGridItem}
      keyExtractor={(item) => item.exercise.name}
      numColumns={2}
      showsVerticalScrollIndicator={false}
    />
  );
}

const exerciseAdderStyles = StyleSheet.create({
  search: {
    paddingHorizontal: "3%",
    paddingBottom: "1%",
  },
  action: {
    width: "100%",
    paddingVertical: "3%",
  },
  actionContainer: {
    position: "absolute",
    width: "80%",
    left: "10%",
  },
});

type ExerciseAdderProps = {
  muscleFilters: string[];
  exerciseTypeFilters: string[];
  onClose: () => void;
  onAdd: (exercises: ExerciseMeta[]) => void;
  onUpdateMuscleFilters: (filters: string[]) => void;
  onUpdateExerciseTypeFilters: (filters: string[]) => void;
  onShowFilters: () => void;
  isGridView: boolean;
};

export function ExerciseAdder({
  onClose,
  onAdd,
  muscleFilters,
  exerciseTypeFilters,
  onUpdateMuscleFilters,
  onUpdateExerciseTypeFilters,
  onShowFilters,
  isGridView,
}: ExerciseAdderProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [exercisesToAdd, setExercisesToAdd] = useState<ExerciseMeta[]>([]);

  const hasFilters = muscleFilters.length > 0 || exerciseTypeFilters.length > 0;

  const results = getResultsToDisplay(
    searchQuery,
    EXERCISE_REPOSITORY,
    muscleFilters,
    exerciseTypeFilters
  );

  const exercises = results.filter(
    (result) => result.resultType === "exercise"
  ) as { resultType: "exercise"; exercise: ExerciseMeta }[];

  const onToggle = useCallback((meta: ExerciseMeta) => {
    setExercisesToAdd((exerciseMetas) => {
      if (exerciseMetas.map(({ name }) => name).indexOf(meta.name) > -1) {
        return exerciseMetas.filter(({ name }) => name !== meta.name);
      } else {
        return [{ ...meta }, ...exerciseMetas];
      }
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <>
      <View style={exerciseAdderStyles.search}>
        <View style={StyleUtils.flexRow(10)}>
          <SearchBar
            onChangeSearchQuery={setSearchQuery}
            style={{
              backgroundColor: useThemeColoring("calendarDayBackground"),
              flex: 1,
            }}
          />
        </View>
      </View>
      <FilterActions
        hasFilters={hasFilters}
        muscleFilters={muscleFilters}
        exerciseTypeFilters={exerciseTypeFilters}
        onUpdateMuscleFilters={onUpdateMuscleFilters}
        onUpdateExerciseTypeFilters={onUpdateExerciseTypeFilters}
        onShowFilters={onShowFilters}
      />
      {isGridView ? (
        <GridView
          exercises={exercises}
          exercisesToAdd={exercisesToAdd}
          onToggle={onToggle}
        />
      ) : (
        <VerticalView
          results={results}
          exercisesToAdd={exercisesToAdd}
          onToggle={onToggle}
        />
      )}
      {exercisesToAdd.length > 0 && (
        <View
          style={[
            exerciseAdderStyles.actionContainer,
            { bottom: insets.bottom },
          ]}
        >
          <SignificantAction
            onClick={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              onAdd(exercisesToAdd);
              onClose();
            }}
            style={exerciseAdderStyles.action}
            text={
              exercisesToAdd.length === 1
                ? "Add 1 exercise"
                : `Add ${exercisesToAdd.length} exercises`
            }
          />
        </View>
      )}
    </>
  );
}
