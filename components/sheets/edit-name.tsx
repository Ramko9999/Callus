import React, {
  forwardRef,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { View, Text, TextInput } from "@/components/Themed";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  TextInput as RNTextInput,
} from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { commonSheetStyles, SheetProps, SheetX } from "./common";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { tintColor } from "@/util/color";
import { Svg, Line } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useKeyboardHeight } from "@/components/hooks/use-keyboard-height";

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

const editNameStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "3%",
    paddingVertical: "3%",
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
    paddingHorizontal: "5%",
    paddingBottom: "6%",
    width: "100%",
  },
  keyboardSpacer: {
    width: "100%",
  },
});

type EditNameSheetProps = SheetProps & {
  name: string;
  onUpdate: (name: string) => Promise<void>;
};

export const EditNameSheet = forwardRef<BottomSheet, EditNameSheetProps>(
  ({ show, hide, onHide, name, onUpdate }, ref) => {
    const primaryAction = useThemeColoring("primaryAction");
    const backgroundColor = useThemeColoring("appBackground");
    const placeholderColor = tintColor(backgroundColor, 0.2);
    const [selectedName, setSelectedName] = useState("");
    const textInputFontSize = useSharedValue(60);
    const { keyboardHeight, isKeyboardOpen } = useKeyboardHeight();
    const keyboardSpacerHeight = useSharedValue(0);
    const { width } = useWindowDimensions();
    const inputRef = useRef<RNTextInput>(null);

    useEffect(() => {
      if (show) {
        setSelectedName("");
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }, [show]);

    useEffect(() => {
      textInputFontSize.value = getInputFontSize(selectedName.length);
    }, [selectedName.length]);

    useEffect(() => {
      if (isKeyboardOpen) {
        keyboardSpacerHeight.value = withSpring(keyboardHeight, {
          damping: 30,
          stiffness: 400,
          overshootClamping: false,
        });
      } else {
        keyboardSpacerHeight.value = withSpring(0, {
          damping: 30,
          stiffness: 400,
          overshootClamping: false,
        });
      }
    }, [isKeyboardOpen, keyboardHeight]);

    const handleUpdate = useCallback(() => {
      onUpdate(selectedName.trim()).then(() => {
        hide();
      });
    }, [onUpdate, selectedName, hide]);

    const textInputAnimatedStyle = useAnimatedStyle(() => ({
      fontSize: textInputFontSize.value,
    }));

    const keyboardSpacerStyle = useAnimatedStyle(() => ({
      height: keyboardSpacerHeight.value,
    }));

    const isNameUnchanged = selectedName.trim() === name;
    const isNameEmpty = !selectedName.trim();

    return (
      <PopupBottomSheet show={show} onHide={onHide} ref={ref}>
        <View style={commonSheetStyles.sheetHeader}>
          <Text action style={{ fontWeight: 600 }}>
            Edit your name
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX size={14} />
          </TouchableOpacity>
        </View>
        <View style={editNameStyles.container}>
          <View style={editNameStyles.inputContainer}>
            <AnimatedTextInput
              ref={inputRef}
              style={[editNameStyles.input, textInputAnimatedStyle]}
              placeholder="Name"
              placeholderTextColor={placeholderColor}
              value={selectedName}
              onChangeText={setSelectedName}
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
          <View style={editNameStyles.buttonContainer}>
            <TouchableOpacity
              style={[
                commonSheetStyles.sheetButton,
                {
                  backgroundColor: primaryAction,
                  opacity: isNameUnchanged || isNameEmpty ? 0.5 : 1,
                },
              ]}
              onPress={handleUpdate}
              disabled={isNameUnchanged || isNameEmpty}
            >
              <Text emphasized>Update</Text>
            </TouchableOpacity>
          </View>
          <Animated.View
            style={[editNameStyles.keyboardSpacer, keyboardSpacerStyle]}
          />
        </View>
      </PopupBottomSheet>
    );
  }
);
