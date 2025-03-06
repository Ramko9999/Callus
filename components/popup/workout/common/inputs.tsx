import { View, Text, useThemeColoring } from "@/components/Themed";
import { useInputsPad } from "@/components/util/popup/inputs-pad/context";
import {
  AssistedBodyWeightDifficulty,
  BodyWeightDifficulty,
  Difficulty,
  DifficultyType,
  TimeDifficulty,
  WeightDifficulty,
  KeypadType,
} from "@/interface";
import { getDurationDisplay } from "@/util/date";
import { EDITOR_SET_HEIGHT, StyleUtils } from "@/util/styles";
import { Check } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const inputStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: 10,
    justifyContent: "flex-start",
  },
  label: {
    ...StyleUtils.flexColumn(3),
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
  onUpdate: (weight: number) => void;
};

function WeightInput({ id, weight, onUpdate }: WeightInputProps) {
  const { value, actions, callerId } = useInputsPad();
  const isFocused = callerId === id;
  const weightDisplay = `${isFocused ? value : weight} lbs`.padEnd(15, "");

  useEffect(() => {
    if (isFocused && value !== "") {
      onUpdate(parseFloat(value));
    }
  }, [isFocused, value]);

  return (
    <View style={inputStyles.label}>
      <Text light neutral>
        Weight
      </Text>
      <Input
        value={weightDisplay}
        focused={isFocused}
        onClick={() => {
          actions.edit(weight.toString(), id, KeypadType.WEIGHT);
        }}
      />
    </View>
  );
}

type RepsInputProps = {
  id: string;
  reps: number;
  onUpdate: (reps: number) => void;
};

function RepsInput({ id, reps, onUpdate }: RepsInputProps) {
  const { value, actions, callerId } = useInputsPad();
  const isFocused = callerId === id;
  const repsDisplay = `${isFocused ? value : reps} reps`.padEnd(15, "");

  useEffect(() => {
    if (isFocused && value !== "") {
      onUpdate(parseFloat(value));
    }
  }, [isFocused, value]);

  return (
    <View style={inputStyles.label}>
      <Text light neutral>
        Reps
      </Text>
      <Input
        focused={false}
        value={repsDisplay}
        onClick={() => {
          actions.edit(reps.toString(), id, KeypadType.REPS);
        }}
      />
    </View>
  );
}

type TimeInputProps = {
  id: string;
  duration: number;
  onUpdate: (duration: number) => void;
};

function TimeInput({ id, duration, onUpdate }: TimeInputProps) {
  const { value, actions, callerId } = useInputsPad();
  const isFocused = callerId === id;

  const durationDisplay = getDurationDisplay(
    isFocused ? parseInt(value) : duration
  ).padEnd(12, "");

  useEffect(() => {
    if (isFocused && value !== "") {
      onUpdate(parseInt(value));
    }
  }, [isFocused, value]);

  return (
    <View style={inputStyles.label}>
      <Text light neutral>
        Duration
      </Text>
      <Input
        focused={false}
        value={durationDisplay}
        onClick={() =>
          actions.edit(duration.toString(), id, KeypadType.DURATION)
        }
      />
    </View>
  );
}

type AssistBodyWeightInputProps = WeightInputProps;

// todo: make this editable and the duration based exercises as well
function AssistBodyWeightInput({
  id,
  weight,
  onUpdate,
}: AssistBodyWeightInputProps) {
  const assistWeightDisplay = `${weight.toString()} lbs`.padEnd(15, "");

  return (
    <View style={inputStyles.label}>
      <Text light neutral>
        Assistance Weight
      </Text>
      <Input focused={false} value={assistWeightDisplay} onClick={() => {}} />
    </View>
  );
}

type DifficultyInputProps = {
  id: string;
  type: DifficultyType;
  difficulty: Difficulty;
  onUpdate: (difficulty: Difficulty) => void;
};

