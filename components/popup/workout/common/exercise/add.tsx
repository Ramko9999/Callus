import {
  DISPLAY_EXERCISE_TYPE_TO_TYPE,
  EXERCISE_REPOSITORY,
  getMeta,
} from "@/api/exercise";
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
import { View, Text, useThemeColoring } from "@/components/Themed";
import { CollapsableSearchScroll } from "@/components/util/collapsable-search-scroll";
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
import { ArrayUtils } from "@/util/misc";
import { SearchBar } from "@/components/util/collapsable-search-scroll/search";

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
    width: SEARCH_EXERCISE_SELECTED_INDICATOR_WIDTH,
    height: SEARCH_EXERCISE_HEIGHT - 15,
    borderRadius: 10,
  },
});

// todo: clean up the animation here son
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

type ExerciseAdderProps = {
  muscleFilter?: string;
  exerciseTypeFilter?: string;
  onClose: () => void;
  onAdd: (exercises: ExerciseMeta[]) => void;
};

export function ExerciseAdder({
  muscleFilter,
  exerciseTypeFilter,
  onClose,
  onAdd,
}: ExerciseAdderProps) {
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
                name={meta.name}
                isSelected={isExerciseMetaSelected(meta)}
                onToggle={(meta) => {
                  setExercisesToAdd((metas) => {
                    if (metas.map(({ name }) => name).includes(meta.name)) {
                      return metas.filter(({ name }) => meta.name !== name);
                    } else {
                      return [...metas, meta];
                    }
                  });
                }}
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

// todo: use only the performance improved exercise adder
type ExerciseAdderResult = {
  resultType: "exercise" | "group";
  exercise?: ExerciseMeta;
  group?: string;
};

function getResultsToDisplay(
  query: string,
  exerciseMetas: ExerciseMeta[],
  muscleFilter?: string,
  exerciseTypeFilter?: string
): ExerciseAdderResult[] {
  const relevantMetas = exerciseMetas.filter(
    ({ name, muscles, difficultyType }) => {
      if (!name.includes(query.trim())) {
        return false;
      }
      if (muscleFilter && muscles[0] !== muscleFilter) {
        return false;
      }
      if (
        exerciseTypeFilter &&
        !DISPLAY_EXERCISE_TYPE_TO_TYPE[exerciseTypeFilter].includes(
          difficultyType
        )
      ) {
        return false;
      }
      return true;
    }
  );

  const groups = ArrayUtils.sortBy(
    ArrayUtils.groupBy(relevantMetas, (meta) => meta.name.charAt(0)),
    ({ key }) => key
  );

  return groups.flatMap(({ key, items }) => [
    { resultType: "group", group: key },
    ...items.map((meta) => ({ resultType: "exercise", exercise: meta })),
  ]) as ExerciseAdderResult[];
}

const searchExerciseGroupingStyles = StyleSheet.create({
  container: {
    height: SEARCH_EXERCISE_HEIGHT,
    marginRight: "1%",
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

type SearchExerciseGroupingProps = {
  group: string;
};

function SearchExerciseGrouping({ group }: SearchExerciseGroupingProps) {
  return (
    <View style={searchExerciseGroupingStyles.container}>
      <Text large>{group}</Text>
    </View>
  );
}

const performantExerciseAdderStyles = StyleSheet.create({
  scroll: {
    flex: 1,
    paddingHorizontal: "3%",
  },
  content: {
    paddingBottom: "3%",
  },
  search: {
    paddingHorizontal: "3%",
    paddingBottom: "1%",
  },
  bar: {
    borderRadius: 5,
  },
});

type PerformantExerciseAdderProps = {
  muscleFilter?: string;
  exerciseTypeFilter?: string;
  onClose: () => void;
  onAdd: (exercises: ExerciseMeta[]) => void;
};

export function PerformantExerciseAdder({
  onClose,
  onAdd,
  muscleFilter,
  exerciseTypeFilter,
}: ExerciseAdderProps) {
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [exercisesToAdd, setExercisesToAdd] = useState<ExerciseMeta[]>([]);

  const results = getResultsToDisplay(
    searchQuery,
    EXERCISE_REPOSITORY,
    muscleFilter,
    exerciseTypeFilter
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
    ({ item }: { item: ExerciseAdderResult }) =>
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
    ({ resultType, exercise, group }: ExerciseAdderResult) =>
      exercise ? `${resultType}-${exercise.name}` : `${resultType}-${group}`,
    []
  );

  // todo: prevent keyboard form pushing up group nav on android
  return (
    <>
      <View style={performantExerciseAdderStyles.search}>
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          style={{
            ...performantExerciseAdderStyles.bar,
            backgroundColor: useThemeColoring("calendarDayBackground"),
          }}
        />
      </View>
      <FlatList
        ref={flatListRef}
        style={performantExerciseAdderStyles.scroll}
        contentContainerStyle={performantExerciseAdderStyles.content}
        showsVerticalScrollIndicator={false}
        data={results}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
      <View
        style={[
          exerciseSearcherContentStyles.groupNavigation,
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
            exerciseSearcherContentStyles.action,
            { bottom: insets.bottom },
          ]}
        >
          <SignificantAction
            onClick={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              onAdd(exercisesToAdd);
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
  return (
    <>
      <ExerciseSearcherTopActions
        hasFilters={
          muscleFilter != undefined || exerciseTypeFilter != undefined
        }
        onEditFilters={onEditFilters}
        onClose={onClose}
      />
      <ExerciseAdder
        onClose={onClose}
        onAdd={onAdd}
        muscleFilter={muscleFilter}
        exerciseTypeFilter={exerciseTypeFilter}
        onEditFilters={onEditFilters}
      />
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
