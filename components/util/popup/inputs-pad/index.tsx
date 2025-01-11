import { View } from "@/components/Themed";
import { KeypadType } from "@/interface";
import { useWindowDimensions, StyleSheet } from "react-native";
import { NumericPad } from "./numeric";
import React from "react";
import { DragIndicator } from "@/components/theme/icons";
import { DurationPad } from "./duration";
import { GenericBottomSheet } from "../sheet/generic";

const PAD_HEIGHT_MULTIPLIER = 0.5;

const inputsPadStyles = StyleSheet.create({
  content: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
  },
  drag: {
    paddingTop: "2%",
  },
});

type InputsPad = {
  show: boolean;
  onHide: () => void;
  value: string;
  onUpdate: (value: string) => void;
  type: KeypadType;
};

export function InputsPad({ show, onHide, value, onUpdate, type }: InputsPad) {
  const { height } = useWindowDimensions();

  const shouldUseNumericPad =
    type === KeypadType.REPS || type === KeypadType.WEIGHT;

  return (
    <GenericBottomSheet
      show={show}
      onHide={onHide}
      contentHeight={PAD_HEIGHT_MULTIPLIER * height}
      contentStyle={inputsPadStyles.content}
    >
      <View background style={inputsPadStyles.drag}>
        <DragIndicator />
      </View>
      {shouldUseNumericPad ? (
        <NumericPad
          value={value}
          onUpdate={onUpdate}
          hideDecimal={type === KeypadType.REPS}
          increment={type === KeypadType.REPS ? 1 : 2.5}
        />
      ) : (
        <DurationPad duration={value} onUpdate={onUpdate} />
      )}
    </GenericBottomSheet>
  );
}
