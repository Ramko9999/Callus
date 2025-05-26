import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { forwardRef, ForwardedRef } from "react";
import { tintColor } from "@/util/color";
import { commonSheetStyles, SheetProps, SheetX } from "./common";

const workoutDeleteConfirmationStyles = StyleSheet.create({
  actions: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingTop: "3%",
    paddingHorizontal: "5%",
    paddingBottom: "6%",
    width: "100%",
  }
});

type WorkoutDeleteConfirmationProps = SheetProps & {
  onDelete: () => void;
};

export const WorkoutDeleteConfirmation = forwardRef(
  (
    { show, hide, onHide, onDelete }: WorkoutDeleteConfirmationProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    const dangerAction = useThemeColoring("dangerAction");
    const neutralAction = tintColor(
      useThemeColoring("primaryViewBackground"),
      0.05
    );

    return (
      <PopupBottomSheet ref={ref} show={show} onHide={onHide}>
        <View style={commonSheetStyles.sheetHeader}>
          <Text action style={{ fontWeight: 600 }}>
            Delete workout
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX size={14} />
          </TouchableOpacity>
        </View>
        <View style={workoutDeleteConfirmationStyles.actions}>
          <Text>
            This workout cannot be recovered after it is deleted. Are you sure you
            want to delete it?
          </Text>
          <TouchableOpacity
            style={[
              commonSheetStyles.sheetButton,
              { backgroundColor: dangerAction },
            ]}
            onPress={onDelete}
          >
            <Text neutral emphasized>
              Delete
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