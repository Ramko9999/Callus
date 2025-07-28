import {
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useThemeColoring, Text, View } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import React, { useEffect } from "react";
import { convertHexToRGBA, tintColor } from "@/util/color";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";

export const commonSettingsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingHorizontal: "5%",
    paddingTop: "3%",
  },
  sectionHeader: {
    marginTop: "7%",
    marginBottom: "2%",
  },
  row: {
    ...StyleUtils.flexRow(12),
    alignItems: "center",
    paddingVertical: "4%",
  },
  rowIcon: {
    marginRight: 16,
  },
  chevron: {
    marginLeft: "auto",
  },
  value: {
    flex: 1,
    textAlign: "right",
    color: "#aaa",
  },
  input: {
    ...StyleUtils.flexRow(12),
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: "4%",
  },
});

type SectionHeaderProps = { title: string };

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <Text small light style={commonSettingsStyles.sectionHeader}>
      {title}
    </Text>
  );
}

type SettingsRowProps = {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
};
export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightIcon,
  disabled,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View style={commonSettingsStyles.row}>
        {icon && <View style={commonSettingsStyles.rowIcon}>{icon}</View>}
        <Text>{label}</Text>
        {value && <Text>{value}</Text>}
        {rightIcon && (
          <View style={commonSettingsStyles.chevron}>{rightIcon}</View>
        )}
      </View>
    </TouchableOpacity>
  );
}

type SettingInputProps = {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  includeBottomBorder?: boolean;
  onPress?: () => void;
};

export function SettingInput({
  icon,
  label,
  value,
  includeBottomBorder,
  onPress,
}: SettingInputProps) {
  const borderColor = convertHexToRGBA(useThemeColoring("lightText"), 0.12);

  return (
    <TouchableOpacity
      style={[
        commonSettingsStyles.input,
        {
          borderBottomWidth: includeBottomBorder ? 1 : 0,
          borderBottomColor: borderColor,
        },
      ]}
      onPress={onPress}
    >
      {icon && <View style={commonSettingsStyles.rowIcon}>{icon}</View>}
      <Text>{label}</Text>
      {value}
    </TouchableOpacity>
  );
}

const settingToggleStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(12),
    alignItems: "center",
  },
  toggleContainer: {
    borderRadius: "50%",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleKnob: {
    borderRadius: "50%",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

type SettingToggleProps = {
  isOn: boolean;
  onToggle: () => void;
};

export function SettingToggle({ isOn, onToggle }: SettingToggleProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const inactiveColor = tintColor(useThemeColoring("appBackground"), 0.15);
  const activeColor = useThemeColoring("primaryAction");

  const containerWidth = screenWidth * 0.12;
  const containerHeight = screenHeight * 0.038;
  const knobSize = screenWidth * 0.065;
  const knobRadius = knobSize / 2;
  const containerRadius = containerHeight / 2;
  const paddingHorizontal = screenWidth * 0.005;
  const knobTranslationDistance =
    containerWidth - knobSize - paddingHorizontal * 2;

  const toggleValue = useSharedValue(isOn ? 1 : 0);

  useEffect(() => {
    toggleValue.value = withSpring(isOn ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
  }, [isOn]);

  const knobAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: toggleValue.value * knobTranslationDistance,
        },
      ],
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        toggleValue.value,
        [0, 1],
        [inactiveColor, activeColor]
      ),
    };
  });


  return (
    <TouchableOpacity
      style={settingToggleStyles.container}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          settingToggleStyles.toggleContainer,
          containerAnimatedStyle,
          {
            width: containerWidth,
            height: containerHeight,
            borderRadius: containerRadius,
            paddingHorizontal,
          },
        ]}
      >
        <Animated.View
          style={[
            settingToggleStyles.toggleKnob,
            knobAnimatedStyle,
            {
              width: knobSize,
              height: knobSize,
              borderRadius: knobRadius,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
