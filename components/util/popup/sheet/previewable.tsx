import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  clamp,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { forwardRef, useImperativeHandle } from "react";
import React from "react";
import {
  Backdrop,
  BACKDROP_VISIBLE_COLOR,
  FULL_SHEET_HEIGHT_MULTIPLIER,
  PREVIEW_HEIGHT,
} from "../util";
import { TAB_BAR_HEIGHT } from "@/util/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColoring, View } from "@/components/Themed";
import { DragIndicator } from "@/components/theme/icons";

const previewableSheetStyles = StyleSheet.create({
  container: {
    zIndex: 1,
    position: "absolute",
    width: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
  },
  drag: {
    position: "absolute",
    width: "100%",
    top: 10,
  },
  preview: { width: "100%", position: "absolute" },
  content: {
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});

type PreviewableSheetProps = {
  renderPreview: () => React.ReactNode;
  children: React.ReactNode;
  onOpenContent: () => void;
  onCloseContent: () => void;
};

export type PreviewableSheetRef = {
  openContent: () => void;
  hideContent: () => void;
};

export const PreviewableSheet = forwardRef<
  PreviewableSheetRef,
  PreviewableSheetProps
>(
  (
    {
      renderPreview,
      children,
      onOpenContent,
      onCloseContent,
    }: PreviewableSheetProps,
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const dimensions = useWindowDimensions();

    const contentHeight = dimensions.height * FULL_SHEET_HEIGHT_MULTIPLIER;
    const previewTranslation = PREVIEW_HEIGHT + TAB_BAR_HEIGHT;
    const contentTranslation = contentHeight;
    const translationOffset = contentTranslation - previewTranslation;

    const lastTranslation = useSharedValue(0);
    const totalTranslation = useSharedValue(0);

    const transitionThreshold = Math.floor(translationOffset / 2);

    const openContent = () => {
      totalTranslation.value = withTiming(-1 * translationOffset);
      onOpenContent();
    };

    const hideContent = () => {
      totalTranslation.value = withTiming(0);
      onCloseContent();
    };

    useImperativeHandle(ref, () => ({
      openContent,
      hideContent,
    }));

    const panGesture = Gesture.Pan()
      .onStart(() => {
        lastTranslation.value = 0;
      })
      .onUpdate(({ translationY }) => {
        const newTotalTranslation =
          totalTranslation.value - lastTranslation.value + translationY;
        if (
          newTotalTranslation <= 0 &&
          newTotalTranslation + translationOffset >= 0
        ) {
          totalTranslation.value = newTotalTranslation;
          lastTranslation.value = translationY;
        }
      })
      .onEnd(() => {
        if (Math.abs(totalTranslation.value) > transitionThreshold) {
          openContent();
        } else {
          hideContent();
        }
      })
      .runOnJS(true);

    const containerAnimatedStyle = useAnimatedStyle(() => ({
      transform:
        totalTranslation.value === 0
          ? []
          : [{ translateY: totalTranslation.value + translationOffset }],
      bottom: totalTranslation.value === 0 ? TAB_BAR_HEIGHT : 0,
      height: totalTranslation.value === 0 ? PREVIEW_HEIGHT : contentHeight,
    }));

    const previewAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        clamp(Math.abs(totalTranslation.value), 0, transitionThreshold),
        [0, transitionThreshold],
        [1, 0]
      ),
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        clamp(Math.abs(totalTranslation.value), 0, transitionThreshold),
        [0, transitionThreshold],
        [0, 1]
      ),
      display: totalTranslation.value === 0 ? "none" : "flex",
    }));

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
      display:
        Math.abs(totalTranslation.value) < transitionThreshold
          ? "none"
          : "flex",
      backgroundColor: interpolateColor(
        clamp(
          Math.abs(totalTranslation.value),
          transitionThreshold,
          translationOffset
        ),
        [transitionThreshold, translationOffset],
        ["rgba(0, 0, 0, 0)", BACKDROP_VISIBLE_COLOR]
      ),
    }));

    return (
      <>
        <Backdrop animatedStyle={backdropAnimatedStyle} onClick={hideContent} />
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              previewableSheetStyles.container,
              containerAnimatedStyle,
              { backgroundColor: useThemeColoring("primaryViewBackground") },
            ]}
          >
            <Animated.View
              style={[previewableSheetStyles.preview, previewAnimatedStyle]}
            >
              {renderPreview()}
            </Animated.View>
            <Animated.View
              style={[
                previewableSheetStyles.content,
                contentAnimatedStyle,
                {
                  paddingBottom: insets.bottom,
                  height: contentHeight,
                },
              ]}
            >
              {children}
            </Animated.View>
            <View style={previewableSheetStyles.drag}>
              <DragIndicator />
            </View>
          </Animated.View>
        </GestureDetector>
      </>
    );
  }
);
