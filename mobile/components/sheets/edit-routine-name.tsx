import React, { forwardRef, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  TextInput as RNTextInput,
} from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { View, Text, TextInput, useThemeColoring } from "@/components/Themed";
import { commonSheetStyles, KeyboardSpacer } from "./common";
import { PopupBottomSheetModal } from "@/components/util/popup/sheet";
import { StyleUtils } from "@/util/styles";
import { tintColor } from "@/util/color";
import { Svg, Line } from "react-native-svg";

function DashedDivider({
  color,
  thickness,
  width,
  offset,
}: {
  color: string;
  thickness: number;
  width: number;
  offset: number;
}) {
  return (
    <Svg height={thickness} width={width}>
      <Line
        x1="0"
        y1={thickness / 2}
        x2={width}
        y2={thickness / 2}
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={`${offset},${offset}`}
      />
    </Svg>
  );
}

const editRoutineNameStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "3%",
    paddingVertical: "3%",
    paddingBottom: 30,
  },
  header: {
    ...StyleUtils.flexRowCenterAll(),
    paddingTop: "3%",
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

type EditRoutineNameProps = {
  show: boolean;
  hide: () => void;
  onHide: () => void;
  name: string;
  mode: "create" | "rename";
  onSave: (name: string) => void;
};

export const EditRoutineName = forwardRef<
  BottomSheetModal,
  EditRoutineNameProps
>(({ show, hide, onHide, name, mode, onSave }, ref) => {
  const isCreating = mode === "create";
  const seed = isCreating && name === "New Routine" ? "" : name;

  const [selectedName, setSelectedName] = useState(seed);
  const inputRef = useRef<RNTextInput>(null);
  const { width } = useWindowDimensions();

  const primaryAction = useThemeColoring("primaryAction");
  const backgroundColor = useThemeColoring("appBackground");
  const placeholderColor = tintColor(backgroundColor, 0.2);

  useEffect(() => {
    if (show) {
      setSelectedName(seed);
      const timeout = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  const isEmpty = selectedName.trim().length === 0;

  const handleSave = () => {
    if (isEmpty) {
      hide();
      return;
    }
    onSave(selectedName.trim());
    hide();
  };

  return (
    <PopupBottomSheetModal onDismiss={onHide} ref={ref}>
      <View style={editRoutineNameStyles.container}>
        <View style={editRoutineNameStyles.header}>
          <Text action>{isCreating ? "Name Routine" : "Edit Name"}</Text>
        </View>
        <View style={editRoutineNameStyles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={editRoutineNameStyles.input}
            placeholder="e.g. Push Day"
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
        <View style={editRoutineNameStyles.buttonContainer}>
          <TouchableOpacity
            style={[
              commonSheetStyles.sheetButton,
              { backgroundColor: primaryAction, opacity: isEmpty ? 0.5 : 1 },
            ]}
            onPress={handleSave}
            disabled={isEmpty}
          >
            <Text neutral emphasized>
              {isCreating ? "Continue" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
        <KeyboardSpacer />
      </View>
    </PopupBottomSheetModal>
  );
});
