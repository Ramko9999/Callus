import { StyleSheet, TouchableOpacity } from "react-native";
import { View } from "@/components/Themed";
import { StyleUtils, TAB_BAR_HEIGHT } from "@/util/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExerciseMeta, SearchExerciseSummary } from "@/interface";
import { WorkoutApi } from "@/api/workout";
import React from "react";
import { EXERCISE_REPOSITORY } from "@/api/exercise";
import { HeaderPage } from "@/components/util/header-page";
import { CollapsableSearchScroll } from "@/components/util/collapsable-search-scroll";
import Animated from "react-native-reanimated";
import { ExercisesFilter } from "@/components/popup/exercises/filters";
import { useTabBar } from "@/components/tab-bar/context";
import { SEARCH_BAR_HEIGHT } from "@/components/util/collapsable-search-scroll/search";
import {
  computeOffsetToScrollTo,
  filterExerciseResultGroups,
  SearchExercise,
  SearchExerciseFilterAction,
  SearchExerciseGroup,
  SearchExerciseGroupNav,
} from "./search";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

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
  container: {
    ...StyleUtils.flexColumn(5),
    paddingBottom: SEARCH_BAR_HEIGHT,
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
  const navigation = useNavigation();
  const tabBarActions = useTabBar();
  const scrollRef = useRef<Animated.ScrollView>(null);

  const [performedExerciseSummaries, setPerformedExerciseSummaries] = useState<
    SearchExerciseSummary[]
  >([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showExercisesFilter, setShowExercisesFilter] =
    useState<boolean>(false);
  const [muscleFilter, setMuscleFilter] = useState<string>();
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<string>();

  useFocusEffect(
    useCallback(() => {
      WorkoutApi.getExerciseSummaries().then(setPerformedExerciseSummaries);
    }, [])
  );

  useEffect(() => {
    if (showExercisesFilter) {
      tabBarActions.close();
    } else {
      tabBarActions.open();
    }
  }, [showExercisesFilter]);

  const exerciseResultGroups = filterExerciseResultGroups(
    searchQuery,
    EXERCISE_REPOSITORY,
    muscleFilter,
    exerciseTypeFilter
  );

  const getSummary = (meta: ExerciseMeta) => {
    const summaryIndex = performedExerciseSummaries
      .map(({ name }) => name)
      .indexOf(meta.name);
    if (summaryIndex > -1) {
      return performedExerciseSummaries[summaryIndex];
    }
  };

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
              renderExercise={(meta, index) => (
                <SearchExerciseWithSummary
                  meta={meta}
                  summary={getSummary(meta)}
                  key={index}
                  onClick={() => {
                    // @ts-ignore
                    navigation.navigate("exerciseInsight", { name: meta.name });
                  }}
                />
              )}
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
