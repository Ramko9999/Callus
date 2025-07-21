import { SignificantAction } from "@/components/theme/actions";
import { View, useThemeColoring } from "@/components/Themed";
import { ExerciseMeta } from "@/interface";
import { StyleUtils } from "@/util/styles";
import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeInDown,
  FadeOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { FlatList } from "react-native-gesture-handler";
import {
  FilterActions,
  SearchBar,
  ExerciseGridItem,
} from "@/components/exercise/search/common";
import { useExercisesStore } from "@/components/store";
import { queryExercises } from "@/api/exercise";

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
  halfFlex: boolean;
  isSelected: boolean;
  onToggle: (exercise: ExerciseMeta) => void;
};

const SelectableExerciseGridItem = React.memo(
  function SelectableExerciseGridItem({
    exercise,
    halfFlex,
    isSelected,
    onToggle,
  }: SelectableExerciseGridItemProps) {
    const selectionProgress = useSharedValue(isSelected ? 1 : 0);
    const primaryAction = useThemeColoring("primaryAction");

    useEffect(() => {
      selectionProgress.value = withTiming(isSelected ? 1 : 0, {
        duration: 150,
      });
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
          { flex: halfFlex ? 0.5 : 1 },
        ]}
        onPress={() => onToggle(exercise)}
      >
        <Animated.View
          style={[
            selectableExerciseGridItemStyles.selectionOverlay,
            animatedStyle,
          ]}
        />
        <ExerciseGridItem
          exercise={exercise}
          summary={isSelected ? "Selected" : "Tap to select"}
        />
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.exercise) ===
        JSON.stringify(nextProps.exercise) &&
      prevProps.halfFlex === nextProps.halfFlex &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.onToggle === nextProps.onToggle
    );
  }
);

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
  exercises: ExerciseMeta[];
  exercisesToAdd: ExerciseMeta[];
  onToggle: (exercise: ExerciseMeta) => void;
};

function GridView({ exercises, exercisesToAdd, onToggle }: GridViewProps) {
  const renderGridItem = useCallback(
    ({ item, index }: { item: ExerciseMeta; index: number }) => {
      const shouldHaveHalfFlex =
        index === exercises.length - 1 && exercises.length % 2 === 1;
      const isSelected =
        exercisesToAdd.map(({ name }) => name).indexOf(item.name) > -1;

      return (
        <SelectableExerciseGridItem
          exercise={item}
          halfFlex={shouldHaveHalfFlex}
          isSelected={isSelected}
          onToggle={onToggle}
        />
      );
    },
    [exercises.length, exercisesToAdd, onToggle]
  );

  return (
    <FlatList
      style={gridViewStyles.container}
      contentContainerStyle={gridViewStyles.content}
      data={exercises}
      renderItem={renderGridItem}
      keyExtractor={(item) => item.metaId}
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
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [exercisesToAdd, setExercisesToAdd] = useState<ExerciseMeta[]>([]);
  const allExercises = useExercisesStore((state) => state.exercises);

  const hasFilters = muscleFilters.length > 0 || exerciseTypeFilters.length > 0;

  const exercises = queryExercises(
    searchQuery,
    allExercises,
    muscleFilters,
    exerciseTypeFilters
  );

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
      <GridView
        exercises={exercises}
        exercisesToAdd={exercisesToAdd}
        onToggle={onToggle}
      />

      {exercisesToAdd.length > 0 && (
        <Animated.View
          key="action-button"
          style={[
            exerciseAdderStyles.actionContainer,
            { bottom: insets.bottom },
          ]}
          entering={FadeInDown.springify().damping(15).stiffness(150)}
          exiting={FadeOutDown.springify().damping(15).stiffness(150)}
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
        </Animated.View>
      )}
    </>
  );
}
