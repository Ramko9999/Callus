import React, { useEffect, useRef } from "react";
import { View, Text } from "@/components/Themed";
import { commonSlideStyles } from "./common";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { convertHexToRGBA, tintColor } from "@/util/color";
import { StyleUtils } from "@/util/styles";
import { commonSheetStyles } from "@/components/sheets/common";
import * as Haptics from "expo-haptics";
import { formatHeight } from "./common";
import { HeightScale } from "@/components/util/scale/height";
import Animated from "react-native-reanimated";

const onboardingHeightStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleUtils.flexColumn(),
    width: "100%",
    paddingHorizontal: "5%",
    paddingTop: "8%",
    paddingBottom: "3%",
  },
  row: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    height: "80%",
  },
  valueContainer: {
    ...StyleUtils.flexRowCenterAll(),
    width: "50%",
  },
  value: {
    fontWeight: "600",
    fontSize: 42,
  },
  buttonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: "5%",
    paddingVertical: "5%",
    borderTopWidth: 1,
    ...StyleUtils.flexColumn(20),
  },
  scaleContainer: {
    width: "50%",
  },
});

type OnboardingHeightProps = {
  height: number;
  onSetHeight: (height: number) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function OnboardingHeight({
  height,
  onSetHeight,
  onSubmit,
  onBack,
}: OnboardingHeightProps) {
  const { width, height: windowHeight } = useWindowDimensions();
  const primaryAction = useThemeColoring("primaryAction");
  const borderColor = convertHexToRGBA(useThemeColoring("lightText"), 0.1);
  const neutralAction = tintColor(useThemeColoring("appBackground"), 0.1);
  const firstRender = useRef(false);

  const svgHeight = windowHeight * 0.5;
  const svgWidth = width * 0.3;

  useEffect(() => {
    if (!firstRender.current) {
      firstRender.current = true;
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [height]);

  return (
    <View style={commonSlideStyles.container}>
      <View style={commonSlideStyles.header}>
        <Text style={commonSlideStyles.title}>What is your height?</Text>
        <Text light>
          We use your height to give you a more personalized experience.
        </Text>
      </View>
      <View style={onboardingHeightStyles.row}>
        <View style={onboardingHeightStyles.scaleContainer}>
          <HeightScale
            initialHeight={height}
            width={svgWidth}
            svgHeight={svgHeight}
            tickBaseWidth={svgWidth * 0.2}
            onChangeHeight={onSetHeight}
          />
        </View>
        <View style={onboardingHeightStyles.valueContainer}>
          <Text style={onboardingHeightStyles.value}>
            {formatHeight(height)}
          </Text>
        </View>
      </View>
      <Animated.View
        style={[onboardingHeightStyles.buttonContainer, { borderColor }]}
      >
        <TouchableOpacity
          style={[
            commonSheetStyles.sheetButton,
            { backgroundColor: primaryAction },
          ]}
          onPress={onSubmit}
        >
          <Text emphasized>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonSheetStyles.sheetButton,
            { backgroundColor: neutralAction },
          ]}
          onPress={onBack}
        >
          <Text emphasized>Back</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
