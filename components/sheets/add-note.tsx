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
  TextInput as RNTextInput,
} from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { commonSheetStyles, SheetProps, SheetX } from "./common";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { tintColor } from "@/util/color";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useKeyboardHeight } from "@/components/hooks/use-keyboard-height";

const addNoteStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "3%",
    paddingBottom: "3%",
  },
  inputContainer: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "3%",
    borderRadius: 12,
    minHeight: 200,
  },
  input: {
    paddingVertical: "3%",
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 80,
  },
  buttonContainer: {
    ...StyleUtils.flexColumnCenterAll(20),
    width: "100%",
  },
  keyboardSpacer: {
    width: "100%",
  },
});

type AddNoteSheetProps = SheetProps & {
  note: string;
  onUpdate: (note: string) => void;
};

export const AddNoteSheet = forwardRef<BottomSheet, AddNoteSheetProps>(
  ({ show, hide, onHide, note = "", onUpdate }, ref) => {
    const primaryAction = useThemeColoring("primaryAction");
    const backgroundColor = useThemeColoring("appBackground");
    const inputBackgroundColor = tintColor(backgroundColor, 0.05);
    const placeholderColor = useThemeColoring("lightText");
    const [selectedNote, setSelectedNote] = useState("");
    const { keyboardHeight, isKeyboardOpen } = useKeyboardHeight();
    const keyboardSpacerHeight = useSharedValue(0);
    const inputRef = useRef<RNTextInput>(null);

    useEffect(() => {
      if (show) {
        setSelectedNote(note);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }, [show]);

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
      onUpdate(selectedNote.trim());
      hide();
    }, [onUpdate, selectedNote, hide]);

    const keyboardSpacerStyle = useAnimatedStyle(() => ({
      height: keyboardSpacerHeight.value,
    }));

    const isNoteUnchanged = selectedNote.trim() === note.trim();

    return (
      <PopupBottomSheet show={show} onHide={onHide} ref={ref}>
        <View style={commonSheetStyles.sheetHeader}>
          <Text action style={{ fontWeight: 600 }}>
            {note ? "Edit note" : "Add note"}
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX size={14} />
          </TouchableOpacity>
        </View>
        <View style={addNoteStyles.container}>
          <View style={[addNoteStyles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
            <TextInput
              ref={inputRef}
              style={addNoteStyles.input}
              placeholder="Add a note about this exercise..."
              placeholderTextColor={placeholderColor}
              value={selectedNote}
              onChangeText={setSelectedNote}
              autoCorrect={true}
              autoComplete="off"
              spellCheck={true}
              multiline={true}
              textAlignVertical="top"
            />
          </View>
          <View style={addNoteStyles.buttonContainer}>
            <TouchableOpacity
              style={[
                commonSheetStyles.sheetButton,
                {
                  backgroundColor: primaryAction,
                  opacity: isNoteUnchanged ? 0.5 : 1,
                },
              ]}
              onPress={handleUpdate}
              disabled={isNoteUnchanged}
            >
              <Text emphasized>
                {"Update"}
              </Text>
            </TouchableOpacity>
          </View>
          <Animated.View
            style={[addNoteStyles.keyboardSpacer, keyboardSpacerStyle]}
          />
        </View>
      </PopupBottomSheet>
    );
  }
);
