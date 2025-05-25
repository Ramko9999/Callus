import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { forwardRef, ForwardedRef } from "react";
import { tintColor } from "@/util/color";
import { commonSheetStyles, SheetProps, SheetX } from "./common";

const confirmationModalStyles = StyleSheet.create({
  actions: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingTop: "3%",
    paddingHorizontal: "5%",
    paddingBottom: "6%",
    width: "100%",
  },
});

type RoutineStartConfirmationProps = SheetProps & {
  onStart: () => void;
};

export const RoutineStartConfirmation = forwardRef(
  (
    { show, hide, onHide, onStart }: RoutineStartConfirmationProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    const primaryAction = useThemeColoring("primaryAction");
    const neutralAction = tintColor(
      useThemeColoring("primaryViewBackground"),
      0.05
    );

    return (
      <PopupBottomSheet ref={ref} show={show} onHide={onHide}>
        <View style={commonSheetStyles.sheetHeader}>
          <Text action style={{ fontWeight: 600 }}>
            Start routine
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX size={14} />
          </TouchableOpacity>
        </View>
        <View style={confirmationModalStyles.actions}>
          <TouchableOpacity
            style={[
              commonSheetStyles.sheetButton,
              { backgroundColor: primaryAction },
            ]}
            onPress={onStart}
          >
            <Text neutral emphasized>
              Start
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