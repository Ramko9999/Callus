import { useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { ListFilter } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { View, Text } from "@/components/Themed";
import * as Haptics from "expo-haptics";
import { ExerciseMeta } from "@/interface";
import { DISPLAY_EXERCISE_TYPE_TO_TYPE } from "@/api/exercise";
import { ArrayUtils } from "@/util/misc";

export const SEARCH_EXERCISE_HEIGHT = 55;

const SEARCH_EXERCISE_GAP = 10;
const SEARCH_EXERCISE_GROUP_TITLE_HEIGHT = 30;

const ALL_EXERCISE_GROUPS = Array.from({ length: 26 }).map((_, index) =>
  String.fromCharCode(index + "A".charCodeAt(0))
);

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
          <Text light>{meta.muscles[0]}</Text>
          {description && <Text light>{description}</Text>}
        </View>
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

export function SearchExerciseFilterAction({
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

const searchExerciseGroupStyle = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  content: {
    ...StyleUtils.flexColumn(SEARCH_EXERCISE_GAP),
  },
  group: {
    height: SEARCH_EXERCISE_GROUP_TITLE_HEIGHT,
    marginRight: "1%",
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

type ISearchExerciseGroup = {
  group: string;
  exercises: ExerciseMeta[];
};

type SearchExerciseGroupProps = {
  grouping: ISearchExerciseGroup;
  renderExercise: (
    exerciseMeta: ExerciseMeta,
    index: number
  ) => React.ReactNode;
};

export function computeOffsetToScrollTo(
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
    groupsToScrollPast.length * SEARCH_EXERCISE_GROUP_TITLE_HEIGHT;
  return offset;
}

export function SearchExerciseGroup({
  grouping,
  renderExercise,
}: SearchExerciseGroupProps) {
  return (
    <View style={searchExerciseGroupStyle.container}>
      <View style={searchExerciseGroupStyle.group}>
        <Text large>{grouping.group}</Text>
      </View>
      <View style={searchExerciseGroupStyle.content}>
        {grouping.exercises.map((exercise, index) =>
          renderExercise(exercise, index)
        )}
      </View>
    </View>
  );
}

export function filterExerciseResultGroups(
  query: string,
  exerciseMetas: ExerciseMeta[],
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

  const groups = ArrayUtils.groupBy(relevantMetas, (meta) =>
    meta.name.charAt(0)
  ).map(({ key, items }) => ({
    group: key,
    exercises: ArrayUtils.sortBy(items, (meta) => meta.name),
  }));

  return ArrayUtils.sortBy(groups, ({ group }) => group);
}
