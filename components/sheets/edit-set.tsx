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
import { SheetProps } from "./common";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";

import { KeyboardSpacer } from "./common";
import {
  Set,
  WeightDifficulty,
  Exercise,
  BodyWeightDifficulty,
  TimeDifficulty,
  DifficultyType,
} from "@/interface";
import { getDifficultyType } from "@/api/exercise";
import { Plus, Minus } from "lucide-react-native";
import { tintColor } from "@/util/color";
import { WheelPicker, WheelPickerRef } from "@/components/util/wheel-picker";
import { EditField } from "../pages/workout/common";

const WHEEL_ITEM_HEIGHT = 40;

// Generate minutes (0-59)
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);

// Generate seconds (0-59)
const SECONDS = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);

const editStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },

  input: {
    fontWeight: "600",
    textAlign: "left",
  },
  inputWithUnits: {
    ...StyleUtils.flexRow(5),
    alignItems: "baseline",
    flex: 1,
  },
  controlAction: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: "50%",
    padding: "2%",
  },
  controlsContainer: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: "5%",
  },
});

type RepsEditProps = {
  reps: number;
  onUpdate: (reps: number) => void;
  autoFocus?: boolean;
};

function RepsEdit({ reps, onUpdate, autoFocus }: RepsEditProps) {
  const placeholderColor = useThemeColoring("lightText");
  const textColor = useThemeColoring("primaryText");
  const repsInputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        repsInputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleDecrement = () => {
    const newValue = Math.max(0, reps - 1);
    onUpdate(newValue);
  };

  const handleIncrement = () => {
    const newValue = reps + 1;
    onUpdate(newValue);
  };

  return (
    <View style={editStyles.container}>
      <View style={editStyles.inputWithUnits}>
        <TextInput
          extraLarge
          ref={repsInputRef}
          style={editStyles.input}
          value={reps.toString()}
          onChangeText={(text) => onUpdate(parseInt(text) || 0)}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={placeholderColor}
          selectTextOnFocus
        />
        <Text light>reps</Text>
      </View>
      <View style={editStyles.controlsContainer}>
        <TouchableOpacity
          style={editStyles.controlAction}
          onPress={handleDecrement}
        >
          <Minus size={22} color={textColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={editStyles.controlAction}
          onPress={handleIncrement}
        >
          <Plus size={22} color={textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

type WeightEditProps = {
  weight: number;
  onUpdate: (weight: number) => void;
  autoFocus?: boolean;
};

function WeightEdit({ weight, onUpdate, autoFocus }: WeightEditProps) {
  const placeholderColor = useThemeColoring("lightText");
  const textColor = useThemeColoring("primaryText");
  const weightInputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        weightInputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleDecrement = () => {
    const newValue = Math.max(0, weight - 2.5);
    onUpdate(newValue);
  };

  const handleIncrement = () => {
    const newValue = weight + 2.5;
    onUpdate(newValue);
  };

  return (
    <View style={editStyles.container}>
      <View style={editStyles.inputWithUnits}>
        <TextInput
          extraLarge
          ref={weightInputRef}
          style={editStyles.input}
          value={weight.toString()}
          onChangeText={(text) => onUpdate(parseFloat(text) || 0)}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={placeholderColor}
          selectTextOnFocus
        />
        <Text light>lbs</Text>
      </View>
      <View style={editStyles.controlsContainer}>
        <TouchableOpacity
          style={editStyles.controlAction}
          onPress={handleDecrement}
        >
          <Minus size={22} color={textColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={editStyles.controlAction}
          onPress={handleIncrement}
        >
          <Plus size={22} color={textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const durationEditStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
    flex: 1,
  },
  pickerContainer: {
    ...StyleUtils.flexRow(20),
    alignItems: "center",
    justifyContent: "center",
  },
  pickerWrapper: {
    flex: 1,
    alignItems: "center",
  },
  labelStyle: {
    fontSize: 18,
    fontWeight: "600",
  },
});

type DurationEditProps = {
  duration: number; // duration in seconds
  onUpdate: (duration: number) => void;
  autoFocus?: boolean;
  setId: string;
};

function DurationEdit({
  duration,
  onUpdate,
  autoFocus,
  setId,
}: DurationEditProps) {
  // Convert duration from seconds to minutes and seconds
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const minutesPickerRef = useRef<WheelPickerRef>(null);
  const secondsPickerRef = useRef<WheelPickerRef>(null);

  useEffect(() => {
    // Update wheel picker indices when setId changes
    minutesPickerRef.current?.setIndex(minutes);
    secondsPickerRef.current?.setIndex(seconds);
  }, [setId]);

  const handleMinutesSelect = useCallback(
    (value: string) => {
      const newMinutes = parseInt(value);
      const newDuration = newMinutes * 60 + seconds;
      onUpdate(newDuration);
    },
    [seconds, onUpdate]
  );

  const handleSecondsSelect = useCallback(
    (value: string) => {
      const newSeconds = parseInt(value);
      const newDuration = minutes * 60 + newSeconds;
      onUpdate(newDuration);
    },
    [minutes, onUpdate]
  );

  return (
    <View style={durationEditStyles.container}>
      <View style={durationEditStyles.pickerContainer}>
        <View style={durationEditStyles.pickerWrapper}>
          <WheelPicker
            ref={minutesPickerRef}
            values={MINUTES}
            onSelect={handleMinutesSelect}
            defaultIndex={minutes}
            itemHeight={WHEEL_ITEM_HEIGHT}
            labelStyle={durationEditStyles.labelStyle}
          />
          <Text light style={{ marginTop: "2%" }}>
            min
          </Text>
        </View>
        <View style={durationEditStyles.pickerWrapper}>
          <WheelPicker
            ref={secondsPickerRef}
            values={SECONDS}
            onSelect={handleSecondsSelect}
            defaultIndex={seconds}
            itemHeight={WHEEL_ITEM_HEIGHT}
            labelStyle={durationEditStyles.labelStyle}
          />
          <Text light style={{ marginTop: "2%" }}>
            sec
          </Text>
        </View>
      </View>
    </View>
  );
}

const difficultyEditStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(15),
    marginVertical: "3%",
    paddingVertical: "1%",
    paddingHorizontal: "2%",
  },
});
type WeightedDifficultyEditProps = {
  difficulty: WeightDifficulty;
  onUpdate: (difficulty: WeightDifficulty) => void;
  focusField?: EditField;
};

function WeightedDifficultyEdit({
  difficulty,
  onUpdate,
  focusField,
}: WeightedDifficultyEditProps) {
  const { reps, weight } = difficulty;

  const handleRepsUpdate = useCallback(
    (reps: number) => {
      onUpdate({ ...difficulty, reps });
    },
    [difficulty]
  );

  const handleWeightUpdate = useCallback(
    (weight: number) => {
      onUpdate({ ...difficulty, weight });
    },
    [difficulty]
  );

  return (
    <View style={difficultyEditStyles.container}>
      <RepsEdit
        reps={reps}
        onUpdate={handleRepsUpdate}
        autoFocus={focusField === "reps"}
      />
      <WeightEdit
        weight={weight}
        onUpdate={handleWeightUpdate}
        autoFocus={focusField === "weight"}
      />
    </View>
  );
}

type BodyweightDifficultyEditProps = {
  difficulty: BodyWeightDifficulty;
  onUpdate: (difficulty: BodyWeightDifficulty) => void;
  focusField?: EditField;
};

function BodyweightDifficultyEdit({
  difficulty,
  onUpdate,
  focusField,
}: BodyweightDifficultyEditProps) {
  const { reps } = difficulty;

  const handleRepsUpdate = useCallback(
    (reps: number) => {
      onUpdate({ ...difficulty, reps });
    },
    [difficulty]
  );

  return (
    <View style={difficultyEditStyles.container}>
      <RepsEdit
        reps={reps}
        onUpdate={handleRepsUpdate}
        autoFocus={focusField === "reps"}
      />
    </View>
  );
}

type TimeDifficultyEditProps = {
  difficulty: TimeDifficulty;
  onUpdate: (difficulty: TimeDifficulty) => void;
  focusField?: EditField;
  setId: string;
};

function TimeDifficultyEdit({
  difficulty,
  onUpdate,
  focusField,
  setId,
}: TimeDifficultyEditProps) {
  const { duration } = difficulty ?? { duration: 0 };

  const handleDurationUpdate = useCallback(
    (duration: number) => {
      onUpdate({ ...difficulty, duration });
    },
    [difficulty, onUpdate]
  );

  return (
    <View style={difficultyEditStyles.container}>
      <DurationEdit
        duration={duration}
        onUpdate={handleDurationUpdate}
        autoFocus={focusField === "time"}
        setId={setId}
      />
    </View>
  );
}

const editSetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "3%",
    paddingVertical: "3%",
  },
  inputsContainer: {
    ...StyleUtils.flexRow(15),
    marginVertical: "3%",
    paddingVertical: "1%",
  },
  timeSpacer: {
    paddingBottom: "10%",
  },
});

