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
import {
  commonSheetStyles,
  SheetX,
  SheetArrowLeft,
  KeyboardSpacer,
} from "./common";
import { StyleUtils } from "@/util/styles";
import {
  PopupBottomSheetModal,
} from "@/components/util/popup/sheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { tintColor } from "@/util/color";
import { Svg, Line } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Workout } from "@/interface";
import { EditTime } from "./edit-start-end-time";
import { getDateEditDisplay, MONTHS, getHour, getAmOrPm } from "@/util/date";
import { getNumberSuffix } from "@/util/misc";
import { convertHexToRGBA } from "@/util/color";
import * as Haptics from "expo-haptics";

type ValidationResult = {
  isValid: boolean;
  error?: string;
};

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hour = getHour(timestamp);
  const minute = date.getMinutes().toString().padStart(2, "0");
  const ampm = getAmOrPm(timestamp).toLowerCase();

  return `${month}. ${day}${getNumberSuffix(
    day
  )}, ${year} ${hour}:${minute} ${ampm}`;
}

function validateFutureTime(timestamp: number): ValidationResult {
  if (timestamp > Date.now()) {
    const timeStr = formatDateTime(timestamp);
    return {
      isValid: false,
      error: `Time cannot be set in the future '${timeStr}'`,
    };
  }
  return { isValid: true };
}

// todo: move to a shared component
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

const editWorkoutNameStyles = StyleSheet.create({
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
    width: "100%",
  },
});

type EditWorkoutNameProps = {
  name: string;
  onUpdate: (name: string) => void;
  onBack: () => void;
};

function EditWorkoutName({ name, onUpdate, onBack }: EditWorkoutNameProps) {
  const primaryAction = useThemeColoring("primaryAction");
  const backgroundColor = useThemeColoring("appBackground");
  const placeholderColor = tintColor(backgroundColor, 0.2);
  const [selectedName, setSelectedName] = useState(name);
  const textInputFontSize = useSharedValue(60);
  const { width } = useWindowDimensions();
  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    setSelectedName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [name]);

  useEffect(() => {
    textInputFontSize.value = getInputFontSize(selectedName.length);
  }, [selectedName.length]);

  const handleUpdate = useCallback(() => {
    onUpdate(selectedName.trim());
  }, [onUpdate, selectedName]);

  const textInputAnimatedStyle = useAnimatedStyle(() => ({
    fontSize: textInputFontSize.value,
  }));

  const isNameUnchanged = selectedName.trim() === name;
  const isNameEmpty = !selectedName.trim();

  return (
    <>
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          Edit workout name
        </Text>
        <TouchableOpacity onPress={onBack}>
          <SheetArrowLeft />
        </TouchableOpacity>
      </View>
      <View style={editWorkoutNameStyles.container}>
        <View style={editWorkoutNameStyles.inputContainer}>
          <AnimatedTextInput
            ref={inputRef}
            style={[editWorkoutNameStyles.input, textInputAnimatedStyle]}
            placeholder="Workout name"
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
        <View style={editWorkoutNameStyles.buttonContainer}>
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
            <Text neutral emphasized>
              Update
            </Text>
          </TouchableOpacity>
        </View>
        <KeyboardSpacer />
      </View>
    </>
  );
}

const editWorkoutInitialStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "5%",
    paddingBottom: "10%",
  },
  times: {
    ...StyleUtils.flexColumn(),
  },
  timeRow: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: "5%",
  },
  divider: {
    height: 2,
    width: "100%",
  },
});

type EditWorkoutInitialProps = {
  workout: Workout;
  onNamePress: () => void;
  onStartTimePress: () => void;
  onEndTimePress: () => void;
  onHide: () => void;
  disableEndDateEdit?: boolean;
};

