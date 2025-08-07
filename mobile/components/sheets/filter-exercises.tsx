import { View, Text } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheetModal } from "@/components/util/popup/sheet";
import { forwardRef, ForwardedRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { SheetX, commonSheetStyles } from "./common";
import {
  getExerciseTypeDisplayInfo,
  isMuscleLowerBody,
  isMusclePartOfArms,
  isMuscleUpperBody,
  ALL_MUSCLES,
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

const UPPER_BODY_MUSCLES = ALL_MUSCLES.filter(isMuscleUpperBody);
const LOWER_BODY_MUSCLES = ALL_MUSCLES.filter(isMuscleLowerBody);
const ARMS_MUSCLES = ALL_MUSCLES.filter(isMusclePartOfArms);

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
                {getExerciseTypeDisplayInfo(type as DifficultyType).title}
              </Text>
              <Text
                small
                {...(selectedExerciseTypes.includes(type)
                  ? {}
                  : { light: true })}
              >
                {getExerciseTypeDisplayInfo(type as DifficultyType).description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const filterExercisesSheetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingBottom: "10%",
  },
  content: {
    paddingHorizontal: "5%",
  },
  muscleGroupsContainer: {
    ...StyleUtils.flexColumn(),
    gap: "1%",
  },
  actions: {},
});

type FilterExercisesSheetProps = {
  muscleFilters: string[];
  exerciseTypeFilters: string[];
  onUpdateMuscleFilters: (filters: string[]) => void;
  onUpdateExerciseTypeFilters: (filters: string[]) => void;
};

export const FilterExercisesSheet = forwardRef(
  (
    {
      muscleFilters,
      exerciseTypeFilters,
      onUpdateMuscleFilters,
      onUpdateExerciseTypeFilters,
    }: FilterExercisesSheetProps,
    ref: ForwardedRef<BottomSheetModal>
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

    const header = (
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          Filter exercises
        </Text>
        <TouchableOpacity onPress={() => (ref as any)?.current?.dismiss()}>
          <SheetX />
        </TouchableOpacity>
      </View>
    );

    return (
      <PopupBottomSheetModal ref={ref} header={header}>
        <View style={filterExercisesSheetStyles.container}>
          <View style={filterExercisesSheetStyles.content}>
            <View style={filterExercisesSheetStyles.muscleGroupsContainer}>
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
            <View style={filterExercisesSheetStyles.actions}>
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
      </PopupBottomSheetModal>
    );
  }
);
