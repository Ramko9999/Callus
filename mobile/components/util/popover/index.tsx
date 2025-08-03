import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  SharedValue,
  interpolate,
} from "react-native-reanimated";
import { forwardRef, useImperativeHandle, useState } from "react";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
};

export function PopoverItem({ label, icon, onClick }: PopoverItemProps) {
  return (
    <TouchableOpacity style={popoverItemStyles.container} onPress={onClick}>
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

function PopoverSection({ children, width }: PopoverSectionProps) {
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
  progress: SharedValue<number>;
};

export const Popover = forwardRef<PopoverRef, PopoverProps>(
  ({ children, progress }, ref) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const { width: screenWidth } = useWindowDimensions();
    const popoverWidth = screenWidth * 0.65;

    const close = () => {
      progress.value = withTiming(0, { duration: 150 });
    };

    useImperativeHandle(ref, () => ({
      open: (x, y) => {
        setPosition({ x, y });
        progress.value = withSpring(1, {
          damping: 15,
          stiffness: 250,
          mass: 0.6,
        });
      },
      close,
    }));

    const backdropStyle = useAnimatedStyle(() => {
      return {
        display: progress.value > 0 ? "flex" : "none",
      };
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: progress.value,
        height: interpolate(progress.value, [0, 1], [0, 100]),
        transform: [
          {
            translateX: interpolate(
              progress.value,
              [0, 1],
              [-popoverWidth / 2, -popoverWidth]
            ),
          },
          { translateY: 10 },
          { scale: progress.value },
        ],
      };
    });

    return (
      <>
        <AnimatedPressable
          style={[popoverStyles.backdrop, backdropStyle]}
          onPress={close}
        />
        <Animated.View
          style={[
            popoverStyles.popoverContainer,
            {
              top: position.y,
              left: position.x,
              width: popoverWidth,
            },
            animatedStyle,
          ]}
        >
          <PopoverSection>{children}</PopoverSection>
        </Animated.View>
      </>
    );
  }
);