type EditSetSheetProps = SheetProps & {
  exercise: Exercise;
  setId?: string;
  focusField?: EditField;
  onUpdate: (setId: string, update: Partial<Set>) => void;
};

export const EditWeightRepsSetSheet = forwardRef<
  BottomSheet,
  EditSetSheetProps
>(({ show, onHide, exercise, setId, focusField, onUpdate }, ref) => {
  const [currentSetId, setCurrentSetId] = useState<string | undefined>(setId);

  // Find current set from exercise
  const currentSet = exercise.sets.find((set) => set.id === currentSetId);
  const exerciseDifficultyType = getDifficultyType(exercise.name);

  useEffect(() => {
    setCurrentSetId(setId);
  }, [setId]);

  const handleDifficultyUpdate = useCallback(
    (difficulty: WeightDifficulty | BodyWeightDifficulty) => {
      if (currentSetId) {
        onUpdate(currentSetId, { difficulty });
      }
    },
    [currentSetId, onUpdate]
  );

  return (
    <PopupBottomSheet show={show} onHide={onHide} ref={ref}>
      <View style={editSetStyles.container}>
          {currentSet &&
          (exerciseDifficultyType === DifficultyType.WEIGHT ||
            exerciseDifficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) ? (
            <WeightedDifficultyEdit
              difficulty={currentSet.difficulty as WeightDifficulty}
              onUpdate={handleDifficultyUpdate}
              focusField={focusField}
            />
          ) : currentSet ? (
            <BodyweightDifficultyEdit
              difficulty={currentSet.difficulty as BodyWeightDifficulty}
              onUpdate={handleDifficultyUpdate}
              focusField={focusField}
            />
          ) : null}
        <KeyboardSpacer />
      </View>
    </PopupBottomSheet>
  );
});

