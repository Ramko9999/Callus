import React, { useCallback } from "react";
import { StyleUtils } from "@/util/styles";
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  useWindowDimensions,
  TextInput as RNTextInput,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  Pressable,
  Image,
} from "react-native";
import { View, Text, useThemeColoring, TextInput } from "@/components/Themed";
import { tintColor } from "@/util/color";
import { X, Plus, Search } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { DifficultyType, ExerciseMeta } from "@/interface";
import { getExerciseDemonstration, queryExercises } from "@/api/exercise";
import { ArrayUtils } from "@/util/misc";

// Constants
export const SEARCH_EXERCISE_HEIGHT = 55;

const ALL_EXERCISE_GROUPS = Array.from({ length: 26 }).map((_, index) =>
  String.fromCharCode(index + "A".charCodeAt(0))
);

const EXERCISE_TYPE_TO_DISPLAY_INFO: Record<DifficultyType, { title: string }> =
  {
    [DifficultyType.WEIGHT]: { title: "Weight" },
    [DifficultyType.BODYWEIGHT]: { title: "Bodyweight" },
    [DifficultyType.WEIGHTED_BODYWEIGHT]: { title: "Weighted Bodyweight" },
    [DifficultyType.TIME]: { title: "Time" },
    [DifficultyType.ASSISTED_BODYWEIGHT]: { title: "Assisted Bodyweight" },
  };

export type ExerciseDisplayResult = {
  resultType: "exercise" | "group";
  exercise?: ExerciseMeta;
  group?: string;
};

export function getResultsToDisplay(
  query: string,
  exerciseMetas: ExerciseMeta[],
  muscleFilters: string[],
  exerciseTypeFilters: string[]
): ExerciseDisplayResult[] {
  const results = queryExercises(
    query,
    exerciseMetas,
    muscleFilters,
    exerciseTypeFilters
  );

  const groups = ArrayUtils.sortBy(
    ArrayUtils.groupBy(results, (meta) => meta.name.charAt(0)),
    ({ key }) => key
  );

  return groups.flatMap(({ key, items }) => [
    { resultType: "group", group: key },
    ...items.map((meta) => ({ resultType: "exercise", exercise: meta })),
  ]) as ExerciseDisplayResult[];
}

const filterPillsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(5),
    paddingHorizontal: "3%",
    paddingVertical: "2%",
  },
  pill: {
    paddingHorizontal: "3%",
    paddingVertical: "1%",
    borderRadius: 10,
    ...StyleUtils.flexRowCenterAll(5),
  },
});

type FilterPillProps = {
  label: string;
  count: number;
  backgroundColor: string;
  onClick: () => void;
};

function FilterPill({
  label,
  count,
  backgroundColor,
  onClick,
}: FilterPillProps) {
  return (
    <TouchableOpacity
      style={[filterPillsStyles.pill, { backgroundColor }]}
      onPress={onClick}
    >
      <Text>{count === 1 ? label : `${label} +${count - 1}`}</Text>
    </TouchableOpacity>
  );
}

type FilterActionPillProps = {
  hasFilters: boolean;
  onClick: () => void;
};

