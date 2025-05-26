import { View, Text } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import { forwardRef, ForwardedRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { SheetProps, SheetX, commonSheetStyles } from "./common";
import {
  EXERCISE_REPOSITORY,
  isMuscleLowerBody,
  isMusclePartOfArms,
  isMuscleUpperBody,
} from "@/api/exercise";
import { useThemeColoring } from "@/components/Themed";
import { tintColor, convertHexToRGBA } from "@/util/color";
import { DifficultyType } from "@/interface";
import * as Haptics from "expo-haptics";

const EXERCISE_TYPES = [
  DifficultyType.WEIGHT,
  DifficultyType.BODYWEIGHT,
  DifficultyType.WEIGHTED_BODYWEIGHT,
  DifficultyType.TIME,
];

const ALL_MUSCLE_GROUPS = Array.from(
  new Set(
    EXERCISE_REPOSITORY.flatMap(({ primaryMuscles, secondaryMuscles }) => [
      ...primaryMuscles,
      ...secondaryMuscles,
    ])
  )
).sort();

const UPPER_BODY_MUSCLES = ALL_MUSCLE_GROUPS.filter(isMuscleUpperBody);
const LOWER_BODY_MUSCLES = ALL_MUSCLE_GROUPS.filter(isMuscleLowerBody);
const ARMS_MUSCLES = ALL_MUSCLE_GROUPS.filter(isMusclePartOfArms);

const muscleSelectionGroupStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  titleRow: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingBottom: "2%",
  },
  divider: {
    height: 2,
    flex: 1,
  },
  title: {
    marginHorizontal: "3%",
  },
  pillsContainer: {
    ...StyleUtils.flexRowCenterAll(10),
    flexWrap: "wrap",
    width: "100%",
  },
  pill: {
    paddingHorizontal: "4%",
    paddingVertical: "4%",
    borderRadius: 10,
    ...StyleUtils.flexRowCenterAll(),
  },
});

type MuscleSelectionGroupProps = {
  title: string;
  muscles: string[];
  selectedMuscles: string[];
  onSelectMuscle: (muscle: string) => void;
};

function MuscleSelectionGroup({
  title,
  muscles,
  selectedMuscles,
  onSelectMuscle,
}: MuscleSelectionGroupProps) {
  const selectedPillColor = useThemeColoring("primaryAction");
  const neutralPillColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.05
  );
  const dividerColor = convertHexToRGBA(useThemeColoring("lightText"), 0.2);

  return (
    <View style={muscleSelectionGroupStyles.container}>
      <View style={muscleSelectionGroupStyles.titleRow}>
        <View
          style={[
            muscleSelectionGroupStyles.divider,
            { backgroundColor: dividerColor },
          ]}
        />
        <Text light style={muscleSelectionGroupStyles.title}>
          {title}
        </Text>
        <View
          style={[
            muscleSelectionGroupStyles.divider,
            { backgroundColor: dividerColor },
          ]}
        />
      </View>
      <View style={muscleSelectionGroupStyles.pillsContainer}>
        {muscles.map((muscle) => (
          <TouchableOpacity key={muscle} onPress={() => onSelectMuscle(muscle)}>
            <View
              style={[
                muscleSelectionGroupStyles.pill,
                {
                  backgroundColor: selectedMuscles.includes(muscle)
                    ? selectedPillColor
                    : neutralPillColor,
                },
              ]}
            >
              <Text>{muscle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

type ExerciseTypeDisplayInfo = {
  title: string;
  description: string;
};

// todo: split weight into barbell, dumbbell, machine
const EXERCISE_TYPE_TO_DISPLAY_INFO: Record<
  DifficultyType,
  ExerciseTypeDisplayInfo
> = {
  [DifficultyType.WEIGHT]: {
    title: "Weight",
    description: "Bench Press, Military Press",
  },
  [DifficultyType.BODYWEIGHT]: {
    title: "Bodyweight",
    description: "Push-Up, Pull-Up ",
  },
  [DifficultyType.WEIGHTED_BODYWEIGHT]: {
    title: "Weighted Bodyweight",
    description: "Weighted Pull-Up, Weighted Dip",
  },
  [DifficultyType.TIME]: {
    title: "Time",
    description: "L-Sit, Handstand Hold",
  },
  [DifficultyType.ASSISTED_BODYWEIGHT]: {
    title: "Assisted Bodyweight",
    description: "Assisted Pull-Up",
  },
};

type ExerciseTypeSelectionGroupProps = {
  title: string;
  exerciseTypes: string[];
  selectedExerciseTypes: string[];
  onSelectExerciseType: (exerciseType: string) => void;
};

const exerciseTypeSelectionGroupStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    gap: "3%",
  },
  titleRow: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    paddingBottom: "2%",
  },
  divider: {
    height: 1,
    flex: 1,
  },
  title: {
    marginHorizontal: "3%",
  },
  pillsContainer: {
    ...StyleUtils.flexRowCenterAll(10),
    flexWrap: "wrap",
    width: "100%",
  },
  pill: {
    paddingHorizontal: "4%",
    paddingVertical: "4%",
    borderRadius: 10,
    ...StyleUtils.flexColumnCenterAll(5),
  },
});

function ExerciseTypeSelectionGroup({
  title,
  exerciseTypes,
  selectedExerciseTypes,
  onSelectExerciseType,
}: ExerciseTypeSelectionGroupProps) {
  const selectedPillColor = useThemeColoring("primaryAction");
  const neutralPillColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.05
  );
  const dividerColor = convertHexToRGBA(useThemeColoring("lightText"), 0.2);

  return (
    <View style={exerciseTypeSelectionGroupStyles.container}>
      <View style={exerciseTypeSelectionGroupStyles.titleRow}>
        <View
          style={[
            exerciseTypeSelectionGroupStyles.divider,
            { backgroundColor: dividerColor },
          ]}
        />
        <Text light style={exerciseTypeSelectionGroupStyles.title}>
          {title}
        </Text>
        <View
          style={[
            exerciseTypeSelectionGroupStyles.divider,
            { backgroundColor: dividerColor },
          ]}
        />
      </View>
      <View style={exerciseTypeSelectionGroupStyles.pillsContainer}>
        {exerciseTypes.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => onSelectExerciseType(type)}
          >
            <View
              style={[
                exerciseTypeSelectionGroupStyles.pill,
                {
                  backgroundColor: selectedExerciseTypes.includes(type)
                    ? selectedPillColor
                    : neutralPillColor,
                },
              ]}
            >
              <Text>
                {EXERCISE_TYPE_TO_DISPLAY_INFO[type as DifficultyType].title}
              </Text>
              <Text
                small
                {...(selectedExerciseTypes.includes(type)
                  ? {}
                  : { light: true })}
              >
                {
                  EXERCISE_TYPE_TO_DISPLAY_INFO[type as DifficultyType]
                    .description
                }
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const filterExercisesStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingBottom: "10%",
  },
  content: {
    paddingHorizontal: "5%",
  },
  muscleGroupsContainer: {
    ...StyleUtils.flexColumn(),
    gap: "5%",
  },
  actions: {},
});

