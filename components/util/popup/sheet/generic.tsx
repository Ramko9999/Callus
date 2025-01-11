import { StyleSheet, ViewStyle } from "react-native";
import { Backdrop, BACKDROP_VISIBLE_COLOR } from "../util";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import React from "react";

const styles = StyleSheet.create({
  content: {
    zIndex: 1,
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});

export type GenericBottomSheetRef = {
  hideSheet: () => void;
};

type GenericBottomSheetProps = {
  show: boolean;
  onHide: () => void;
  children: React.ReactNode;
  contentHeight: number;
  contentStyle?: ViewStyle;
};

export const GenericBottomSheet = forwardRef<
  GenericBottomSheetRef,
  GenericBottomSheetProps
>(({ show, onHide, children, contentHeight, contentStyle }, ref) => {
  const insets = useSafeAreaInsets();

  const maxTranslation = contentHeight + insets.bottom;

  const lastTranslation = useSharedValue(0);
  const totalTranslation = useSharedValue(maxTranslation);

  useEffect(() => {
    if (show) {
      totalTranslation.value = withTiming(0);
    }
  }, [show]);

  const hideSheet = () => {
    totalTranslation.value = withTiming(maxTranslation, {}, (done) => {
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
      if (totalTranslation.value > maxTranslation / 2) {
        hideSheet();
      } else {
        totalTranslation.value = withTiming(0);
      }
    })
    .runOnJS(true);

  useImperativeHandle(ref, () => ({ hideSheet }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      totalTranslation.value,
      [0, maxTranslation],
      [BACKDROP_VISIBLE_COLOR, "rgba(0, 0, 0, 0)"]
    ),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: totalTranslation.value }],
  }));

  return (
    show && (
      <>
        <Backdrop animatedStyle={backdropAnimatedStyle} onClick={hideSheet} />
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.content,
              contentStyle,
              contentAnimatedStyle,
              { height: contentHeight, paddingBottom: insets.bottom },
            ]}
          >
            {children}
          </Animated.View>
        </GestureDetector>
      </>
    )
  );
});
