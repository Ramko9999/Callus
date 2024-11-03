import {
  View,
  Icon,
  MaterialCommunityIcon,
  IoniconsIcon,
} from "@/components/Themed";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  findNodeHandle,
  Platform,
  StyleSheet,
  UIManager,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { NumberPad, PadTile, RepPad, WeightPad } from "./pads";
import { KeypadType } from "@/interface";

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
    borderTopWidth: 1
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

type KeypadProps = {
  onUpdate: (value: string) => void;
  shouldOpen: boolean;
  close: () => void;
  value?: string;
  type: KeypadType;
};

// todo: can we confirm if this actually works. What does pageY mean on Android vs IOS
function computeTranslation(
  screenHeight: number,
  elementHeight: number,
  pageY: number,
  y: number
) {
  if (Platform.OS === "android") {
    return screenHeight - elementHeight - (pageY - screenHeight);
  } else {
    return screenHeight - elementHeight - (pageY - y);
  }
}

// todo: implement behavior of pushing up content hidden behind keyboard
export function Keypad({
  onUpdate,
  shouldOpen,
  close,
  value,
  type,
}: KeypadProps) {
  const translateY = useSharedValue(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showNumberPad, setShowNumberPad] = useState(true);
  const ref = useAnimatedRef();

  useEffect(() => {
    const { height: screenHeight } = Dimensions.get("window");

    if (shouldOpen) {
      const nativeElement = findNodeHandle(ref.current) as number;
      UIManager.measure(
        nativeElement,
        (x, y, width, elementHeight, pageX, pageY) => {
          translateY.value = withTiming(
            computeTranslation(screenHeight, elementHeight, pageY, y),
            {},
            (isDone) => {
              if (isDone) {
                runOnJS(setHasLoaded)(true);
              }
            }
          );
        }
      );
    } else {
      translateY.value = withTiming(screenHeight, {}, (isDone) => {
        if (isDone) {
          runOnJS(setHasLoaded)(true);
        }
      });
    }
  }, [shouldOpen]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: translateY.value }],
    }),
    []
  );

  const isRepPad = type === KeypadType.REPS;

  return hasLoaded ? (
    <Animated.View style={[styles.animationContainer, animatedStyle]} ref={ref}>
      <View style={styles.keypadContainer}>
        <View style={styles.pad}>
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
          <PadTile onClick={close}>
            <Icon name={"keyboard-o"} size={20} />
          </PadTile>
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
    </Animated.View>
  ) : null;
}
