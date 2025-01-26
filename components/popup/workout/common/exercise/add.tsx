import { EXERCISE_REPOSITORY } from "@/api/exercise";
import {
  computeOffsetToScrollTo,
  filterExerciseResultGroups,
  SEARCH_EXERCISE_HEIGHT,
  SearchExercise,
  SearchExerciseFilterAction,
  SearchExerciseGroup,
  SearchExerciseGroupNav,
} from "@/components/pages/exercises/search";
import { ModalProps } from "@/components/popup/common";
import { ExercisesFilter } from "@/components/popup/exercises/filters";
import { Back, SignificantAction } from "@/components/theme/actions";
import { View, useThemeColoring } from "@/components/Themed";
import { CollapsableSearchScroll } from "@/components/util/collapsable-search-scroll";
import { ExerciseMeta } from "@/interface";
import { StyleUtils } from "@/util/styles";
import React, { useEffect } from "react";
import { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

export type ExerciseSearcherFiltersState = {
  muscleFilter?: string;
  exerciseTypeFilter?: string;
  showFilters: boolean;
};

const SEARCH_EXERCISE_SELECTED_INDICATOR_WIDTH = 5;

const topActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    paddingRight: "3%",
  },
});

type ExerciseSearcherTopActionsProps = {
  hasFilters: boolean;
  onEditFilters: () => void;
  onClose: () => void;
};

function ExerciseSearcherTopActions({
  hasFilters,
  onEditFilters,
  onClose,
}: ExerciseSearcherTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Back onClick={onClose} />
      <View style={topActionsStyles.rightActions}>
        <SearchExerciseFilterAction
          hasFilters={hasFilters}
          onClick={onEditFilters}
        />
      </View>
    </View>
  );
}

const selectableSearchExercise = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(5),
    height: SEARCH_EXERCISE_HEIGHT,
    alignItems: "center",
  },
  selected: {
    height: SEARCH_EXERCISE_HEIGHT - 15,
    borderRadius: 10,
  },
});

type SelectableSearchExerciseProps = {
  meta: ExerciseMeta;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
};

function SelectableSearchExercise({
  meta,
  isSelected,
  onSelect,
  onDeselect,
}: SelectableSearchExerciseProps) {
  const selectability = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      selectability.value = withTiming(1, { duration: 100 });
    } else {
      selectability.value = withTiming(0, { duration: 100 });
    }
  }, [isSelected]);

  const selectionIndicatorAnimatedStyle = useAnimatedStyle(() => ({
    width: selectability.value * SEARCH_EXERCISE_SELECTED_INDICATOR_WIDTH,
    display: selectability.value === 0 ? "none" : "flex",
  }));

  return (
    <TouchableOpacity
      style={selectableSearchExercise.container}
      onPress={() => {
        if (isSelected) {
          onDeselect();
        } else {
          onSelect();
        }
      }}
    >
      <Animated.View
        style={[
          selectableSearchExercise.selected,
          selectionIndicatorAnimatedStyle,
          { backgroundColor: useThemeColoring("primaryAction") },
        ]}
      />
      <SearchExercise meta={meta} />
    </TouchableOpacity>
  );
}

type ExerciseSearcherContentProps = {
  muscleFilter?: string;
  exerciseTypeFilter?: string;
  onClose: () => void;
  onEditFilters: () => void;
  onAdd: (exercises: ExerciseMeta[]) => void;
};

const exerciseSearcherContentStyles = StyleSheet.create({
  content: {
    ...StyleUtils.flexColumn(5),
  },
  scroll: {
    paddingHorizontal: "3%",
    flex: 1,
  },
  groupNavigation: {
    position: "absolute",
    left: "97%",
  },
  action: {
    position: "absolute",
    width: "80%",
    left: "10%",
  },
});

export function ExerciseSearcherContent({
  onClose,
  onEditFilters,
  onAdd,
  muscleFilter,
  exerciseTypeFilter,
}: ExerciseSearcherContentProps) {
  const insets = useSafeAreaInsets();

  const scrollRef = useRef<Animated.ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [exercisesToAdd, setExercisesToAdd] = useState<ExerciseMeta[]>([]);

  const exerciseResultGroups = filterExerciseResultGroups(
    searchQuery,
    EXERCISE_REPOSITORY,
    muscleFilter,
    exerciseTypeFilter
  );

  const isExerciseMetaSelected = (meta: ExerciseMeta) => {
    return exercisesToAdd.map(({ name }) => name).indexOf(meta.name) > -1;
  };

  return (
    <>
      <ExerciseSearcherTopActions
        hasFilters={
          muscleFilter != undefined || exerciseTypeFilter != undefined
        }
        onEditFilters={onEditFilters}
        onClose={onClose}
      />
      <CollapsableSearchScroll
        scrollRef={scrollRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        scrollStyle={exerciseSearcherContentStyles.scroll}
        contentStyle={exerciseSearcherContentStyles.content}
      >
        {exerciseResultGroups.map((group, index) => (
          <SearchExerciseGroup
            key={index}
            grouping={group}
            renderExercise={(meta, index) => (
              <SelectableSearchExercise
                key={index}
                meta={meta}
                isSelected={isExerciseMetaSelected(meta)}
                onSelect={() => setExercisesToAdd((e) => [...e, meta])}
                onDeselect={() =>
                  setExercisesToAdd((e) =>
                    e.filter(({ name }) => name !== meta.name)
                  )
                }
              />
            )}
          />
        ))}
      </CollapsableSearchScroll>
      <View
        style={[
          exerciseSearcherContentStyles.groupNavigation,
          { bottom: insets.bottom },
        ]}
      >
        <SearchExerciseGroupNav
          enabledGroups={exerciseResultGroups.map(({ group }) => group)}
          onClick={(selectedGroup) => {
            const index = exerciseResultGroups.findIndex(
              ({ group }) => group === selectedGroup
            );
            if (index >= 0 && scrollRef.current) {
              const offset = computeOffsetToScrollTo(
                exerciseResultGroups,
                selectedGroup
              );
              scrollRef.current.scrollTo({ animated: true, y: offset });
            }
          }}
        />
      </View>
      {exercisesToAdd.length > 0 && (
        <View
          style={[
            exerciseSearcherContentStyles.action,
            { bottom: insets.bottom },
          ]}
        >
          <SignificantAction
            onClick={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              onAdd(exercisesToAdd);
              setExercisesToAdd([]);
              onClose();
            }}
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

type ExerciseSearcherModalsProps = {
  exerciseSearcherFilters: ModalProps;
  muscleFilter?: string;
  exerciseTypeFilter?: string;
  onUpdateMuscleFilter: (filter?: string) => void;
  onUpdateExerciseTypeFilter: (filter?: string) => void;
};

export function ExerciseSearcherModals({
  exerciseSearcherFilters,
  muscleFilter,
  exerciseTypeFilter,
  onUpdateMuscleFilter,
  onUpdateExerciseTypeFilter,
}: ExerciseSearcherModalsProps) {
  return (
    <>
      <ExercisesFilter
        {...exerciseSearcherFilters}
        muscleFilter={muscleFilter}
        exerciseTypeFilter={exerciseTypeFilter}
        onUpdateExerciseTypeFilter={onUpdateExerciseTypeFilter}
        onUpdateMuscleFilter={onUpdateMuscleFilter}
      />
    </>
  );
}