function FilterActionPill({ hasFilters, onClick }: FilterActionPillProps) {
  const neutralPillColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.05
  );
  const iconColor = useThemeColoring("primaryText");

  return (
    <TouchableOpacity
      style={[
        filterPillsStyles.pill,
        {
          backgroundColor: neutralPillColor,
        },
      ]}
      onPress={onClick}
    >
      {hasFilters ? (
        <>
          <X size={16} color={iconColor} />
          <Text>Clear filters</Text>
        </>
      ) : (
        <>
          <Plus size={16} color={iconColor} />
          <Text>Add filters</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

type FilterActionsProps = {
  hasFilters: boolean;
  muscleFilters: string[];
  exerciseTypeFilters: string[];
  onUpdateMuscleFilters: (filters: string[]) => void;
  onUpdateExerciseTypeFilters: (filters: string[]) => void;
  onShowFilters: () => void;
};

export function FilterActions({
  hasFilters,
  muscleFilters,
  exerciseTypeFilters,
  onUpdateMuscleFilters,
  onUpdateExerciseTypeFilters,
  onShowFilters,
}: FilterActionsProps) {
  const primaryAction = useThemeColoring("primaryAction");

  return (
    <View style={filterPillsStyles.container}>
      <FilterActionPill
        hasFilters={hasFilters}
        onClick={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (hasFilters) {
            // Clear filters
            onUpdateMuscleFilters([]);
            onUpdateExerciseTypeFilters([]);
          } else {
            // Show filter sheet
            onShowFilters();
          }
        }}
      />
      {hasFilters && (
        <>
          {muscleFilters.length > 0 && (
            <FilterPill
              label={muscleFilters[0]}
              count={muscleFilters.length}
              backgroundColor={primaryAction}
              onClick={onShowFilters}
            />
          )}
          {exerciseTypeFilters.length > 0 && (
            <FilterPill
              label={
                EXERCISE_TYPE_TO_DISPLAY_INFO[
                  exerciseTypeFilters[0] as DifficultyType
                ].title
              }
              count={exerciseTypeFilters.length}
              backgroundColor={primaryAction}
              onClick={onShowFilters}
            />
          )}
        </>
      )}
    </View>
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

type SearchExerciseProps = {
  meta: ExerciseMeta;
  description?: string;
};

export function SearchExercise({ meta, description }: SearchExerciseProps) {
  return (
    <View style={searchExerciseStyles.container}>
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
          <Text light>{meta.primaryMuscles[0]}</Text>
          {description && <Text light>{description}</Text>}
        </View>
      </View>
    </View>
  );
}

const searchExerciseGroupingStyles = StyleSheet.create({
  container: {
    height: SEARCH_EXERCISE_HEIGHT,
    marginRight: "1%",
    alignItems: "center",
    justifyContent: "center",
    ...StyleUtils.flexRow(5),
  },
  divider: {
    flex: 1,
    height: 1,
  },
  title: {
    paddingHorizontal: "2%",
  },
});

type SearchExerciseGroupingProps = {
  group: string;
};

export function SearchExerciseGrouping({ group }: SearchExerciseGroupingProps) {
  const dividerColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.15
  );

  return (
    <View style={searchExerciseGroupingStyles.container}>
      <View
        style={[
          searchExerciseGroupingStyles.divider,
          { backgroundColor: dividerColor },
        ]}
      />
      <Text neutral light style={searchExerciseGroupingStyles.title}>
        {group}
      </Text>
      <View
        style={[
          searchExerciseGroupingStyles.divider,
          { backgroundColor: dividerColor },
        ]}
      />
    </View>
  );
}

const searchBarStyles = StyleSheet.create({
  container: {
    marginTop: "3%",
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "3%",
    borderRadius: 10,
  },
  search: {
    ...StyleUtils.flexRow(5),
    alignItems: "center",
  },
});

type SearchBarProps = {
  onChangeSearchQuery: (searchQuery: string) => void;
  style?: ViewStyle;
};

export function SearchBar({ onChangeSearchQuery, style }: SearchBarProps) {
  const { height } = useWindowDimensions();
  const inputRef = React.useRef<RNTextInput>(null);
  const lightText = useThemeColoring("lightText");

  const clearSearch = useCallback((event: GestureResponderEvent) => {
    event.stopPropagation();
    if (inputRef.current) {
      inputRef.current.clear();
      onChangeSearchQuery("");
    }
  }, []);

  return (
    <Pressable
      style={[searchBarStyles.container, style, { height: height * 0.04 }]}
      onPress={() => {
        inputRef.current?.focus();
      }}
    >
      <View style={searchBarStyles.search}>
        <Search size={16} color={lightText} />
        <TextInput
          neutral
          placeholder="Search for an exercise"
          placeholderTextColor={lightText}
          onChangeText={onChangeSearchQuery}
          ref={inputRef}
        />
      </View>
      <TouchableOpacity onPress={clearSearch}>
        <X size={16} color={lightText} />
      </TouchableOpacity>
    </Pressable>
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

export function SearchExerciseGroupNav({
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

const exerciseGridItemStyles = StyleSheet.create({
  textContainer: {
    padding: 10,
  },
  imageContainer: {
    ...StyleUtils.flexRowCenterAll(),
    paddingVertical: "10%",
  },
});

type ExerciseGridItemProps = {
  exercise: ExerciseMeta;
  summary: string;
};

export function ExerciseGridItem({
  exercise,
  summary,
}: ExerciseGridItemProps) {
  const { height } = useWindowDimensions();
  const imageBackgroundColor = tintColor(
    useThemeColoring("appBackground"),
    0.1
  );
  const descriptionColor = tintColor(useThemeColoring("appBackground"), 0.15);
  const demonstration = getExerciseDemonstration(exercise.name);

  return (
    <>
      <View style={[exerciseGridItemStyles.imageContainer, { backgroundColor: imageBackgroundColor }]}>
        {demonstration && (
          <Image
            source={demonstration}
            style={{ height: height * 0.2 }}
            resizeMode="contain"
          />
        )}
      </View>
      <View
        style={[
          exerciseGridItemStyles.textContainer,
          { backgroundColor: descriptionColor },
        ]}
      >
        <Text>{exercise.name}</Text>
        <Text light small numberOfLines={1} ellipsizeMode="tail">
          {exercise.primaryMuscles.join(", ")}
        </Text>
        <Text light small>
          {summary}
        </Text>
      </View>
    </>
  );
}
