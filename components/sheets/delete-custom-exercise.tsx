import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { forwardRef, ForwardedRef } from "react";
import { tintColor } from "@/util/color";
import { commonSheetStyles, SheetProps, SheetX } from "./common";

const deleteCustomExerciseStyles = StyleSheet.create({
  actions: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingTop: "3%",
    paddingHorizontal: "5%",
    paddingBottom: "6%",
    width: "100%",
  },
});

type DeleteCustomExerciseProps = SheetProps & {
  onDelete: () => void;
};

export const DeleteCustomExercise = forwardRef(
  (
    { show, hide, onHide, onDelete }: DeleteCustomExerciseProps,
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
            Delete custom exercise
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX />
          </TouchableOpacity>
        </View>
        <View style={deleteCustomExerciseStyles.actions}>
          <Text>
            This custom exercise cannot be recovered after it is deleted. Are
            you sure you want to delete it?
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
