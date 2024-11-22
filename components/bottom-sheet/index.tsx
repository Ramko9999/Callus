import { StyleSheet, Pressable, ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  content: {
    zIndex: 1,
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});

type Props = {
  children: React.ReactNode;
  show: boolean;
  hide: () => void;
  onBackdropPress: () => void;
  contentStyle?: ViewStyle;
  backdropStyle?: ViewStyle;
  hideOffset?: number;
};

const DEFAULT_HIDE_OFFSET = 200;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
}: Props) {
  const offset = hideOffset ?? DEFAULT_HIDE_OFFSET;
  const translation = useSharedValue(0);

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
            style={[styles.content, animatedStyle, contentStyle]}
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
