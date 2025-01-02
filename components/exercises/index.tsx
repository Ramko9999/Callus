import {
  StyleSheet,
  TextInput as DefaultTextInput,
  TouchableWithoutFeedback,
  Pressable,
  View as DefaultView,
  TouchableOpacity,
} from "react-native";
import { View, Text, TextInput, useThemeColoring } from "../Themed";
import { DynamicHeaderPage } from "../util/dynamic-header-page";
import { Search } from "../theme/actions";
import { StyleUtils, TAB_BAR_HEIGHT } from "@/util/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExerciseMeta, SearchExerciseSummary } from "@/interface";
import { usePathname } from "expo-router";
import { WorkoutApi } from "@/api/workout";
import { ArrayUtils } from "@/util/misc";
import * as Haptics from "expo-haptics";
import React from "react";
import Animated from "react-native-reanimated";
import { textTheme } from "@/constants/Themes";
import { Popover, PopoverAnchor } from "../util/popover";
import { SEARCH_EXERCISE_HEIGHT } from "@/util/styles";
import { ExerciseInsightsPopup } from "./insights";
import {
  DISPLAY_EXERCISE_TYPE_TO_TYPE,
  EXERCISE_REPOSITORY,
  MUSCLE_GROUPS,
  DISPLAY_EXERCISE_TYPES,
} from "@/api/exercise";

const ALL_EXERCISE_GROUPS = Array.from({ length: 26 }).map((_, index) =>
  String.fromCharCode(index + "A".charCodeAt(0))
);

const SEARCH_EXERCISE_GAP = 10;
const SEARCH_EXERCISE_DROPDOWN_FILTER_HEIGHT = 40;
// todo: reconsider which exercises to include initially and actually create the gifs and getting the correct muscles
// todo: give first class treatment to the assistance exercises
const searchBarStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    alignItems: "baseline",
    borderRadius: 10,
  },
});

type SearchBarProps = {
  query: string;
  onSearchQuery: (query: string) => void;
};

