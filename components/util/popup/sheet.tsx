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

export type BottomSheetRef = {};

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
// todo: fix hide offset lol
export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      children,
      show,
      hide,
      onBackdropPress,
      contentStyle,
      backdropStyle,
      hideOffset,
    },
    ref
  ) => {
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

    useImperativeHandle(ref, () => ({}));

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
);