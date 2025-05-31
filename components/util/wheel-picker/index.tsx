import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { View, Text } from "@/components/Themed";
import { StyleSheet, TextStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  Easing,
} from "react-native-reanimated";
import { GestureDetector, Gesture, State } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { StyleUtils } from "@/util/styles";

function snapPoint(value: number, velocity: number, points: number[]): number {
  "worklet";
  const point = value + velocity * 0.2;
  const deltas = points.map((p) => Math.abs(point - p));
  const minDelta = Math.min.apply(null, deltas);
  return points[deltas.indexOf(minDelta)];
}

const VISIBLE_ITEMS = 5;

type WheelPickerItemProps = {
  label: string;
  translateY: SharedValue<number>;
  offset: number;
  itemHeight: number;
  labelStyle?: TextStyle;
};

const wheelPickerItemStyles = StyleSheet.create({
  item: {
    ...StyleUtils.flexRowCenterAll(),
  },
});

function WheelPickerItem({
  label,
  translateY,
  offset,
  itemHeight,
  labelStyle,
}: WheelPickerItemProps) {
  const style = useAnimatedStyle(() => {
    const maxAngle = 60;
    const angle = interpolate(
      translateY.value + offset,
      [-itemHeight * 2, 0, itemHeight * 2],
      [maxAngle, 0, -maxAngle]
    );
    const opacity = interpolate(
      Math.abs(translateY.value + offset),
      [0, itemHeight * 2],
      [1, 0.3]
    );
    return {
      transform: [{ perspective: 400 }, { rotateX: `${angle}deg` }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[wheelPickerItemStyles.item, { height: itemHeight }, style]}
    >
      <Text neutral style={labelStyle}>
        {label}
      </Text>
    </Animated.View>
  );
}

const wheelPickerStyles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
  },
  picker: {
    paddingHorizontal: "15%",
    alignItems: "center",
  },
});

type WheelPickerProps = {
  values: string[];
  onSelect: (value: string, index: number) => void;
  itemHeight: number;
  defaultIndex?: number;
  labelStyle?: TextStyle;
};

export type WheelPickerRef = {
  setIndex: (index: number) => void;
};

export const WheelPicker = forwardRef<WheelPickerRef, WheelPickerProps>(
  ({ values, onSelect, defaultIndex = 0, itemHeight, labelStyle }, ref) => {
    const translateY = useSharedValue(-defaultIndex * itemHeight);
    const startY = useSharedValue(-defaultIndex * itemHeight);
    const velocity = useSharedValue<number>(0);
    const gestureState = useSharedValue<State>(State.UNDETERMINED);

    const lastSelectedIndex = useRef<number>(defaultIndex);

    const snapPoints = values.map((_, index) => -index * itemHeight);

    useEffect(() => {
      if (lastSelectedIndex.current >= values.length) {
        translateY.value = -(values.length - 1) * itemHeight;
        handleSelect(values[values.length - 1], values.length - 1);
      }
    }, [values.length]);

    const handleSelect = useCallback(
      (value: string, index: number) => {
        lastSelectedIndex.current = index;
        onSelect(value, index);
      },
      [onSelect]
    );

    const onEnd = (translation: number, velocity: number) => {
      const targetTranslation = snapPoint(translation, velocity, snapPoints);
      const duration = Math.max(Math.abs(velocity / 30), 500);
      translateY.value = withTiming(
        targetTranslation,
        { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1.0) },
        (finished) => {
          if (finished) {
            runOnJS(handleSelect)(
              values[snapPoints.indexOf(targetTranslation)],
              snapPoints.indexOf(targetTranslation)
            );
          }
        }
      );
    };

    const panGesture = Gesture.Pan()
      .onStart(() => {
        startY.value = translateY.value;
        velocity.value = 0;
        gestureState.value = State.BEGAN;
      })
      .onUpdate((event) => {
        translateY.value = startY.value + event.translationY;
        gestureState.value = State.ACTIVE;
      })
      .onEnd(({ velocityY }) => {
        velocity.value = velocityY;
        gestureState.value = State.END;
        runOnJS(onEnd)(translateY.value, velocity.value);
      });

    const pickerAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
      };
    });

    useImperativeHandle(ref, () => ({
      setIndex: (index: number) => {
        translateY.value = -index * itemHeight;
      },
    }));

    useAnimatedReaction(
      () =>
        Math.max(
          Math.min(
            Math.round(-translateY.value / itemHeight),
            values.length - 1
          ),
          0
        ),
      (current: number, previous: number | null) => {
        if (current !== previous && previous !== null) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      [values.length, itemHeight]
    );

    return (
      <View
        style={[
          wheelPickerStyles.container,
          { height: itemHeight * VISIBLE_ITEMS },
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[wheelPickerStyles.picker, pickerAnimatedStyle]}
          >
            <View
              style={{ height: itemHeight * Math.floor(VISIBLE_ITEMS / 2) }}
            />
            {values.map((label, i) => (
              <WheelPickerItem
                key={i}
                label={label}
                translateY={translateY}
                offset={i * itemHeight}
                itemHeight={itemHeight}
                labelStyle={labelStyle}
              />
            ))}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);
