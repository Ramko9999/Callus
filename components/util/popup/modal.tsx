import { useThemeColoring, View } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const BACKDROP_VISIBLE_COLOR = "rgba(0, 0, 0, 0.8)";

const modalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    ...StyleUtils.flexRowCenterAll(),
  },
  container: {
    borderRadius: 10,
    paddingHorizontal: "1%",
    paddingVertical: "1%",
    overflow: "hidden",
    ...StyleUtils.flexColumn(),
  },
});

type ModalRef = {
  hideModal: () => void;
};

type ModalProps = {
  show: boolean;
  onHide: () => void;
  children: React.ReactNode;
  customBackdropStyle?: ViewStyle;
};

export const Modal = forwardRef<ModalRef, ModalProps>(
  ({ show, onHide, children, customBackdropStyle }, ref) => {
    const modalVisibility = useSharedValue(0);
    const dimensions = useWindowDimensions();

    useEffect(() => {
      if (show) {
        modalVisibility.value = withTiming(1);
      }
    }, [show]);

    const hideModal = () => {
      modalVisibility.value = withTiming(0, {}, (done) => {
        if (done) {
          runOnJS(onHide)();
        }
      });
    };

    useImperativeHandle(ref, () => ({
      hideModal,
    }));

    const modalBackgroundColor = useThemeColoring("primaryViewBackground");

    const modalContentAnimatedStyle = useAnimatedStyle(() => ({
      opacity: modalVisibility.value,
    }));

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(
        modalVisibility.value,
        [0, 1],
        ["rgba(0, 0, 0, 0)", BACKDROP_VISIBLE_COLOR]
      ),
    }));

    return (
      show && (
        <AnimatedPressable
          style={[
            modalStyles.backdrop,
            { ...dimensions },
            backdropAnimatedStyle,
            customBackdropStyle,
          ]}
          onPress={hideModal}
        >
          <AnimatedPressable
            style={[
              modalContentAnimatedStyle,
              modalStyles.container,
              {
                backgroundColor: modalBackgroundColor,
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View>{children}</View>
          </AnimatedPressable>
        </AnimatedPressable>
      )
    );
  }
);
