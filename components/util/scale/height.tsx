import React, { useCallback, forwardRef, useImperativeHandle } from "react";
import { View } from "@/components/Themed";
import { StyleSheet } from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { Svg, Line, G, Polygon, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  interpolate,
  withDecay,
  useDerivedValue,
  useAnimatedReaction,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { StyleUtils } from "@/util/styles";

const BASE_HEIGHT = 72;

type ScaleTickProps = {
  x: number;
  y: number;
  width: number;
  translateY: SharedValue<number>;
  strokeHeight: number;
  parentHeight: number;
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

function ScaleTick({
  x,
  y,
  width,
  translateY,
  strokeHeight,
  parentHeight,
}: ScaleTickProps) {
  const tickColor = useThemeColoring("primaryText");
  const maxDistance = 0.5 * parentHeight;
  const animatedProps = useAnimatedProps(() => {
    const distance = Math.min(
      Math.abs(y + translateY.value - parentHeight),
      parentHeight / 2
    );
    const opacity = interpolate(distance, [0, maxDistance], [1, 0]);
    return { opacity };
  });
  return (
    <AnimatedRect
      x={x}
      y={y}
      width={width}
      height={strokeHeight}
      fill={tickColor}
      animatedProps={animatedProps}
    />
  );
}

type ScaleIndicatorProps = {
  width: number;
  height: number;
};

function ScaleIndicator({ width, height }: ScaleIndicatorProps) {
  const triangleWidth = width * 0.25;
  const triangleHeight = height * 0.5;
  const indicatorCenterY = height / 2 + 2.5;
  const primaryAction = useThemeColoring("primaryAction");
  return (
    <Svg width={width} height={height}>
      <G>
        <Polygon
          points={`${width},${indicatorCenterY - triangleHeight / 2} ${width},${
            indicatorCenterY + triangleHeight / 2
          } ${width - triangleWidth},${indicatorCenterY}`}
          fill={primaryAction}
        />
        <Line
          x1={0}
          y1={indicatorCenterY}
          x2={width}
          y2={indicatorCenterY}
          stroke={primaryAction}
          strokeWidth={5}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

const scaleStyles = StyleSheet.create({
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...StyleUtils.flexColumn(),
    justifyContent: "center",
  },
  scaleContainer: {
    overflow: "hidden",
  },
});

export type ScaleRef = {
  setHeight: (height: number) => void;
};

type ScaleProps = {
  initialHeight: number;
  width: number;
  svgHeight: number;
  tickBaseWidth: number;
  onChangeHeight: (height: number) => void;
};

export const HeightScale = React.memo(
  forwardRef<ScaleRef, ScaleProps>(
    function HeightScale(
      { initialHeight, width, svgHeight, tickBaseWidth, onChangeHeight },
      ref
    ) {
      const strokeHeight = 5;
      const dashPattern = [3, 1, 1.5, 1, 2, 1, 1.5, 1];
      const dashesPerHeight = 16;

      const dashSpacing =
        (svgHeight - strokeHeight * dashesPerHeight) / dashesPerHeight;
      const upperBoundScroll = svgHeight * 1;
      const lowerBoundScroll = -1 * svgHeight * 1;
      const totalDashes = dashesPerHeight * 2;
      const xBase = 0;
      const initialScrollY = useSharedValue(0);
      const scrollY = useSharedValue(
        (svgHeight * 0.5 * (BASE_HEIGHT - initialHeight)) / 12
      );

      useImperativeHandle(ref, () => ({
        setHeight: (height: number) => {
          scrollY.value = (svgHeight * 0.5 * (BASE_HEIGHT - height)) / 12;
        },
      }));

      const handleHeightChange = useCallback((scrollY: number) => {
        const ft = scrollY / (svgHeight * 0.5);
        const inches = BASE_HEIGHT - 12 * ft;
        onChangeHeight(Math.round(inches));
      }, []);

      useAnimatedReaction(
        () => scrollY,
        (current) => {
          runOnJS(handleHeightChange)(current.value);
        }
      );

      const translateY = useDerivedValue(() => {
        if (scrollY.value === upperBoundScroll) {
          return svgHeight;
        }
        if (scrollY.value === lowerBoundScroll) {
          return -svgHeight;
        }
        if (
          scrollY.value >= upperBoundScroll - svgHeight * 0.5 ||
          scrollY.value <= lowerBoundScroll + svgHeight * 0.5
        ) {
          return scrollY.value % svgHeight;
        }
        return scrollY.value % (svgHeight / 2);
      });

      const panGesture = Gesture.Pan()
        .onStart(() => {
          initialScrollY.value = scrollY.value;
        })
        .onUpdate((event) => {
          const clampedScrollY = Math.max(
            lowerBoundScroll,
            Math.min(initialScrollY.value + event.translationY, upperBoundScroll)
          );
          scrollY.value = clampedScrollY;
        })
        .onEnd((event) => {
          const velocity = Math.abs(event.velocityY) > 100 ? event.velocityY : 0;
          scrollY.value = withDecay({
            velocity: velocity,
            clamp: [lowerBoundScroll, upperBoundScroll],
          });
        });

      const dashes = Array.from({ length: totalDashes + 1 }).map((_, i) => {
        const patternIdx = i % dashPattern.length;
        const tickWidth = dashPattern[patternIdx] * tickBaseWidth;
        const y = i * (dashSpacing + strokeHeight);
        return (
          <ScaleTick
            key={i}
            x={xBase}
            y={y}
            width={tickWidth}
            translateY={translateY}
            strokeHeight={strokeHeight}
            parentHeight={svgHeight}
          />
        );
      });

      const AnimatedG = Animated.createAnimatedComponent(G);
      const animatedGProps = useAnimatedProps(() => ({
        transform: [{ translateY: translateY.value - svgHeight / 2 }],
      }));

      return (
        <GestureDetector gesture={panGesture}>
          <View style={scaleStyles.scaleContainer}>
            <Svg width={width} height={svgHeight}>
              <AnimatedG animatedProps={animatedGProps}>{dashes}</AnimatedG>
            </Svg>
            <View style={scaleStyles.indicator}>
              <ScaleIndicator height={60} width={4 * tickBaseWidth} />
            </View>
          </View>
        </GestureDetector>
      );
    }
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.width === nextProps.width &&
      prevProps.svgHeight === nextProps.svgHeight &&
      prevProps.tickBaseWidth === nextProps.tickBaseWidth &&
      prevProps.onChangeHeight === nextProps.onChangeHeight
    );
  }
);
