import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { StyleUtils } from "@/util/styles";
import {
  X as LucideX,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
} from "lucide-react-native";
import { useThemeColoring, Text } from "@/components/Themed";
import { useKeyboardHeight } from "@/components/hooks/use-keyboard-height";
import { tintColor } from "@/util/color";
import { convertHexToRGBA } from "@/util/color";

export const commonSheetStyles = StyleSheet.create({
  sheetHeader: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: "5%",
    paddingTop: "3%",
    paddingBottom: "4%",
  },
  sheetButton: {
    borderRadius: 10,
    paddingVertical: "3%",
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
  },
  sheetIcon: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: "50%",
    aspectRatio: 1,
    padding: "2%",
  },
  errorContainer: {
    marginTop: "4%",
    marginBottom: "4%",
    paddingHorizontal: "4%",
    paddingVertical: "3%",
    borderRadius: 8,
  },
  errorContent: {
    ...StyleUtils.flexRow(12),
    alignItems: "center",
  },
});

export function SheetX({ size = 14 }: { size?: number }) {
  const color = useThemeColoring("primaryText");
  const bg = tintColor(useThemeColoring("primaryViewBackground"), 0.05);
  return (
    <View style={[commonSheetStyles.sheetIcon, { backgroundColor: bg }]}>
      <LucideX size={size} color={color} />
    </View>
  );
}

export function SheetArrowLeft({ size = 14 }: { size?: number }) {
  const color = useThemeColoring("primaryText");
  const bg = tintColor(useThemeColoring("primaryViewBackground"), 0.05);
  return (
    <View style={[commonSheetStyles.sheetIcon, { backgroundColor: bg }]}>
      <ArrowLeft size={size} color={color} />
    </View>
  );
}

type SheetErrorProps = {
  text: string;
};

export function SheetError({ text }: SheetErrorProps) {
  const errorColor = useThemeColoring("dangerAction");
  return (
    <View
      style={[
        commonSheetStyles.errorContainer,
        { backgroundColor: convertHexToRGBA(errorColor, 0.1) },
      ]}
    >
      <View style={commonSheetStyles.errorContent}>
        <AlertCircle size={16} color={errorColor} />
        <Text sneutral style={{ color: errorColor, flex: 1 }}>
          {text}
        </Text>
      </View>
    </View>
  );
}

type SheetWarningProps = {
  text: string;
};

export function SheetWarning({ text }: SheetWarningProps) {
  const warningColor = useThemeColoring("warningAction");
  return (
    <View
      style={[
        commonSheetStyles.errorContainer,
        { backgroundColor: convertHexToRGBA(warningColor, 0.1) },
      ]}
    >
      <View style={commonSheetStyles.errorContent}>
        <AlertTriangle size={16} color={warningColor} />
        <Text sneutral style={{ color: warningColor, flex: 1 }}>
          {text}
        </Text>
      </View>
    </View>
  );
}

export type SheetProps = {
  show: boolean;
  hide: () => void;
  onHide: () => void;
};

export function KeyboardSpacer() {
  const { keyboardHeight, isKeyboardOpen } = useKeyboardHeight();
  const keyboardSpacerHeight = useSharedValue(0);

  useEffect(() => {
    if (isKeyboardOpen) {
      keyboardSpacerHeight.value = keyboardHeight;
    } else {
      keyboardSpacerHeight.value = 0;
    }
  }, [isKeyboardOpen, keyboardHeight]);

  const keyboardSpacerStyle = useAnimatedStyle(() => ({
    height: keyboardSpacerHeight.value,
  }));

  return <Animated.View style={[{ width: "100%" }, keyboardSpacerStyle]} />;
}
