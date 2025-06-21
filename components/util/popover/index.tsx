import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { forwardRef, useImperativeHandle, useState } from "react";

const popoverItemStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: "4%",
    paddingHorizontal: "5%",
  },
  iconContainer: {
    width: 24,
    height: 24,
    ...StyleUtils.flexRowCenterAll(),
  },
});

type PopoverItemProps = {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick: () => void;
  closePopover?: () => void;
};

export function PopoverItem({
  label,
  icon,
  onClick,
  closePopover,
}: PopoverItemProps) {
  const handlePress = () => {
    onClick();
    closePopover?.();
  };

  return (
    <TouchableOpacity style={popoverItemStyles.container} onPress={handlePress}>
      {typeof label === "string" ? <Text>{label}</Text> : label}
      {icon && <View style={popoverItemStyles.iconContainer}>{icon}</View>}
    </TouchableOpacity>
  );
}

const popoverSectionStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  break: {
    height: StyleSheet.hairlineWidth * 10,
  },
});

type PopoverSectionProps = {
  children: React.ReactNode;
  width?: number;
};

export function PopoverSection({ children, width }: PopoverSectionProps) {
  const items = React.Children.toArray(children);
  const separatorColor = useThemeColoring("separator");
  const backgroundColor = useThemeColoring("popover");

  return (
    <View style={[popoverSectionStyles.container, { backgroundColor, width }]}>
      {items.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < items.length - 1 && (
            <View
              style={[
                popoverSectionStyles.separator,
                { backgroundColor: separatorColor },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

export function PopoverBreak() {
  const separatorColor = useThemeColoring("separator");
  return (
    <View
      style={[popoverSectionStyles.break, { backgroundColor: separatorColor }]}
    />
  );
}

const popoverStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  popoverContainer: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export type PopoverRef = {
  open: (x: number, y: number) => void;
  close: () => void;
};

type PopoverProps = {
  children: React.ReactNode;
};

export const Popover = forwardRef<PopoverRef, PopoverProps>(
  ({ children }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const { width: screenWidth } = useWindowDimensions();
    const popoverWidth = screenWidth * 0.65;

    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    const close = () => {
      scale.value = withTiming(0, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 }, (finished) => {
        if (finished) {
          runOnJS(setIsVisible)(false);
        }
      });
    };

    useImperativeHandle(ref, () => ({
      open: (x, y) => {
        setPosition({ x, y });
        setIsVisible(true);
        scale.value = withSpring(1, { damping: 15, stiffness: 200, mass: 0.5 });
        opacity.value = withTiming(1, { duration: 100 });
      },
      close,
    }));

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [
          { translateX: -popoverWidth },
          { translateY: 10 },
          { scale: scale.value },
        ],
      };
    });

    const childrenWithProps = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          ...(child.props as any),
          width: popoverWidth,
          children: React.Children.map(
            (child.props as any).children,
            (item) => {
              if (React.isValidElement(item)) {
                return React.cloneElement(item, {
                  ...(item.props as any),
                  closePopover: close,
                });
              }
              return item;
            }
          ),
        });
      }
      return child;
    });

    return (
      <Modal visible={isVisible} transparent animationType="none">
        <Pressable style={popoverStyles.backdrop} onPress={close} />
        <Animated.View
          style={[
            popoverStyles.popoverContainer,
            {
              top: position.y,
              left: position.x,
            },
            animatedStyle,
          ]}
        >
          {childrenWithProps}
        </Animated.View>
      </Modal>
    );
  }
);