export const EditDurationSetSheet = forwardRef<BottomSheet, EditSetSheetProps>(
  ({ show, onHide, exercise, setId, focusField, onUpdate }, ref) => {
    const [currentSetId, setCurrentSetId] = useState<string | undefined>(setId);

    const currentSet = exercise.sets.find((set) => set.id === currentSetId);

    useEffect(() => {
      setCurrentSetId(setId);
    }, [setId]);

    const handleDifficultyUpdate = useCallback(
      (difficulty: TimeDifficulty) => {
        if (currentSetId) {
          onUpdate(currentSetId, { difficulty });
        }
      },
      [currentSetId, onUpdate]
    );

    return (
      <PopupBottomSheet show={show} onHide={onHide} ref={ref}>
        <View style={editSetStyles.container}>
            <TimeDifficultyEdit
              difficulty={currentSet?.difficulty as TimeDifficulty}
              onUpdate={handleDifficultyUpdate}
              focusField={focusField}
              setId={currentSetId!}
            />
          <View style={editSetStyles.timeSpacer} />
        </View>
      </PopupBottomSheet>
    );
  }
);

export const EditSetSheet = forwardRef<BottomSheet, EditSetSheetProps>(
  ({ show, hide, onHide, exercise, setId, focusField, onUpdate }, ref) => {
    const exerciseDifficultyType = getDifficultyType(exercise.name);

    if (exerciseDifficultyType === DifficultyType.TIME) {
      return (
        <EditDurationSetSheet
          show={show}
          hide={hide}
          onHide={onHide}
          exercise={exercise}
          setId={setId}
          focusField={focusField}
          onUpdate={onUpdate}
          ref={ref}
        />
      );
    }

    return (
      <EditWeightRepsSetSheet
        show={show}
        hide={hide}
        onHide={onHide}
        exercise={exercise}
        setId={setId}
        focusField={focusField}
        onUpdate={onUpdate}
        ref={ref}
      />
    );
  }
);