function EditWorkoutInitial({
  workout,
  onNamePress,
  onStartTimePress,
  onEndTimePress,
  onHide,
  disableEndDateEdit = false,
}: EditWorkoutInitialProps) {
  const borderColor = convertHexToRGBA(useThemeColoring("lightText"), 0.12);

  return (
    <>
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          Edit workout
        </Text>
        <TouchableOpacity onPress={onHide}>
          <SheetX />
        </TouchableOpacity>
      </View>
      <View style={editWorkoutInitialStyles.container}>
        <TouchableOpacity
          style={editWorkoutInitialStyles.timeRow}
          onPress={onNamePress}
        >
          <Text neutral>Name</Text>
          <Text neutral light>
            {workout.name}
          </Text>
        </TouchableOpacity>
        <View
          style={[
            editWorkoutInitialStyles.divider,
            { backgroundColor: borderColor },
          ]}
        />
        <View style={editWorkoutInitialStyles.times}>
          <TouchableOpacity
            style={editWorkoutInitialStyles.timeRow}
            onPress={onStartTimePress}
          >
            <Text neutral>Start</Text>
            <Text neutral light>
              {getDateEditDisplay(workout.startedAt)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              editWorkoutInitialStyles.timeRow,
              disableEndDateEdit && { opacity: 0.6 },
            ]}
            onPress={disableEndDateEdit ? undefined : onEndTimePress}
            disabled={disableEndDateEdit}
          >
            <Text neutral>End</Text>
            <Text neutral light>
              {disableEndDateEdit
                ? "Current"
                : getDateEditDisplay(workout.endedAt!)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

type EditWorkoutProps = {
  workout: Workout;
  onUpdate: (
    update: Partial<{ name: string; startedAt: number; endedAt: number }>
  ) => void;
  disableEndDateEdit?: boolean;
};

export const EditWorkout = forwardRef<BottomSheetModal, EditWorkoutProps>(
  ({ workout, onUpdate, disableEndDateEdit = false }, ref) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingStartTime, setIsEditingStartTime] = useState(false);
    const [isEditingEndTime, setIsEditingEndTime] = useState(false);

    const handleNamePress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsEditingName(true);
    }, []);

    const handleStartTimePress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsEditingStartTime(true);
    }, []);

    const handleEndTimePress = useCallback(() => {
      if (!disableEndDateEdit) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsEditingEndTime(true);
      }
    }, [disableEndDateEdit]);

    const handleBack = useCallback(() => {
      setIsEditingName(false);
      setIsEditingStartTime(false);
      setIsEditingEndTime(false);
    }, []);

    const handleNameUpdate = useCallback(
      (name: string) => {
        onUpdate({ name });
        setIsEditingName(false);
      },
      [onUpdate]
    );

    const handleStartTimeUpdate = useCallback(
      (timestamp: number) => {
        if (timestamp > workout.endedAt!) {
          onUpdate({ startedAt: timestamp, endedAt: timestamp });
          setIsEditingStartTime(false);
        } else {
          onUpdate({ startedAt: timestamp });
          setIsEditingStartTime(false);
        }
      },
      [onUpdate, workout.endedAt]
    );

    const handleEndTimeUpdate = useCallback(
      (timestamp: number) => {
        if (timestamp < workout.startedAt) {
          onUpdate({ startedAt: timestamp, endedAt: timestamp });
          setIsEditingEndTime(false);
        } else {
          onUpdate({ endedAt: timestamp });
          setIsEditingEndTime(false);
        }
      },
      [onUpdate, workout.startedAt]
    );

    const handleClose = useCallback(() => {
      (ref as any).current?.close();
    }, [ref]);

    const validateStart = useCallback(
      (timestamp: number) => {
        const futureValidation = validateFutureTime(timestamp);
        if (!futureValidation.isValid) return futureValidation;

        if (!disableEndDateEdit && timestamp > workout.endedAt!) {
          const startTimeStr = formatDateTime(timestamp);
          const endTimeStr = formatDateTime(workout.endedAt!);
          return {
            isValid: false,
            error: `Start time '${startTimeStr}' cannot be set after the end time '${endTimeStr}'`,
          };
        }

        return { isValid: true };
      },
      [workout.endedAt, disableEndDateEdit]
    );

    const validateEnd = useCallback(
      (timestamp: number) => {
        const futureValidation = validateFutureTime(timestamp);
        if (!futureValidation.isValid) return futureValidation;

        if (timestamp < workout.startedAt) {
          const endTimeStr = formatDateTime(timestamp);
          const startTimeStr = formatDateTime(workout.startedAt);
          return {
            isValid: false,
            error: `End time '${endTimeStr}' cannot be set before the start time '${startTimeStr}'`,
          };
        }

        return { isValid: true };
      },
      [workout.startedAt]
    );

    return (
      <PopupBottomSheetModal ref={ref}>
        {isEditingName ? (
          <EditWorkoutName
            name={workout.name}
            onUpdate={handleNameUpdate}
            onBack={handleBack}
          />
        ) : isEditingStartTime ? (
          <EditTime
            title="Edit start time"
            timestamp={workout.startedAt}
            onUpdate={handleStartTimeUpdate}
            onBack={handleBack}
            validate={validateStart}
          />
        ) : isEditingEndTime ? (
          <EditTime
            title="Edit end time"
            timestamp={workout.endedAt!}
            onUpdate={handleEndTimeUpdate}
            onBack={handleBack}
            validate={validateEnd}
          />
        ) : (
          <EditWorkoutInitial
            workout={workout}
            onNamePress={handleNamePress}
            onStartTimePress={handleStartTimePress}
            onEndTimePress={handleEndTimePress}
            onHide={handleClose}
            disableEndDateEdit={disableEndDateEdit}
          />
        )}
      </PopupBottomSheetModal>
    );
  }
);