export function DifficultyInput({
  id,
  type,
  difficulty,
  onUpdate,
}: DifficultyInputProps) {
  switch (type) {
    case DifficultyType.ASSISTED_BODYWEIGHT:
      return (
        <>
          <AssistBodyWeightInput
            id={`${id}-weight`}
            weight={
              (difficulty as AssistedBodyWeightDifficulty).assistanceWeight
            }
            onUpdate={(assistanceWeight: number) =>
              onUpdate({ ...difficulty, assistanceWeight })
            }
          />
          <RepsInput
            id={`${id}-reps`}
            reps={(difficulty as AssistedBodyWeightDifficulty).reps}
            onUpdate={(reps: number) => {
              onUpdate({ ...difficulty, reps });
            }}
          />
        </>
      );
    case DifficultyType.WEIGHT:
      return (
        <>
          <WeightInput
            id={`${id}-weight`}
            weight={(difficulty as WeightDifficulty).weight}
            onUpdate={(weight: number) => onUpdate({ ...difficulty, weight })}
          />
          <RepsInput
            id={`${id}-reps`}
            reps={(difficulty as WeightDifficulty).reps}
            onUpdate={(reps: number) => {
              onUpdate({ ...difficulty, reps });
            }}
          />
        </>
      );
    case DifficultyType.WEIGHTED_BODYWEIGHT:
      return (
        <>
          <WeightInput
            id={`${id}-weight`}
            weight={(difficulty as WeightDifficulty).weight}
            onUpdate={(weight: number) => onUpdate({ ...difficulty, weight })}
          />
          <RepsInput
            id={`${id}-reps`}
            reps={(difficulty as WeightDifficulty).reps}
            onUpdate={(reps: number) => {
              onUpdate({ ...difficulty, reps });
            }}
          />
        </>
      );
    case DifficultyType.BODYWEIGHT:
      return (
        <>
          <RepsInput
            id={`${id}-reps`}
            reps={(difficulty as BodyWeightDifficulty).reps}
            onUpdate={(reps: number) => {
              onUpdate({ ...difficulty, reps });
            }}
          />
        </>
      );
    default:
      return (
        <>
          <TimeInput
            id={`${id}-duration`}
            duration={(difficulty as TimeDifficulty).duration}
            onUpdate={(duration: number) =>
              onUpdate({ ...difficulty, duration })
            }
          />
        </>
      );
  }
}

const setIndexStyles = StyleSheet.create({
  index: {
    alignSelf: "center",
  },
});

type SetIndexProps = {
  index: number;
};

export function SetIndex({ index }: SetIndexProps) {
  return (
    <View style={inputStyles.label}>
      <Text light>Set</Text>
      <View style={setIndexStyles.index}>
        <Text large>{index + 1}</Text>
      </View>
    </View>
  );
}

const setStatusInputStyles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
  check: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: 5,
    height: EDITOR_SET_HEIGHT - 20,
    width: EDITOR_SET_HEIGHT - 20,
    alignSelf: "flex-end",
  },
});

type SetStatusInputProps = {
  isActive: boolean;
  onToggle: () => void;
};

export function SetStatusInput({ isActive, onToggle }: SetStatusInputProps) {
  const setColor = useSharedValue(isActive ? 1 : 0);
  const notStartedColor = useThemeColoring("calendarDayBackground");
  const finishedColor = useThemeColoring("primaryAction");

  useEffect(() => {
    setColor.value = withTiming(isActive ? 1 : 0);
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        setColor.value,
        [0, 1],
        [notStartedColor, finishedColor]
      ),
    }),
    []
  );

  return (
    <TouchableOpacity onPress={onToggle} style={setStatusInputStyles.container}>
      <Animated.View style={[setStatusInputStyles.check, animatedStyle]}>
        <Check color={useThemeColoring("primaryText")} strokeWidth={3} />
      </Animated.View>
    </TouchableOpacity>
  );
}
