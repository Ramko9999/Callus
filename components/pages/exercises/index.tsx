import {
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils, TAB_BAR_HEIGHT } from "@/util/styles";
import { useEffect, useRef, useState } from "react";
import { ExerciseMeta, SearchExerciseSummary } from "@/interface";
import { usePathname } from "expo-router";
import { WorkoutApi } from "@/api/workout";
import { ArrayUtils } from "@/util/misc";
import * as Haptics from "expo-haptics";
import React from "react";
import { SEARCH_EXERCISE_HEIGHT } from "@/util/styles";
import { ExerciseInsightsSheet } from "@/components/popup/exercises/insights";
import {
  DISPLAY_EXERCISE_TYPE_TO_TYPE,
  EXERCISE_REPOSITORY,
} from "@/api/exercise";
import { HeaderPage } from "@/components/util/header-page";
import { CollapsableSearchScroll } from "@/components/util/collapsable-search-scroll";
import Animated from "react-native-reanimated";
import { ListFilter } from "lucide-react-native";
import { ExercisesFilter } from "@/components/popup/exercises/filters";
import { useTabBar } from "@/components/util/tab-bar/context";
import { SEARCH_BAR_HEIGHT } from "@/components/util/collapsable-search-scroll/search";
import { useLiveIndicator } from "@/components/popup/workout/live";

const ALL_EXERCISE_GROUPS = Array.from({ length: 26 }).map((_, index) =>
  String.fromCharCode(index + "A".charCodeAt(0))
);

const SEARCH_EXERCISE_GAP = 10;

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

const searchExerciseFiltersActionStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
  },
  indication: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    bottom: 1,
    right: 1,
  },
});

type SearchExerciseFilterActionProps = {
  hasFilters: boolean;
  onClick: () => void;
};

function SearchExerciseFilterAction({
  hasFilters,
  onClick,
}: SearchExerciseFilterActionProps) {
  const hasFiltersColor = useThemeColoring("primaryAction");
  const hasNoFiltersColor = useThemeColoring("lightText");

  return (
    <TouchableOpacity
      onPress={onClick}
      style={searchExerciseFiltersActionStyles.container}
    >
      <ListFilter color={hasFilters ? hasFiltersColor : hasNoFiltersColor} />
      {hasFilters && (
        <View
          style={[
            searchExerciseFiltersActionStyles.indication,
            { backgroundColor: hasFiltersColor },
          ]}
        />
      )}
    </TouchableOpacity>
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
    paddingBottom: TAB_BAR_HEIGHT + SEARCH_BAR_HEIGHT,
  },
  scroll: {
    flex: 1,
    marginTop: "3%",
    paddingHorizontal: "3%",
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

// todo: reconsider which exercises to include initially and actually create the gifs and getting the correct muscles
// todo: give first class treatment to the assistance exercises
export function Exercises() {
  const tabBarActions = useTabBar();
  const liveIndicatorActions = useLiveIndicator();
  const scrollRef = useRef<Animated.ScrollView>(null);

  const pathname = usePathname();
  const [performedExerciseSummaries, setPerformedExerciseSummaries] = useState<
    SearchExerciseSummary[]
  >([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showExercisesFilter, setShowExercisesFilter] =
    useState<boolean>(false);
  const [muscleFilter, setMuscleFilter] = useState<string>();
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<string>();

  const [selectedExercise, setSelectedExercise] = useState<string>();

  useEffect(() => {
    WorkoutApi.getExerciseSummaries().then(setPerformedExerciseSummaries);
  }, [pathname]);

  useEffect(() => {
    if (showExercisesFilter || selectedExercise != undefined) {
      tabBarActions.close();
      liveIndicatorActions.hide();
    } else {
      tabBarActions.open();
      liveIndicatorActions.show();
    }
  }, [showExercisesFilter, selectedExercise]);

  const exerciseResultGroups = enrichExercisesWithPerformedSummaries(
    searchQuery,
    EXERCISE_REPOSITORY,
    performedExerciseSummaries,
    muscleFilter,
    exerciseTypeFilter
  );

  return (
    <>
      <HeaderPage
        title="Exercises"
        rightAction={
          <SearchExerciseFilterAction
            hasFilters={
              muscleFilter != undefined || exerciseTypeFilter != undefined
            }
            onClick={() => setShowExercisesFilter(true)}
          />
        }
      >
        <CollapsableSearchScroll
          contentStyle={exercisesStyles.container}
          scrollStyle={exercisesStyles.scroll}
          scrollRef={scrollRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        >
          {exerciseResultGroups.map((exerciseResultGroup, index) => (
            <SearchExerciseGroup
              key={index}
              grouping={exerciseResultGroup}
              onClick={setSelectedExercise}
            />
          ))}
        </CollapsableSearchScroll>
      </HeaderPage>

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
      <ExerciseInsightsSheet
        show={selectedExercise != undefined}
        hide={() => setSelectedExercise(undefined)}
        exerciseName={selectedExercise as string}
      />
      <ExercisesFilter
        show={showExercisesFilter}
        hide={() => setShowExercisesFilter(false)}
        muscleFilter={muscleFilter}
        exerciseTypeFilter={exerciseTypeFilter}
        onUpdateExerciseTypeFilter={setExerciseTypeFilter}
        onUpdateMuscleFilter={setMuscleFilter}
      />
    </>
  );
}
