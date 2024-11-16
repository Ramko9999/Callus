import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { useEffect, useState } from "react";
import {
  Gesture,
  GestureDetector,
  TouchableOpacity,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

const items = ["Ramki", "Rohan", "Tanush", "Raghava", "Rahul", "Vikram"];

function Example() {
  const [focus, setFocus] = useState(false);

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
      <PanShuffle items={items} />
    </View>
  );
}

function BorderAnimation({
  focus,
  setFocus,
}: {
  focus: boolean;
  setFocus: any;
}) {
  const focusProgress = useSharedValue(0);

  useEffect(() => {
    focusProgress.value = focus ? withTiming(1) : withTiming(0);
  }, [focus]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: focusProgress.value,
  }));

  return (
    <TouchableOpacity onPress={() => setFocus((f: boolean) => !f)}>
      <Animated.View style={[{ borderColor: "white" }, animatedStyle]}>
        <Text>Border Animation</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const ITEM_HEIGHT = 50;

const panShuffleStyles = StyleSheet.create({
  item: {
    ...StyleUtils.flexRowCenterAll(),
    padding: "3%",
    height: ITEM_HEIGHT,
    borderWidth: 1,
    borderColor: "white",
  },
  container: {
    ...StyleUtils.flexColumn(10),
  },
  placeholder: {
    height: ITEM_HEIGHT,
    padding: "3%",
    backgroundColor: "red",
  },
});

type PanShuffleProps = {
  items: string[];
};

type ShuffleState = {
  item: string;
  originalIndex: number;
  newIndex: number;
};

function PanShuffle({ items }: PanShuffleProps) {
  const [shuffleState, setShuffleState] = useState<ShuffleState>();

  const gestureOrigin = useSharedValue(0);
  const shuffleTranslation = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      gestureOrigin.value = event.y;
      shuffleTranslation.value = event.y;
    })
    .onUpdate((event) => {
      if (shuffleState !== undefined) {
        const newPosition = gestureOrigin.value + event.translationY;
        shuffleTranslation.value = newPosition;

        const indexDelta = Math.round(event.translationY / ITEM_HEIGHT);
        const newIndex = Math.min(
          Math.max(shuffleState?.originalIndex + indexDelta, 0),
          items.length - 1
        );
        setShuffleState((s) => ({
          ...(s as ShuffleState),
          newIndex,
        }));
      }
    })
    .onEnd(() => {
      gestureOrigin.value = 0;
      shuffleTranslation.value = 0;
      setShuffleState(undefined);
    })
    .runOnJS(true);

  const shuffleItemStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: shuffleTranslation.value }],
    position: "absolute",
  }));

  const getNewItemOrder = (items: string[]) => {
    if (shuffleState?.originalIndex !== undefined) {
      const item = items[shuffleState?.originalIndex];
      const removedItems = [
        ...items.slice(0, shuffleState?.originalIndex),
        ...items.slice(shuffleState?.originalIndex + 1, items.length),
      ];
      return [
        ...removedItems.slice(0, shuffleState?.newIndex),
        item,
        ...removedItems.slice(shuffleState?.newIndex, removedItems.length),
      ];
    } else {
      return items;
    }
  };

  return (
    <GestureDetector gesture={panGesture}>
      <View>
        <View background style={panShuffleStyles.container}>
          {getNewItemOrder(items).map((item, index) =>
            index === shuffleState?.newIndex ? (
              <ShufflePlaceholder key={index} />
            ) : (
              <TouchableOpacity
                key={index}
                onLongPress={() => {
                  setShuffleState({
                    item,
                    originalIndex: index,
                    newIndex: index,
                  });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }}
              >
                <Animated.View
                  style={[
                    panShuffleStyles.item,
                    item === shuffleState?.item ? shuffleItemStyle : {},
                  ]}
                >
                  <Text>{item}</Text>
                </Animated.View>
              </TouchableOpacity>
            )
          )}
          {shuffleState?.item && (
            <Animated.View style={[panShuffleStyles.item, shuffleItemStyle]}>
              <Text>{shuffleState.item}</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </GestureDetector>
  );
}

function ShufflePlaceholder() {
  return <View background style={panShuffleStyles.placeholder}></View>;
}
