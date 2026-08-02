import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  TextInput as RNTextInput,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Svg, Line } from "react-native-svg";
import { View, Text, TextInput, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { tintColor } from "@/util/color";
import { commonSheetStyles, KeyboardSpacer } from "./common";

/**
 * Shared "type a name" sheet body, used by both the workout name sheet and the
 * routine name sheet so they look and behave identically.
 */

type DashedDividerProps = {
  color: string;
  thickness: number;
  offset: number;
  width: number;
};

export function DashedDivider({
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

// The name is the hero of this sheet, so it starts large and shrinks as it
// grows rather than wrapping or truncating.
function getInputFontSize(nameLength: number) {
  const MIN_CHARS = 6;
  const MAX_CHARS = 30;
  if (nameLength <= MIN_CHARS) {
    return 40;
  }
  if (nameLength >= MAX_CHARS) {
    return 18;
  }
  const scale = (MAX_CHARS - nameLength) / (MAX_CHARS - MIN_CHARS);
  return 18 + 22 * scale;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const nameEditorStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "3%",
    paddingVertical: "3%",
    // Without bottom padding the submit button sits flush with the sheet's
    // measured content edge and its touch target gets clipped.
    paddingBottom: 30,
  },
  inputContainer: {
    ...StyleUtils.flexColumnCenterAll(),
    marginVertical: "8%",
    paddingHorizontal: "3%",
    paddingVertical: "3%",
  },
  input: {
    fontWeight: "600",
    textAlign: "center",
  },
  buttonContainer: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingTop: "3%",
    width: "100%",
  },
});

type NameEditorProps = {
  title: string;
  placeholder: string;
  /** Value the field is seeded with each time `resetToken` changes. */
  initialName: string;
  submitLabel: string;
  onSubmit: (trimmedName: string) => void;
  /** Re-seeds the field and refocuses it whenever this value changes. */
  resetToken?: unknown;
  /** Rendered at the trailing edge of the header, e.g. a back arrow. */
  headerAction?: React.ReactNode;
  /** Blocks submission for the given trimmed name. Defaults to blocking empty. */
  isSubmitDisabled?: (trimmedName: string) => boolean;
  /** Delay before autofocus, to let the sheet finish presenting. */
  focusDelay?: number;
};

export function NameEditor({
  title,
  placeholder,
  initialName,
  submitLabel,
  onSubmit,
  resetToken,
  headerAction,
  isSubmitDisabled,
  focusDelay = 250,
}: NameEditorProps) {
  const [selectedName, setSelectedName] = useState(initialName);
  const inputRef = useRef<RNTextInput>(null);
  const fontSize = useSharedValue(getInputFontSize(initialName.length));
  const { width } = useWindowDimensions();

  const primaryAction = useThemeColoring("primaryAction");
  const backgroundColor = useThemeColoring("appBackground");
  const placeholderColor = tintColor(backgroundColor, 0.2);

  useEffect(() => {
    setSelectedName(initialName);
    const timeout = setTimeout(() => inputRef.current?.focus(), focusDelay);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  useEffect(() => {
    fontSize.value = getInputFontSize(selectedName.length);
  }, [selectedName.length]);

  const animatedInputStyle = useAnimatedStyle(() => ({
    fontSize: fontSize.value,
  }));

  const trimmed = selectedName.trim();
  const disabled = isSubmitDisabled
    ? isSubmitDisabled(trimmed)
    : trimmed.length === 0;

  const handleSubmit = useCallback(() => {
    if (disabled) {
      return;
    }
    onSubmit(trimmed);
  }, [disabled, onSubmit, trimmed]);

  return (
    <>
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          {title}
        </Text>
        {headerAction}
      </View>
      <View style={nameEditorStyles.container}>
        <View style={nameEditorStyles.inputContainer}>
          <AnimatedTextInput
            ref={inputRef}
            style={[nameEditorStyles.input, animatedInputStyle]}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            value={selectedName}
            onChangeText={setSelectedName}
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
          />
          <DashedDivider
            color={placeholderColor}
            thickness={6}
            width={width * 0.8}
            offset={10}
          />
        </View>
        <View style={nameEditorStyles.buttonContainer}>
          <TouchableOpacity
            style={[
              commonSheetStyles.sheetButton,
              { backgroundColor: primaryAction, opacity: disabled ? 0.5 : 1 },
            ]}
            onPress={handleSubmit}
            disabled={disabled}
          >
            <Text neutral emphasized>
              {submitLabel}
            </Text>
          </TouchableOpacity>
        </View>
        <KeyboardSpacer />
      </View>
    </>
  );
}
