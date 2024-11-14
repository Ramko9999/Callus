import { View, Text, useThemeColoring } from "@/components/Themed";
import { useKeypad } from "@/context/keypad";
import {
  AssistedBodyWeightDifficulty,
  BodyWeightDifficulty,
  Difficulty,
  DifficultyType,
  TimeDifficulty,
  WeightDifficulty,
} from "@/interface";
import { convertHexToRGBA, getDurationDisplay } from "@/util";
import { StyleUtils } from "@/util/styles";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const inputStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: 10,
  },
  label: {
    ...StyleUtils.flexColumn(3),
  },
  difficulty: {
    ...StyleUtils.flexRow(10),
  },
});

type InputProps = {
  value: string;
  focused: boolean;
  onClick: () => void;
};

function Input({ value, focused, onClick }: InputProps) {
  const focusProgress = useSharedValue(0);

  useEffect(() => {
    /*
    todo: fix the animation on focused
    focusProgress.value = withTiming(focused ? 1 : 0);
    */
  }, [focused]);

  const focusStyle = useAnimatedStyle(
    () => ({
      borderWidth: focusProgress.value,
    }),
    []
  );

  return (
    <TouchableOpacity onPress={onClick}>
      <Animated.View style={[inputStyles.container, focusStyle]}>
        <Text large>{value}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

type WeightInputProps = {
  id: string;
  weight: number;
  onStartUpdate: () => void;
};

function WeightInput({ id, weight, onStartUpdate }: WeightInputProps) {
  const { value, actions, callerId } = useKeypad();
  const isFocused = callerId === id;
  const weightDisplay = `${
    isFocused ? value?.toString() : weight.toString()
  } lbs`.padEnd(15, "");

  return (
    <View style={inputStyles.label}>
      <Text light neutral>
        Weight
      </Text>
      <Input
        value={weightDisplay}
        focused={isFocused}
        onClick={() => {
          actions.editWeight(weight.toString(), id);
        }}
      />
    </View>
  );
}

type RepsInputProps = {
  id: string;
  reps: number;
  onStartUpdate: () => void;
};

function RepsInput({ id, reps, onStartUpdate }: RepsInputProps) {
  const repsDisplay = `${reps.toString()} reps`.padEnd(15, "");

  return (
    <View style={inputStyles.label}>
      <Text light neutral>
        Reps
      </Text>
      <Input focused={false} value={repsDisplay} onClick={onStartUpdate} />
    </View>
  );
}

type TimeInputProps = {
  id: string;
  duration: number;
  onStartUpdate: () => void;
};

function TimeInput({ id, duration, onStartUpdate }: TimeInputProps) {
  const durationDisplay = `${getDurationDisplay(duration)}`.padEnd(12, "");

  return (
    <View style={inputStyles.label}>
      <Text light neutral>
        Duration
      </Text>
      <Input focused={false} value={durationDisplay} onClick={onStartUpdate} />
    </View>
  );
}

type AssistBodyWeightInputProps = WeightInputProps;

function AssistBodyWeightInput({
  id,
  weight,
  onStartUpdate,
}: AssistBodyWeightInputProps) {
  const assistWeightDisplay = `${weight.toString()} lbs`.padEnd(15, "");

  return (
    <View style={inputStyles.label}>
      <Text light neutral>
        Assistance Weight
      </Text>
      <Input
        focused={false}
        value={assistWeightDisplay}
        onClick={onStartUpdate}
      />
    </View>
  );
}

type DifficultyInputProps = {
  id: string;
  type: DifficultyType;
  difficulty: Difficulty;
};

export function DifficultyInput({
  id,
  type,
  difficulty,
}: DifficultyInputProps) {
  switch (type) {
    case DifficultyType.ASSISTED_BODYWEIGHT:
      return (
        <View style={inputStyles.difficulty}>
          <AssistBodyWeightInput
            id={`${id}-weight`}
            weight={
              (difficulty as AssistedBodyWeightDifficulty).assistanceWeight
            }
            onStartUpdate={() => {}}
          />
          <RepsInput
            id={`${id}-reps`}
            reps={(difficulty as AssistedBodyWeightDifficulty).reps}
            onStartUpdate={() => {}}
          />
        </View>
      );
    case DifficultyType.WEIGHT:
      return (
        <View style={inputStyles.difficulty}>
          <WeightInput
            id={`${id}-weight`}
            weight={(difficulty as WeightDifficulty).weight}
            onStartUpdate={() => {}}
          />
          <RepsInput
            id={`${id}-reps`}
            reps={(difficulty as WeightDifficulty).reps}
            onStartUpdate={() => {}}
          />
        </View>
      );
    case DifficultyType.WEIGHTED_BODYWEIGHT:
      return (
        <View style={inputStyles.difficulty}>
          <WeightInput
            id={`${id}-weight`}
            weight={(difficulty as WeightDifficulty).weight}
            onStartUpdate={() => {}}
          />
          <RepsInput
            id={`${id}-reps`}
            reps={(difficulty as WeightDifficulty).reps}
            onStartUpdate={() => {}}
          />
        </View>
      );
    case DifficultyType.BODYWEIGHT:
      return (
        <View style={inputStyles.difficulty}>
          <RepsInput
            id={`${id}-reps`}
            reps={(difficulty as BodyWeightDifficulty).reps}
            onStartUpdate={() => {}}
          />
        </View>
      );
    default:
      return (
        <View style={inputStyles.difficulty}>
          <TimeInput
            id={`${id}-duration`}
            duration={(difficulty as TimeDifficulty).duration}
            onStartUpdate={() => {}}
          />
        </View>
      );
  }
}

const toggleInputStyles = {
  container: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: 10,
    height: 45,
    width: 45,
  },
};

type ToggleInput = {
  isOn: boolean;
  onToggle: () => void;
};

export function ToggleInput({ isOn, onToggle }: ToggleInput) {
  let backgroundStyle: ViewStyle = isOn
    ? { backgroundColor: useThemeColoring("lightText") }
    : { borderWidth: 1 };

  return (
    <TouchableOpacity onPress={() => onToggle()}>
      <View background style={[toggleInputStyles.container, backgroundStyle]} />
    </TouchableOpacity>
  );
}
