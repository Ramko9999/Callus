import { StyleSheet } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { TouchableOpacity } from "react-native";
import { useCallback, forwardRef } from "react";
import { tintColor } from "@/util/color";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { commonSheetStyles, SheetProps } from "./common";
import { SheetX } from "./common";
import { DifficultyType } from "@/interface";
import {
  getExerciseTypeDisplayInfo,
  getExerciseTypeExplanation,
} from "@/api/exercise";

const setExerciseTypeSheetStyles = StyleSheet.create({
  container: {
    paddingBottom: "10%",
  },
  optionsContainer: {
    ...StyleUtils.flexColumn(),
  },
  exerciseTypeOption: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: "5%",
    marginRight: "7%",
    paddingVertical: "4%",
    borderBottomWidth: 1,
  },
  exerciseTypeContent: {
    ...StyleUtils.flexColumn(4),
    flex: 0.9,
  },
  selectedExerciseTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

const EXERCISE_TYPES = [
  DifficultyType.BODYWEIGHT,
  DifficultyType.WEIGHT,
  DifficultyType.WEIGHTED_BODYWEIGHT,
  DifficultyType.TIME,
];

type SetExerciseTypeSheetProps = SheetProps & {
  selectedExerciseType: DifficultyType;
  onSelect: (exerciseType: DifficultyType) => void;
};

export const SetExerciseTypeSheet = forwardRef<
  BottomSheet,
  SetExerciseTypeSheetProps
>(({ show, hide, onHide, selectedExerciseType, onSelect }, ref) => {
  const borderColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.05
  );
  const primaryActionColor = useThemeColoring("primaryAction");

  const handleSelectExerciseType = useCallback(
    (exerciseType: DifficultyType) => {
      onSelect(exerciseType);
      hide();
    },
    [onSelect, hide]
  );

  return (
    <PopupBottomSheet ref={ref} show={show} onHide={onHide}>
      <View style={setExerciseTypeSheetStyles.container}>
        <View style={commonSheetStyles.sheetHeader}>
          <Text action style={{ fontWeight: 600 }}>
            Select exercise type
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX />
          </TouchableOpacity>
        </View>
        <View style={setExerciseTypeSheetStyles.optionsContainer}>
          {EXERCISE_TYPES.map((exerciseType) => (
            <TouchableOpacity
              key={exerciseType}
              style={[
                setExerciseTypeSheetStyles.exerciseTypeOption,
                { borderBottomColor: borderColor },
              ]}
              onPress={() => handleSelectExerciseType(exerciseType)}
            >
              <View style={setExerciseTypeSheetStyles.exerciseTypeContent}>
                <Text>{getExerciseTypeDisplayInfo(exerciseType).title}</Text>
                <Text light small>
                  {getExerciseTypeExplanation(exerciseType)}
                </Text>
              </View>
              {exerciseType === selectedExerciseType && (
                <View
                  style={[
                    setExerciseTypeSheetStyles.selectedExerciseTypeIndicator,
                    {
                      backgroundColor: primaryActionColor,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </PopupBottomSheet>
  );
});
