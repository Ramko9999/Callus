import React, { useCallback, useEffect, useRef, memo } from "react";
import { View, Text } from "@/components/Themed";
import {
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { convertHexToRGBA, tintColor } from "@/util/color";
import { Svg, Line, G, Polygon, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  SharedValue,
  useAnimatedProps,
  interpolate,
  withDecay,
  useDerivedValue,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { commonSheetStyles } from "@/components/sheets/common";
import { StyleUtils } from "@/util/styles";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { commonSlideStyles } from "./common";

const BASE_WEIGHT = 150;

type ScaleTickProps = {
  index: number;
  x: number;
  y: number;
  height: number;
  translateX: SharedValue<number>;
  strokeWidth: number;
  parentWidth: number;
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

function ScaleTick({
  x,
  y,
  height,
  translateX,
  strokeWidth,
  parentWidth,
}: ScaleTickProps) {
  const tickColor = useThemeColoring("primaryText");

  const animatedProps = useAnimatedProps(() => {
    const distance = Math.min(
      Math.abs(x + translateX.value - parentWidth),
      parentWidth / 2
    );
    const opacity = interpolate(distance, [0, parentWidth / 2], [1, 0]);
    return { opacity };
  });

  return (
    <>
      <AnimatedRect
        x={x}
        y={y - height}
        width={strokeWidth}
        height={height}
        fill={tickColor}
        animatedProps={animatedProps}
      />
    </>
  );
}

type ScaleIndicatorProps = {
  width: number;
  height: number;
};

function ScaleIndicator({ width, height }: ScaleIndicatorProps) {
  const triangleWidth = width * 0.5;
  const triangleHeight = height * 0.25;
  const lineHeight = height - triangleHeight;
  const indicatorCenterX = width / 2;
  const primaryAction = useThemeColoring("primaryAction");

  return (
    <Svg width={width} height={height}>
      <G>
        <Polygon
          points={`
            ${indicatorCenterX - triangleWidth / 2},0
            ${indicatorCenterX + triangleWidth / 2},0
            ${indicatorCenterX},${triangleHeight}
          `}
          fill={primaryAction}
        />
        {/* Line from triangle tip down */}
        <Line
          x1={indicatorCenterX}
          y1={triangleHeight - 8}
          x2={indicatorCenterX}
          y2={triangleHeight + lineHeight - 2}
          stroke={primaryAction}
          strokeWidth={5}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);

const scaleStyles = StyleSheet.create({
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...StyleUtils.flexRowCenterAll(),
  },
  container: {},
});

type ScaleProps = {
  initialWeight: number;
  width: number;
  height: number;
  tickBaseHeight: number;
  onChangeWeight: (weight: number) => void;
};

const Scale = memo(
  function Scale({
    initialWeight,
    width,
    height,
    tickBaseHeight,
    onChangeWeight,
  }: ScaleProps) {
    const strokeWidth = 5;
    const dashPattern = [2, 0.5, 1, 0.5];

    const dashesPerWidth = 16;

    const dashSpacing = (width - strokeWidth * dashesPerWidth) / dashesPerWidth;

    const upperBoundScroll = width * 25;
    const lowerBoundScroll = width * -75;

    const totalDashes = dashesPerWidth * 2;
    const yBase = height - 2;

    const initialScrollX = useSharedValue(
      (BASE_WEIGHT - initialWeight) * width * 0.25
    );
    const scrollX = useSharedValue(
      (BASE_WEIGHT - initialWeight) * width * 0.25
    );

    const handleWeightChange = useCallback((scrollX: number) => {
      const weightDelta = BASE_WEIGHT - scrollX / (width * 0.25);
      onChangeWeight(parseFloat(weightDelta.toFixed(1)));
    }, []);

    useAnimatedReaction(
      () => scrollX,
      (current) => {
        runOnJS(handleWeightChange)(current.value);
      }
    );

    const translateX = useDerivedValue(() => {
      if (scrollX.value === upperBoundScroll) {
        return width;
      }
      if (scrollX.value === lowerBoundScroll) {
        return -width;
      }
      if (
        scrollX.value >= upperBoundScroll - width * 0.5 ||
        scrollX.value <= lowerBoundScroll + width * 0.5
      ) {
        return scrollX.value % width;
      }
      return scrollX.value % (width / 2);
    });

    const panGesture = Gesture.Pan()
      .onStart(() => {
        initialScrollX.value = scrollX.value;
      })
      .onUpdate((event) => {
        const newScrollX = initialScrollX.value + event.translationX;
        const clampedScrollX = Math.max(
          lowerBoundScroll,
          Math.min(newScrollX, upperBoundScroll)
        );
        scrollX.value = clampedScrollX;
      })
      .onEnd((event) => {
        const velocity = Math.abs(event.velocityX) > 100 ? event.velocityX : 0;
        scrollX.value = withDecay({
          velocity: velocity,
          clamp: [lowerBoundScroll, upperBoundScroll],
        });
      });

    const dashes = Array.from({ length: totalDashes + 1 }).map((_, i) => {
      const patternIdx = i % dashPattern.length;
      const dashHeight = dashPattern[patternIdx] * tickBaseHeight;
      const x = i * (dashSpacing + strokeWidth);
      return (
        <ScaleTick
          key={i}
          index={i}
          x={x}
          y={yBase}
          height={dashHeight}
          translateX={translateX}
          strokeWidth={strokeWidth}
          parentWidth={width}
        />
      );
    });

    const animatedGProps = useAnimatedProps(() => ({
      transform: [{ translateX: translateX.value - width / 2 }],
    }));

    return (
      <GestureDetector gesture={panGesture}>
        <View style={scaleStyles.container}>
          <Svg width={width} height={height}>
            <AnimatedG animatedProps={animatedGProps}>{dashes}</AnimatedG>
          </Svg>
          <View style={scaleStyles.indicator}>
            <ScaleIndicator height={height} width={60} />
          </View>
        </View>
      </GestureDetector>
    );
  },
  (prevProps: ScaleProps, nextProps: ScaleProps) => {
    return (
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.tickBaseHeight === nextProps.tickBaseHeight &&
      prevProps.onChangeWeight === nextProps.onChangeWeight
    );
  }
);

const onboardingWeightStyles = StyleSheet.create({
  inputContainer: {
    ...StyleUtils.flexColumnCenterAll(20),
    marginTop: "40%",
    marginBottom: "8%",
    paddingHorizontal: "3%",
    paddingVertical: "3%",
  },
  input: {
    fontWeight: "600",
    fontSize: 60,
    backgroundColor: "transparent",
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: "5%",
    paddingVertical: "5%",
    borderTopWidth: 1,
    ...StyleUtils.flexColumn(20),
  },
});

type OnboardingWeightProps = {
  weight: number;
  onBack: () => void;
  onSubmit: () => void;
  onSetWeight: (weight: number) => void;
};

export function OnboardingWeight({
  weight,
  onSetWeight,
  onSubmit,
  onBack,
}: OnboardingWeightProps) {
  const primaryAction = useThemeColoring("primaryAction");
  const borderColor = convertHexToRGBA(useThemeColoring("lightText"), 0.1);
  const { width, height } = useWindowDimensions();
  const firstRender = useRef(false);

  const neutralAction = tintColor(useThemeColoring("appBackground"), 0.1);

  useEffect(() => {
    if (!firstRender.current) {
      firstRender.current = true;
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [weight]);

  const svgWidth = width * 0.9;

  return (
    <View style={commonSlideStyles.container}>
      <View style={commonSlideStyles.header}>
        <Text style={commonSlideStyles.title}>How much do you weigh?</Text>
        <Text light>
          We use your bodyweight to estimate your volume and strength on certain
          exercises.
        </Text>
      </View>
      <View style={onboardingWeightStyles.inputContainer}>
        <Text style={onboardingWeightStyles.input}>{`${weight} lbs`}</Text>
        <Scale
          initialWeight={weight}
          width={svgWidth}
          height={height * 0.15}
          tickBaseHeight={height * 0.05}
          onChangeWeight={onSetWeight}
        />
        <Text light>Slide to adjust</Text>
      </View>
      <Animated.View
        style={[onboardingWeightStyles.buttonContainer, { borderColor }]}
      >
        <TouchableOpacity
          style={[
            commonSheetStyles.sheetButton,
            { backgroundColor: primaryAction },
          ]}
          onPress={onSubmit}
        >
          <Text emphasized>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonSheetStyles.sheetButton,
            { backgroundColor: neutralAction },
          ]}
          onPress={onBack}
        >
          <Text emphasized>Back</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
