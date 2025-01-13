import { forwardRef, useImperativeHandle, useRef } from "react";
import { GenericBottomSheet, GenericBottomSheetRef } from "./generic";
import { useWindowDimensions, StyleSheet } from "react-native";
import { useThemeColoring, View } from "@/components/Themed";
import { DragIndicator } from "@/components/theme/icons";
import { FULL_SHEET_HEIGHT_MULTIPLIER } from "../util";

const fullBottomSheetStyles = StyleSheet.create({
  drag: {
    position: "absolute",
    top: 10,
    width: "100%",
  },
  content: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
  },
});

export type FullBottomSheetRef = GenericBottomSheetRef;

type FullBottomSheetProps = {
  show: boolean;
  onHide: () => void;
  children: React.ReactNode;
};

export const FullBottomSheet = forwardRef<
  FullBottomSheetRef,
  FullBottomSheetProps
>(({ show, onHide, children }, ref) => {
  const genericBottomSheetRef = useRef<GenericBottomSheetRef>(null);
  const bgColor = useThemeColoring("primaryViewBackground");
  const { height } = useWindowDimensions();

  useImperativeHandle(ref, () => ({
    hideSheet: () => genericBottomSheetRef.current?.hideSheet(),
  }));

  return (
    <GenericBottomSheet
      ref={genericBottomSheetRef}
      show={show}
      onHide={onHide}
      contentHeight={FULL_SHEET_HEIGHT_MULTIPLIER * height}
      contentStyle={{
        ...fullBottomSheetStyles.content,
        backgroundColor: bgColor,
      }}
    >
      {children}
      <View style={fullBottomSheetStyles.drag}>
        <DragIndicator />
      </View>
    </GenericBottomSheet>
  );
});
