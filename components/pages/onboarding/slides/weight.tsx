import React, { useEffect, useRef } from "react";
import { View, Text } from "@/components/Themed";
import {
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { convertHexToRGBA, tintColor } from "@/util/color";
import { commonSheetStyles } from "@/components/sheets/common";
import { StyleUtils } from "@/util/styles";
import * as Haptics from "expo-haptics";
import { commonSlideStyles } from "./common";
import { WeightScale } from "@/components/util/scale/weight";
import Animated from "react-native-reanimated";

const onboardingWeightStyles = StyleSheet.create({
  inputContainer: {
    ...StyleUtils.flexColumnCenterAll(20),
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
    ...StyleUtils.flexColumn(20),
  },
});

type OnboardingWeightProps = {
  weight: number;
  onBack: () => void;
  onSubmit: () => void;
  onSetWeight: (weight: number) => void;
};

export function OnboardingWeight({
  weight,
  onSetWeight,
  onSubmit,
  onBack,
}: OnboardingWeightProps) {
  const primaryAction = useThemeColoring("primaryAction");
  const borderColor = convertHexToRGBA(useThemeColoring("lightText"), 0.1);
  const { width, height } = useWindowDimensions();
  const firstRender = useRef(false);

  const neutralAction = tintColor(useThemeColoring("appBackground"), 0.1);

  useEffect(() => {
    if (!firstRender.current) {
      firstRender.current = true;
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [weight]);

  const svgWidth = width * 0.9;

  return (
    <View style={commonSlideStyles.container}>
      <View style={commonSlideStyles.header}>
        <Text style={commonSlideStyles.title}>How much do you weigh?</Text>
        <Text light>
          We use your bodyweight to estimate your volume and strength on certain
          exercises.
        </Text>
      </View>
      <View style={onboardingWeightStyles.inputContainer}>
        <Text style={onboardingWeightStyles.input}>{`${weight} lbs`}</Text>
        <WeightScale
          initialWeight={weight}
          width={svgWidth}
          height={height * 0.15}
          tickBaseHeight={height * 0.05}
          onChangeWeight={onSetWeight}
        />
        <Text light>Slide to adjust</Text>
      </View>
      <Animated.View
        style={[onboardingWeightStyles.buttonContainer, { borderColor }]}
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
