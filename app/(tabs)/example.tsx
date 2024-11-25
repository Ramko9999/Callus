import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { useEffect, useRef, useState } from "react";
import {
  Gesture,
  GestureDetector,
  Directions,
  TouchableOpacity,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeIn,
  FadeOut,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  withSpring,
  interpolate,
  interpolateColor,
  clamp,
} from "react-native-reanimated";
import { StyleSheet, Pressable, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { Roulette } from "@/components/util/datetime-picker/roulette";
import { DateTimePicker } from "@/components/util/datetime-picker";
import { SignificantAction } from "@/components/theme/actions";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  const [focus, setFocus] = useState(false);
  const { height } = useWindowDimensions();

  return (
    <View
      background
      style={{
        ...StyleUtils.flexColumn(20),
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <View>
        <SignificantAction
          onClick={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          }}
          text="Click me"
        ></SignificantAction>
      </View>
      <DraggableSheet
        renderPreview={() => <Preview />}
        show={true}
        hide={() => {}}
        onBackdropPress={() => {}}
        contentHeight={height * 0.5}
        previewHeight={100}
      >
        <Content />
      </DraggableSheet>
    </View>
  );
}

const previewStyles = StyleSheet.create({
  container: {
    paddingVertical: "5%",
    borderWidth: 1,
    ...StyleUtils.flexRowCenterAll(),
    height: 100,
  },
});

function Preview() {
  return (
    <View background style={previewStyles.container}>
      <Text neutral>Preview</Text>
    </View>
  );
}

const contentStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    alignItems: "center",
    justifyContent: "center",
  },
});

function Content() {
  const { height } = useWindowDimensions();

  return (
    <View
      background
      style={[contentStyles.container, { height: height * 0.5 }]}
    >
      <Text neutral light>
        Top Actions
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "red",
  },
  content: {
    zIndex: 1,
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});

type Props = {
  renderPreview: () => React.ReactNode;
  children: React.ReactNode;
  show: boolean;
  hide: () => void;
  onBackdropPress: () => void;
  contentHeight: number;
  previewHeight: number;
  hideOffset?: number;
};

const DEFAULT_HIDE_OFFSET = 200;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const draggableSheetStyles = StyleSheet.create({
  container: {
    zIndex: 2,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export function DraggableSheet({
  renderPreview,
  children,
  show,
  hide,
  onBackdropPress,
  contentHeight,
  previewHeight,
  hideOffset,
}: Props) {
  const initialTranslationOffset = useSharedValue(
    contentHeight - previewHeight
  );
  const lastTranslation = useSharedValue(0);
  const totalTranslation = useSharedValue(0);

  const transitionOffset = Math.floor((contentHeight - previewHeight) / 2);

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
        totalTranslation.value = withSpring(
          -1 * (contentHeight - previewHeight),
          {
            damping: 25,
          }
        );
      } else {
        totalTranslation.value = withSpring(0, {
          damping: 25,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
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
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            zIndex: 1,
          },
          backdropAnimatedStyle,
        ]}
      />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[draggableSheetStyles.container, animatedStyle]}>
          <Animated.View
            style={[
              { position: "absolute", width: "100%" },
              previewAnimatedStyle,
            ]}
          >
            {renderPreview()}
          </Animated.View>
          <Animated.View style={contentAnimatedStyle}>{children}</Animated.View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}
