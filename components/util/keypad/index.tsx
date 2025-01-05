import {
  View,
  Icon,
  MaterialCommunityIcon,
  IoniconsIcon,
} from "@/components/Themed";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { NumberPad, PadTile, RepPad, WeightPad } from "./pads";
import { KeypadType } from "@/interface";
import { BottomSheet } from "../popup";

const styles = StyleSheet.create({
  keypad: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  keypadRow: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
    borderTopWidth: 1,
  },
  animationContainer: {
    position: "absolute",
    width: "100%",
    height: "40%",
  },
  keypadContainer: {
    paddingVertical: 20,
    display: "flex",
    flexDirection: "row",
    paddingRight: "2%",
    height: "100%",
    borderTopWidth: 1,
  },
  pad: {
    flex: 1,
  },
  keypadColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
});

const keypadStyles = StyleSheet.create({
  backdrop: {
    backgroundColor: "transparent",
  },
});

type KeypadProps = {
  onUpdate: (value: string) => void;
  show: boolean;
  close: () => void;
  value?: string;
  type: KeypadType;
};

export function Keypad({ onUpdate, show, close, value, type }: KeypadProps) {
  const [showNumberPad, setShowNumberPad] = useState(true);

  const isRepPad = type === KeypadType.REPS;
  return (
    <BottomSheet
      show={show}
      hide={close}
      onBackdropPress={close}
      backdropStyle={keypadStyles.backdrop}
    >
      <View background style={styles.keypadRow}>
        <View background style={styles.pad}>
          {showNumberPad ? (
            <NumberPad
              value={value as string}
              onUpdate={onUpdate}
              hideDecimal={isRepPad}
            />
          ) : isRepPad ? (
            <RepPad value={value as string} onUpdate={onUpdate} />
          ) : (
            <WeightPad value={value as string} onUpdate={onUpdate} />
          )}
        </View>
        <View style={styles.keypadColumn}>
          <PadTile
            onClick={() => {
              setShowNumberPad((showNumberPad) => !showNumberPad);
            }}
          >
            {showNumberPad ? (
              <MaterialCommunityIcon name="plus-minus-variant" size={20} />
            ) : (
              <IoniconsIcon name="keypad" size={20} />
            )}
          </PadTile>
        </View>
      </View>
    </BottomSheet>
  );
}
