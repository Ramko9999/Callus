import React, { forwardRef, ForwardedRef } from "react";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { tintColor } from "@/util/color";
import { commonSheetStyles, SheetProps, SheetX, SheetError } from "./common";

const repeatWorkoutConfirmationStyles = StyleSheet.create({
  actions: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingTop: "3%",
    paddingHorizontal: "5%",
    paddingBottom: "6%",
    width: "100%",
  },
  sheetErrorContainer: {
    paddingHorizontal: "5%",
  },
});

type RepeatWorkoutConfirmationProps = SheetProps & {
  isInWorkout: boolean;
  onRepeat: () => void;
};

export const RepeatWorkoutConfirmation = forwardRef(
  (
    {
      show,
      hide,
      onHide,
      onRepeat,
      isInWorkout,
    }: RepeatWorkoutConfirmationProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    const primaryAction = useThemeColoring("primaryAction");
    const neutralAction = tintColor(
      useThemeColoring("primaryViewBackground"),
      0.05
    );

    const handleRepeat = () => {
      if (isInWorkout) {
        // Don't proceed if in workout
        return;
      }
      onRepeat();
      hide();
    };

    return (
      <PopupBottomSheet ref={ref} show={show} onHide={onHide}>
        <View style={commonSheetStyles.sheetHeader}>
          <Text action style={{ fontWeight: 600 }}>
            Repeat workout
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX size={14} />
          </TouchableOpacity>
        </View>

        {isInWorkout && (
          <View style={repeatWorkoutConfirmationStyles.sheetErrorContainer}>
            <SheetError text="Please finish your current workout before trying to start another workout" />
          </View>
        )}

        <View style={repeatWorkoutConfirmationStyles.actions}>
          <TouchableOpacity
            style={[
              commonSheetStyles.sheetButton,
              {
                backgroundColor: primaryAction,
                opacity: isInWorkout ? 0.5 : 1,
              },
            ]}
            onPress={handleRepeat}
            disabled={isInWorkout}
          >
            <Text neutral emphasized>
              Repeat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonSheetStyles.sheetButton,
              { backgroundColor: neutralAction },
            ]}
            onPress={hide}
          >
            <Text neutral emphasized>
              Not now
            </Text>
          </TouchableOpacity>
        </View>
      </PopupBottomSheet>
    );
  }
);
