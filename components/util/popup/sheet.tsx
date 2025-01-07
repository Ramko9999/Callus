import { StyleSheet, Pressable, ViewStyle } from "react-native";
import Animated, {
  clamp,
  FadeIn,
  FadeOut,
  interpolate,
  interpolateColor,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useThemeColoring } from "@/components/Themed";
import { forwardRef, useImperativeHandle } from "react";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BACKDROP_OPACITY = "rgba(0, 0, 0, 0.7)";

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: BACKDROP_OPACITY,
  },
  content: {
    zIndex: 1,
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});

type BottomSheetProps = {
  children: React.ReactNode;
  show: boolean;
  hide: () => void;
  onBackdropPress: () => void;
  contentStyle?: ViewStyle;
  backdropStyle?: ViewStyle;
  hideOffset?: number;
};

const DEFAULT_HIDE_OFFSET = 200;

// todo: fix animation, make it faster
// todo: fix bug with children bottom sheets not taking up full space
// todo: fix hide offset lol
export function BottomSheet({
  children,
  show,
  hide,
  onBackdropPress,
  contentStyle,
  backdropStyle,
  hideOffset,
}: BottomSheetProps) {
  const offset = hideOffset ?? DEFAULT_HIDE_OFFSET;
  const translation = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const panGesture = Gesture.Pan()
    .onUpdate(({ translationY }) => {
      if (translationY > 0) {
        translation.value = translationY;
      }
    })
    .onEnd(({ translationY }) => {
      if (translationY > offset) {
        translation.value = 0;
        runOnJS(hide)();
      } else {
        translation.value = withSpring(0, {
          damping: 25,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translation.value }],
  }));

  const primaryBackgroundColor = useThemeColoring("primaryViewBackground");

  return (
    show && (
      <>
        <AnimatedPressable
          style={styles.backdrop}
          onPress={onBackdropPress}
          entering={FadeIn}
          exiting={FadeOut}
        />
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.content,
              animatedStyle,
              contentStyle,
              {
                backgroundColor: primaryBackgroundColor,
                paddingBottom: insets.bottom,
              },
            ]}
            entering={SlideInDown.springify().damping(25)}
            exiting={SlideOutDown}
          >
            {children}
          </Animated.View>
        </GestureDetector>
      </>
    )
  );
}

const previewableBottomSheetStyles = StyleSheet.create({
  container: {
    zIndex: 2,
    position: "absolute",
    bottom: 100,
    width: "100%",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  preview: { position: "absolute", width: "100%" },
});

type PreviewableBottomSheetProps = {
  renderPreview: () => React.ReactNode;
  children: React.ReactNode;
  contentHeight: number;
  previewHeight: number;
  onOpenContent: () => void;
  onCloseContent: () => void;
};

export type PreviewableBottomSheetRef = {
  openContent: () => void;
  hideContent: () => void;
};

export const PreviewableBottomSheet = forwardRef<
  PreviewableBottomSheetRef,
  PreviewableBottomSheetProps
>(
  (
    {
      renderPreview,
      children,
      contentHeight,
      previewHeight,
      onOpenContent,
      onCloseContent,
    }: PreviewableBottomSheetProps,
    ref
  ) => {
    const initialTranslationOffset = useSharedValue(
      contentHeight - previewHeight
    );
    const lastTranslation = useSharedValue(0);
    const totalTranslation = useSharedValue(0);

    const transitionOffset = Math.floor((contentHeight - previewHeight) / 2);

    const openContent = () => {
      totalTranslation.value = withSpring(
        -1 * (contentHeight - previewHeight),
        { damping: 25 }
      );
      onOpenContent();
    };

    const hideContent = () => {
      totalTranslation.value = withSpring(0, { damping: 25 });
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
        const isOnlyRevealingContent =
          newTotalTranslation + initialTranslationOffset.value >= 0;
        if (isOnlyRevealingContent) {
          totalTranslation.value = newTotalTranslation;
          lastTranslation.value = translationY;
        }
      })
      .onEnd(() => {
        if (Math.abs(totalTranslation.value) > transitionOffset) {
          openContent();
        } else {
          hideContent();
        }
      })
      .runOnJS(true);

    const containerAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: totalTranslation.value + initialTranslationOffset.value },
      ],
    }));

    const previewAnimatedStyle = useAnimatedStyle(
      () => ({
        opacity: interpolate(
          clamp(Math.abs(totalTranslation.value), 0, transitionOffset),
          [0, transitionOffset],
          [1, 0]
        ),
      }),
      [contentHeight, previewHeight]
    );

    const contentAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        clamp(Math.abs(totalTranslation.value), 0, transitionOffset),
        [0, transitionOffset],
        [0, 1]
      ),
    }));

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
      display:
        Math.abs(totalTranslation.value) < transitionOffset ? "none" : "flex",
      backgroundColor: interpolateColor(
        clamp(
          Math.abs(totalTranslation.value),
          transitionOffset,
          contentHeight - previewHeight
        ),
        [transitionOffset, contentHeight - previewHeight],
        ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.7)"]
      ),
    }));

    return (
      <>
        <AnimatedPressable
          style={[previewableBottomSheetStyles.backdrop, backdropAnimatedStyle]}
        />
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              previewableBottomSheetStyles.container,
              containerAnimatedStyle,
              { backgroundColor: useThemeColoring("primaryViewBackground") },
            ]}
          >
            <Animated.View
              style={[
                previewableBottomSheetStyles.preview,
                previewAnimatedStyle,
              ]}
            >
              {renderPreview()}
            </Animated.View>
            <Animated.View style={contentAnimatedStyle}>
              {children}
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </>
    );
  }
);
