import React, { useEffect } from "react";
import { View, Text, TextInput } from "@/components/Themed";
import {
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { convertHexToRGBA, tintColor } from "@/util/color";
import { Svg, Line } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { commonSheetStyles } from "@/components/sheets/common";
import { useKeyboardHeight } from "@/components/hooks/use-keyboard-height";
import { StyleUtils } from "@/util/styles";
import { commonSlideStyles } from "./common";

function getInputFontSize(nameLength: number) {
  const MIN_CHARS = 6;
  const MAX_CHARS = 30;
  if (nameLength <= MIN_CHARS) {
    return 60;
  }
  if (nameLength >= MAX_CHARS) {
    return 18;
  }
  const scale = (MAX_CHARS - nameLength) / (MAX_CHARS - MIN_CHARS);
  return 18 + 42 * scale;
}

type DashedDividerProps = {
  color: string;
  thickness: number;
  offset: number;
  width: number;
};

function DashedDivider({
  color,
  thickness,
  offset,
  width,
}: DashedDividerProps) {
  return (
    <Svg height={thickness * 2} width={width}>
      <Line
        x1={0}
        y1={1}
        x2={width}
        y2={1}
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={`${offset},${offset}`}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const onboardingNameStyles = StyleSheet.create({
  title: {
    marginBottom: "1%",
    fontWeight: "600",
    fontSize: 36,
  },
  subtitle: {
    marginBottom: "6%",
  },
  inputContainer: {
    ...StyleUtils.flexColumnCenterAll(),
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
  },
});

type OnboardingNameProps = {
  name: string;
  onSetName: (name: string) => void;
  onSubmit: () => void;
};

export function OnboardingName({
  name,
  onSetName,
  onSubmit,
}: OnboardingNameProps) {
  const primaryAction = useThemeColoring("primaryAction");
  const backgroundColor = useThemeColoring("appBackground");
  const placeholderColor = tintColor(backgroundColor, 0.2);
  const borderColor = convertHexToRGBA(useThemeColoring("lightText"), 0.1);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { keyboardHeight, isKeyboardOpen } = useKeyboardHeight();
  const actionButtonBottom = useSharedValue(0);
  const textInputFontSize = useSharedValue(60);

  useEffect(() => {
    textInputFontSize.value = getInputFontSize(name.length);
  }, [name.length]);

  useEffect(() => {
    if (isKeyboardOpen) {
      actionButtonBottom.value = withSpring(keyboardHeight - insets.bottom, {
        damping: 30,
        stiffness: 250,
        overshootClamping: false,
      });
    } else {
      actionButtonBottom.value = withSpring(0, {
        damping: 30,
        stiffness: 250,
        overshootClamping: false,
      });
    }
  }, [isKeyboardOpen]);

  const actionButtonAnimatedStyle = useAnimatedStyle(() => ({
    bottom: actionButtonBottom.value,
  }));

  const textInputAnimatedStyle = useAnimatedStyle(() => ({
    fontSize: textInputFontSize.value,
  }));

  return (
    <View style={commonSlideStyles.container}>
      <View style={commonSlideStyles.header}>
        <Text style={commonSlideStyles.title}>What is your name?</Text>
        <Text light>Introduce yourself.</Text>
      </View>
      <View style={onboardingNameStyles.inputContainer}>
        <AnimatedTextInput
          autoFocus={true}
          style={[onboardingNameStyles.input, textInputAnimatedStyle]}
          placeholder="Name"
          placeholderTextColor={placeholderColor}
          value={name}
          onChangeText={onSetName}
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          caretHidden={true}
        />
        <DashedDivider
          color={placeholderColor}
          thickness={6}
          width={width * 0.8}
          offset={10}
        />
      </View>
      <Animated.View
        style={[
          onboardingNameStyles.buttonContainer,
          { borderColor },
          actionButtonAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          style={[
            commonSheetStyles.sheetButton,
            { backgroundColor: primaryAction, opacity: name.trim() ? 1 : 0.5 },
          ]}
          onPress={onSubmit}
          disabled={!name.trim()}
        >
          <Text emphasized>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