type FilterExercisesProps = SheetProps & {
  muscleFilters: string[];
  exerciseTypeFilters: string[];
  onUpdateMuscleFilters: (filters: string[]) => void;
  onUpdateExerciseTypeFilters: (filters: string[]) => void;
};

export const FilterExercises = forwardRef(
  (
    {
      show,
      hide,
      onHide,
      muscleFilters,
      exerciseTypeFilters,
      onUpdateMuscleFilters,
      onUpdateExerciseTypeFilters,
    }: FilterExercisesProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    const dangerAction = useThemeColoring("dangerAction");
    const neutralPillColor = tintColor(
      useThemeColoring("primaryViewBackground"),
      0.05
    );

    const handleMuscleSelect = (muscle: string) => {
      if (muscleFilters.includes(muscle)) {
        onUpdateMuscleFilters(muscleFilters.filter((m) => m !== muscle));
      } else {
        onUpdateMuscleFilters([...muscleFilters, muscle]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    const handleExerciseTypeSelect = (type: string) => {
      if (exerciseTypeFilters.includes(type)) {
        onUpdateExerciseTypeFilters(
          exerciseTypeFilters.filter((t) => t !== type)
        );
      } else {
        onUpdateExerciseTypeFilters([...exerciseTypeFilters, type]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    const hasActiveFilters =
      muscleFilters.length > 0 || exerciseTypeFilters.length > 0;

    const handleClearFilters = () => {
      onUpdateMuscleFilters([]);
      onUpdateExerciseTypeFilters([]);
    };

    return (
      <PopupBottomSheet ref={ref} show={show} onHide={onHide}>
        <View style={filterExercisesStyles.container}>
          <View style={commonSheetStyles.sheetHeader}>
            <Text action style={{ fontWeight: 600 }}>
              Filter exercises
            </Text>
            <TouchableOpacity onPress={hide}>
              <SheetX />
            </TouchableOpacity>
          </View>
          <View style={filterExercisesStyles.content}>
            <View style={filterExercisesStyles.muscleGroupsContainer}>
              <MuscleSelectionGroup
                title="Upper Body"
                muscles={UPPER_BODY_MUSCLES}
                selectedMuscles={muscleFilters}
                onSelectMuscle={handleMuscleSelect}
              />
              <MuscleSelectionGroup
                title="Arms"
                muscles={ARMS_MUSCLES}
                selectedMuscles={muscleFilters}
                onSelectMuscle={handleMuscleSelect}
              />
              <MuscleSelectionGroup
                title="Lower Body"
                muscles={LOWER_BODY_MUSCLES}
                selectedMuscles={muscleFilters}
                onSelectMuscle={handleMuscleSelect}
              />
              <ExerciseTypeSelectionGroup
                title="Exercise Type"
                exerciseTypes={EXERCISE_TYPES}
                selectedExerciseTypes={exerciseTypeFilters}
                onSelectExerciseType={handleExerciseTypeSelect}
              />
            </View>
            <View style={filterExercisesStyles.actions}>
              <TouchableOpacity
                style={[
                  commonSheetStyles.sheetButton,
                  {
                    backgroundColor: hasActiveFilters
                      ? dangerAction
                      : neutralPillColor,
                    opacity: hasActiveFilters ? 1 : 0.5,
                  },
                ]}
                onPress={handleClearFilters}
                disabled={!hasActiveFilters}
              >
                <Text neutral emphasized>
                  Clear filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </PopupBottomSheet>
    );
  }
);
