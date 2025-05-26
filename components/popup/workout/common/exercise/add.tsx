import { EXERCISE_REPOSITORY, getMeta } from "@/api/exercise";
import { SignificantAction } from "@/components/theme/actions";
import { View, useThemeColoring } from "@/components/Themed";
import { ExerciseMeta } from "@/interface";
import { StyleUtils } from "@/util/styles";
import React, { useCallback, useEffect } from "react";
import { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
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

const exerciseAdderStyles = StyleSheet.create({
  scroll: {
    flex: 1,
    paddingHorizontal: "3%",
  },
  content: {
    paddingBottom: "10%",
  },
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
  groupNavigation: {
    position: "absolute",
    left: "97%",
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
};

export function ExerciseAdder({
  onClose,
  onAdd,
  muscleFilters,
  exerciseTypeFilters,
  onUpdateMuscleFilters,
  onUpdateExerciseTypeFilters,
  onShowFilters,
}: ExerciseAdderProps) {
  const flatListRef = useRef<FlatList>(null);
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

  const groups = results
    .filter(({ resultType }) => resultType === "group")
    .map(({ group }) => group) as string[];

  const onToggle = useCallback((meta: ExerciseMeta) => {
    setExercisesToAdd((exerciseMetas) => {
      if (exerciseMetas.map(({ name }) => name).indexOf(meta.name) > -1) {
        return exerciseMetas.filter(({ name }) => name !== meta.name);
      } else {
        return [{ ...meta }, ...exerciseMetas];
      }
    });
  }, []);

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
      <View style={exerciseAdderStyles.search}>
        <SearchBar
          onChangeSearchQuery={setSearchQuery}
          style={{
            backgroundColor: useThemeColoring("calendarDayBackground"),
          }}
        />
      </View>
      <FilterActions
        hasFilters={hasFilters}
        muscleFilters={muscleFilters}
        exerciseTypeFilters={exerciseTypeFilters}
        onUpdateMuscleFilters={onUpdateMuscleFilters}
        onUpdateExerciseTypeFilters={onUpdateExerciseTypeFilters}
        onShowFilters={onShowFilters}
      />
      <FlatList
        ref={flatListRef}
        style={exerciseAdderStyles.scroll}
        contentContainerStyle={exerciseAdderStyles.content}
        showsVerticalScrollIndicator={false}
        data={results}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
      <View
        style={[
          exerciseAdderStyles.groupNavigation,
          { bottom: insets.bottom + 10 },
        ]}
      >
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
