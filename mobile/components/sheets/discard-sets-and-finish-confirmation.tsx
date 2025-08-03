import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { forwardRef, ForwardedRef } from "react";
import { tintColor } from "@/util/color";
import { commonSheetStyles, SheetProps, SheetX } from "./common";

const discardSetsAndFinishConfirmationStyles = StyleSheet.create({
  actions: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingTop: "3%",
    paddingHorizontal: "5%",
    paddingBottom: "6%",
    width: "100%",
  },
});

type DiscardSetsAndFinishConfirmationProps = SheetProps & {
  onDiscard: () => void;
};

export const DiscardSetsAndFinishConfirmation = forwardRef(
  (
    { show, hide, onHide, onDiscard }: DiscardSetsAndFinishConfirmationProps,
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
            Finish workout
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX size={14} />
          </TouchableOpacity>
        </View>
        <View style={discardSetsAndFinishConfirmationStyles.actions}>
          <Text>
            There are still sets remaining in your workout. Do you want to
            discard them and finish the workout?
          </Text>
          <TouchableOpacity
            style={[
              commonSheetStyles.sheetButton,
              { backgroundColor: dangerAction },
            ]}
            onPress={onDiscard}
          >
            <Text neutral emphasized>
              Discard and finish
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
