import { View } from "@/components/Themed";
import { KeypadType } from "@/interface";
import { useWindowDimensions, ViewStyle, StyleSheet } from "react-native";
import { NumericPad } from "./numeric";
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Backdrop, BACKDROP_VISIBLE_COLOR } from "../util";
import React, { useEffect } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DragIndicator } from "@/components/theme/icons";

const PAD_HEIGHT_MULTIPLIER = 0.5;

const inputsPadStyles = StyleSheet.create({
  content: {
    zIndex: 2,
    position: "absolute",
    width: "100%",
    bottom: 0,
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
  contentStyle?: ViewStyle;
};

export function InputsPad({
  show,
  onHide,
  value,
  onUpdate,
  type,
  contentStyle,
}: InputsPad) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const padHeight = PAD_HEIGHT_MULTIPLIER * height;
  const maxPadTranslation = padHeight + insets.bottom;

  const lastTranslation = useSharedValue(0);
  const totalTranslation = useSharedValue(maxPadTranslation);

  useEffect(() => {
    if (show) {
      totalTranslation.value = withTiming(0);
    }
  }, [show]);

  const hideInputsPad = () => {
    totalTranslation.value = withTiming(maxPadTranslation, {}, (done) => {
      if (done) {
        runOnJS(onHide)();
      }
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => (lastTranslation.value = 0))
    .onUpdate(({ translationY }) => {
      const newTotalTranslation =
        totalTranslation.value + translationY - lastTranslation.value;
      if (newTotalTranslation >= 0) {
        totalTranslation.value = newTotalTranslation;
      }
      lastTranslation.value = translationY;
    })
    .onEnd(() => {
      if (totalTranslation.value > maxPadTranslation / 2) {
        hideInputsPad();
      } else {
        totalTranslation.value = withTiming(0);
      }
    })
    .runOnJS(true);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      totalTranslation.value,
      [0, maxPadTranslation],
      [BACKDROP_VISIBLE_COLOR, "rgba(0, 0, 0, 0)"]
    ),
  }));

  const inputsPadAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: totalTranslation.value }],
  }));

  return (
    show && (
      <>
        <Backdrop
          animatedStyle={backdropAnimatedStyle}
          onClick={hideInputsPad}
        />
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              inputsPadStyles.content,
              inputsPadAnimatedStyle,
              { height: padHeight, paddingBottom: insets.bottom },
            ]}
          >
            <View background style={inputsPadStyles.drag}>
              <DragIndicator />
            </View>
            <NumericPad
              value={value}
              onUpdate={onUpdate}
              hideDecimal={type === KeypadType.REPS}
              increment={type === KeypadType.REPS ? 1 : 2.5}
            />
          </Animated.View>
        </GestureDetector>
      </>
    )
  );
}
