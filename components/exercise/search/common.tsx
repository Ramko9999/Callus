import React, { useCallback } from "react";
import { StyleUtils } from "@/util/styles";
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  useWindowDimensions,
  TextInput as RNTextInput,
  GestureResponderEvent,
  Pressable,
  Platform,
} from "react-native";
import { View, Text, useThemeColoring, TextInput } from "@/components/Themed";
import { tintColor } from "@/util/color";
import { X, Plus, Search } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { DifficultyType, ExerciseMeta } from "@/interface";
import { ExerciseImage } from "@/components/exercise/image";

export const SEARCH_EXERCISE_HEIGHT = 55;

const EXERCISE_TYPE_TO_DISPLAY_INFO: Record<DifficultyType, { title: string }> =
  {
    [DifficultyType.WEIGHT]: { title: "Weight" },
    [DifficultyType.BODYWEIGHT]: { title: "Bodyweight" },
    [DifficultyType.WEIGHTED_BODYWEIGHT]: { title: "Weighted Bodyweight" },
    [DifficultyType.TIME]: { title: "Time" },
    [DifficultyType.ASSISTED_BODYWEIGHT]: { title: "Assisted Bodyweight" },
  };

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
  const lightText = useThemeColoring("lightText");

  return (
    <View
      style={[
        searchBarStyles.container,
        Platform.OS === "ios" ? { paddingVertical: "2%" } : {},
        style,
      ]}
    >
      <View style={searchBarStyles.search}>
        <Search size={16} color={lightText} />
        <TextInput
          neutral
          placeholder="Search for an exercise"
          placeholderTextColor={lightText}
          onChangeText={onChangeSearchQuery}
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          multiline={false}
          style={{ flex: 1 }}
        />
      </View>
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

export function ExerciseGridItem({ exercise, summary }: ExerciseGridItemProps) {
  const { height } = useWindowDimensions();
  const imageBackgroundColor = tintColor(
    useThemeColoring("appBackground"),
    0.05
  );
  const descriptionColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const fallbackColor = useThemeColoring("lightText");

  return (
    <>
      <View
        style={[
          exerciseGridItemStyles.imageContainer,
          { backgroundColor: imageBackgroundColor },
        ]}
      >
        <ExerciseImage
          metaId={exercise.metaId}
          imageStyle={{
            height: height * 0.2,
            width: height * 0.2,
            borderRadius: 10,
          }}
          fallbackSize={height * 0.2}
          fallbackColor={fallbackColor}
        />
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