function SearchBar({ query, onSearchQuery }: SearchBarProps) {
  const searchRef = useRef<DefaultTextInput>(null);

  const onClickSearch = useCallback(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  return (
    <TouchableWithoutFeedback onPress={onClickSearch}>
      <View background style={searchBarStyles.container}>
        <Search
          iconSize={textTheme.neutral.fontSize}
          style={{ width: 35, height: 35 }}
        />
        <TextInput
          ref={searchRef}
          neutral
          value={query}
          placeholder="Search for an exercise"
          placeholderTextColor={useThemeColoring("lightText")}
          onChangeText={onSearchQuery}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const searchExerciseFilterDropdownStyles = StyleSheet.create({
  container: {
    borderRadius: 5,
  },
  item: {
    ...StyleUtils.flexColumn(),
    height: SEARCH_EXERCISE_DROPDOWN_FILTER_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
});

type SearchExerciseFilterDropdownProps = {
  selectedValue?: string;
  values: string[];
  onSelect: (value: string) => void;
  onDeselect: () => void;
};

function SearchExerciseFilterDropdown({
  selectedValue,
  values,
  onSelect,
  onDeselect,
}: SearchExerciseFilterDropdownProps) {
  const selectedValueBackgroundColor = useThemeColoring(
    "highlightedAnimationColor"
  );

  return (
    <View background style={searchExerciseFilterDropdownStyles.container}>
      {values.map((value, index) => (
        <TouchableOpacity
          key={index}
          style={[
            searchExerciseFilterDropdownStyles.item,
            selectedValue && selectedValue === value
              ? { backgroundColor: selectedValueBackgroundColor }
              : {},
          ]}
          onPress={() => {
            if (selectedValue && selectedValue === value) {
              onDeselect();
            } else {
              onSelect(value);
            }
          }}
        >
          <Text action>{value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const searchExerciseFilterTriggerStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    alignItems: "center",
    height: 35,
    borderRadius: 5,
    flex: 1,
  },
});

type SearchExerciseFilterTriggerProps = {
  selectedValue?: string;
  placeholder: string;
  pressableRef: React.RefObject<DefaultView>;
  onTrigger: () => void;
};

function SearchExerciseFilterTrigger({
  selectedValue,
  placeholder,
  pressableRef,
  onTrigger,
}: SearchExerciseFilterTriggerProps) {
  const noSelectedValueBackgroundColor = useThemeColoring(
    "primaryViewBackground"
  );
  const selectedValueBackgroundColor = useThemeColoring("dynamicHeaderBorder");

  const placeholderStyleProps = selectedValue ? {} : { light: true };
  const backgroundColor = selectedValue
    ? selectedValueBackgroundColor
    : noSelectedValueBackgroundColor;

  return (
    <Pressable
      ref={pressableRef}
      style={[searchExerciseFilterTriggerStyles.container, { backgroundColor }]}
      onPress={onTrigger}
    >
      <Text neutral {...placeholderStyleProps}>
        {selectedValue ?? placeholder}
      </Text>
    </Pressable>
  );
}

const searchExerciseStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(15),
    height: SEARCH_EXERCISE_HEIGHT,
    alignItems: "center",
  },
  demo: {
    width: SEARCH_EXERCISE_HEIGHT - 15,
    height: SEARCH_EXERCISE_HEIGHT - 15,
    borderRadius: 5,
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    ...StyleUtils.flexColumn(),
    justifyContent: "space-between",
    height: SEARCH_EXERCISE_HEIGHT - 15,
  },
  description: {
    ...StyleUtils.flexRow(5),
  },
});

type ISearchExercise = {
  meta: ExerciseMeta;
  summary?: SearchExerciseSummary;
};

type SearchExerciseProps = {
  meta: ExerciseMeta;
  summary?: SearchExerciseSummary;
  onClick: (exercise: string) => void;
};

function SearchExercise({ meta, summary, onClick }: SearchExerciseProps) {
  return (
    <TouchableOpacity
      style={searchExerciseStyles.container}
      onPress={() => onClick(meta.name)}
    >
      <View
        style={[
          searchExerciseStyles.demo,
          { backgroundColor: useThemeColoring("dynamicHeaderBorder") },
        ]}
      >
        <Text large>{meta.name.substring(0, 1)}</Text>
      </View>
      <View style={searchExerciseStyles.content}>
        <Text neutral>{meta.name}</Text>
        <View style={searchExerciseStyles.description}>
          <Text light>{meta.muscles[0]}</Text>
          {summary?.totalSetsCompleted && (
            <Text light>
              - {(summary as SearchExerciseSummary).totalSetsCompleted} sets
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const searchExerciseGroupStyle = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  content: {
    ...StyleUtils.flexColumn(SEARCH_EXERCISE_GAP),
  },
  group: {
    height: SEARCH_EXERCISE_HEIGHT,
    marginRight: "5%",
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

type ISearchExerciseGroup = {
  group: string;
  exercises: ISearchExercise[];
};

type SearchExerciseGroupProps = {
  grouping: ISearchExerciseGroup;
  onClick: (exercise: string) => void;
};

function SearchExerciseGroup({ grouping, onClick }: SearchExerciseGroupProps) {
  return (
    <View style={searchExerciseGroupStyle.container}>
      <View style={searchExerciseGroupStyle.group}>
        <Text large>{grouping.group}</Text>
      </View>
      <View style={searchExerciseGroupStyle.content}>
        {grouping.exercises.map((exercise, index) => (
          <SearchExercise key={index} onClick={onClick} {...exercise} />
        ))}
      </View>
    </View>
  );
}

const searchExerciseGroupNavStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(2),
  },
});

type SearchExerciseGroupNavProps = {
  enabledGroups: string[];
  onClick: (group: string) => void;
};

function SearchExerciseGroupNav({
  enabledGroups,
  onClick,
}: SearchExerciseGroupNavProps) {
  const enabledGroupsSet = new Set(enabledGroups);

  return (
    <View style={searchExerciseGroupNavStyles.container}>
      {ALL_EXERCISE_GROUPS.map((group, index) => (
        <TouchableWithoutFeedback
          key={index}
          onPress={() => {
            if (enabledGroupsSet.has(group)) {
              onClick(group);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }}
        >
          <Text small light={!enabledGroupsSet.has(group)}>
            {group}
          </Text>
        </TouchableWithoutFeedback>
      ))}
    </View>
  );
}

function enrichExercisesWithPerformedSummaries(
  query: string,
  exerciseMetas: ExerciseMeta[],
  summaries: SearchExerciseSummary[],
  muscleFilter?: string,
  exerciseTypeFilter?: string
) {
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

  const summaryMapping = new Map<string, SearchExerciseSummary>();
  summaries.forEach((summary) => summaryMapping.set(summary.name, summary));

  const searchExercises = relevantMetas.map((meta) => ({
    meta,
    summary: summaryMapping.get(meta.name),
  }));
  const groups = ArrayUtils.groupBy(searchExercises, ({ meta }) =>
    meta.name.charAt(0)
  ).map(({ key, items }) => ({
    group: key,
    exercises: ArrayUtils.sortBy(items, ({ meta }) => meta.name),
  }));

  return ArrayUtils.sortBy(groups, ({ group }) => group);
}

function computeOffsetToScrollTo(
  groups: ISearchExerciseGroup[],
  groupToScrollTo: string
) {
  const groupsToScrollPast = groups.filter(
    ({ group }) => group < groupToScrollTo
  );
  if (groupsToScrollPast.length === 0) {
    return 0;
  }
  const offset =
    groupsToScrollPast
      .map(
        ({ exercises }) =>
          exercises.length * SEARCH_EXERCISE_HEIGHT +
          (exercises.length - 1) * SEARCH_EXERCISE_GAP
      )
      .reduce((total, current) => total + current) +
    groupsToScrollPast.length * SEARCH_EXERCISE_HEIGHT;
  return offset;
}

const exercisesStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    marginTop: "3%",
  },
  results: {
    paddingBottom: "3%",
  },
  groupNavigation: {
    position: "absolute",
    left: "97%",
    bottom: TAB_BAR_HEIGHT + 20,
  },
  filters: {
    ...StyleUtils.flexRow(5),
  },
});

type SearchExerciseFilterState = {
  selectedValue?: string;
  show: boolean;
};

type SearchExerciseFilterDimensions = {
  anchor: PopoverAnchor;
  width: number;
};

export function Exercises() {
  const scrollRef = useRef<Animated.ScrollView>(null);

  const muscleFilterRef = useRef<DefaultView>(null);
  const exerciseTypeRef = useRef<DefaultView>(null);

  const muscleFilterAnchor = useRef<SearchExerciseFilterDimensions>({
    anchor: { x: 0, y: 0 },
    width: 0,
  });
  const exerciseTypeFilterAnchor = useRef<SearchExerciseFilterDimensions>({
    anchor: { x: 0, y: 0 },
    width: 0,
  });

  const pathname = usePathname();
  const [performedExerciseSummaries, setPerformedExerciseSummaries] = useState<
    SearchExerciseSummary[]
  >([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [muscleFilterState, setMuscleFilterState] =
    useState<SearchExerciseFilterState>({ show: false });
  const [exerciseTypeFilterState, setExerciseTypeFilterState] =
    useState<SearchExerciseFilterState>({ show: false });

  const [selectedExercise, setSelectedExercise] = useState<string>();

  useEffect(() => {
    WorkoutApi.getExerciseSummaries().then(setPerformedExerciseSummaries);
    if (muscleFilterRef.current) {
      muscleFilterRef.current?.measure((x, y, width, height, pageX, pageY) => {
        muscleFilterAnchor.current = { anchor: { x: pageX, y: pageY }, width };
      });
    }
    if (exerciseTypeRef.current) {
      exerciseTypeRef.current?.measure((x, y, width, height, pageX, pageY) => {
        exerciseTypeFilterAnchor.current = {
          anchor: { x: pageX, y: pageY },
          width,
        };
      });
    }
  }, [pathname]);

  const exerciseResultGroups = enrichExercisesWithPerformedSummaries(
    searchQuery,
    EXERCISE_REPOSITORY,
    performedExerciseSummaries,
    muscleFilterState.selectedValue,
    exerciseTypeFilterState.selectedValue
  );

  return (
    <>
      <DynamicHeaderPage title="Exercises" scrollViewRef={scrollRef}>
        <View style={exercisesStyles.container}>
          <SearchBar query={searchQuery} onSearchQuery={setSearchQuery} />
          <View style={exercisesStyles.filters}>
            <SearchExerciseFilterTrigger
              selectedValue={muscleFilterState.selectedValue}
              placeholder="Any muscle"
              onTrigger={() =>
                setMuscleFilterState((filterState) => ({
                  ...filterState,
                  show: true,
                }))
              }
              pressableRef={muscleFilterRef}
            />
            <SearchExerciseFilterTrigger
              selectedValue={exerciseTypeFilterState.selectedValue}
              placeholder="Any exercise type"
              onTrigger={() =>
                setExerciseTypeFilterState((filterState) => ({
                  ...filterState,
                  show: true,
                }))
              }
              pressableRef={exerciseTypeRef}
            />
          </View>
          <View style={exercisesStyles.results}>
            {exerciseResultGroups.map((exerciseResultGroup, index) => (
              <SearchExerciseGroup
                key={index}
                grouping={exerciseResultGroup}
                onClick={setSelectedExercise}
              />
            ))}
          </View>
        </View>
      </DynamicHeaderPage>

      <View style={exercisesStyles.groupNavigation}>
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
      <Popover
        show={muscleFilterState.show}
        onBackdropPress={() =>
          setMuscleFilterState((filterState) => ({
            ...filterState,
            show: false,
          }))
        }
        anchor={muscleFilterAnchor.current.anchor}
        contentStyle={{ width: muscleFilterAnchor.current.width }}
      >
        <SearchExerciseFilterDropdown
          selectedValue={muscleFilterState.selectedValue}
          values={MUSCLE_GROUPS}
          onSelect={(value) =>
            setMuscleFilterState({ selectedValue: value, show: false })
          }
          onDeselect={() => setMuscleFilterState({ show: false })}
        />
      </Popover>
      <Popover
        show={exerciseTypeFilterState.show}
        onBackdropPress={() =>
          setExerciseTypeFilterState((filterState) => ({
            ...filterState,
            show: false,
          }))
        }
        anchor={exerciseTypeFilterAnchor.current.anchor}
        contentStyle={{ width: exerciseTypeFilterAnchor.current.width }}
      >
        <SearchExerciseFilterDropdown
          selectedValue={exerciseTypeFilterState.selectedValue}
          values={DISPLAY_EXERCISE_TYPES}
          onSelect={(value) =>
            setExerciseTypeFilterState({ selectedValue: value, show: false })
          }
          onDeselect={() => setExerciseTypeFilterState({ show: false })}
        />
      </Popover>
      <ExerciseInsightsPopup
        show={selectedExercise != undefined}
        hide={() => setSelectedExercise(undefined)}
        exerciseName={selectedExercise as string}
      />
    </>
  );
}
