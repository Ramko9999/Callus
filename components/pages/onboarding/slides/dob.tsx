import React, { useCallback, useRef, useMemo } from "react";
import { View, Text } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { convertHexToRGBA, tintColor } from "@/util/color";
import { commonSheetStyles } from "@/components/sheets/common";
import { StyleUtils } from "@/util/styles";
import { commonSlideStyles, DateOfBirth } from "./common";
import { WheelPicker, WheelPickerRef } from "@/components/util/wheel-picker";

const WHEEL_ITEM_HEIGHT = 50;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function generateYears(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = currentYear - 100; year <= currentYear - 2; year++) {
    years.push(year.toString());
  }
  return years;
}

function generateDays(month: number, year: number): string[] {
  const daysInMonth = getDaysInMonth(month, year);
  return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
}

const onboardingDobStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleUtils.flexColumn(),
    width: "100%",
    paddingHorizontal: "5%",
    paddingTop: "8%",
    paddingBottom: "3%",
  },
  pickerContainer: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    height: "60%",
    marginTop: "10%",
  },
  pickerWrapper: {
    flex: 1,
    alignItems: "center",
  },
  monthWrapper: {
    flex: 1.4,
    alignItems: "center",
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
  labelStyle: {
    fontSize: 20,
    fontWeight: "600",
  },
});

type OnboardingDobProps = {
  dob: DateOfBirth;
  onSetDob: (dob: Partial<DateOfBirth>) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function OnboardingDob({
  dob,
  onSetDob,
  onSubmit,
  onBack,
}: OnboardingDobProps) {
  const primaryAction = useThemeColoring("primaryAction");
  const backgroundColor = useThemeColoring("appBackground");
  const borderColor = convertHexToRGBA(useThemeColoring("lightText"), 0.1);
  const neutralAction = tintColor(backgroundColor, 0.1);
  const dayPickerRef = useRef<WheelPickerRef>(null);

  const years = generateYears();

  const days = useMemo(
    () => generateDays(dob.month, dob.year),
    [dob.month, dob.year]
  );

  const handleMonthSelect = useCallback(
    (value: string, index: number) => {
      onSetDob({ month: index + 1 });
    },
    [onSetDob]
  );

  const handleDaySelect = useCallback(
    (value: string, index: number) => {
      onSetDob({ day: index + 1 });
    },
    [onSetDob]
  );

  const handleYearSelect = useCallback(
    (value: string, index: number) => {
      onSetDob({ year: parseInt(value) });
    },
    [onSetDob]
  );

  return (
    <View style={commonSlideStyles.container}>
      <View style={commonSlideStyles.header}>
        <Text style={commonSlideStyles.title}>When is your birthday?</Text>
        <Text light>Your body changes as you age. We tailor your workout experience to your age.</Text>
      </View>
      <View style={onboardingDobStyles.pickerContainer}>
        <View style={onboardingDobStyles.monthWrapper}>
          <WheelPicker
            values={MONTHS}
            onSelect={handleMonthSelect}
            defaultIndex={dob.month - 1}
            itemHeight={WHEEL_ITEM_HEIGHT}
            labelStyle={onboardingDobStyles.labelStyle}
          />
        </View>
        <View style={onboardingDobStyles.pickerWrapper}>
          <WheelPicker
            ref={dayPickerRef}
            values={days}
            onSelect={handleDaySelect}
            defaultIndex={dob.day - 1}
            itemHeight={WHEEL_ITEM_HEIGHT}
            labelStyle={onboardingDobStyles.labelStyle}
          />
        </View>
        <View style={onboardingDobStyles.pickerWrapper}>
          <WheelPicker
            values={years}
            onSelect={handleYearSelect}
            defaultIndex={years.indexOf(dob.year.toString())}
            itemHeight={WHEEL_ITEM_HEIGHT}
            labelStyle={onboardingDobStyles.labelStyle}
          />
        </View>
      </View>
      <View style={[onboardingDobStyles.buttonContainer, { borderColor }]}>
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
      </View>
    </View>
  );
}
