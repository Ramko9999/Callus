import React, { forwardRef, useCallback, useState } from "react";
import { View, Text } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { commonSheetStyles, SheetX, SheetArrowLeft } from "./common";
import { NameEditor } from "./name-editor";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheetModal } from "@/components/util/popup/sheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
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


type EditWorkoutNameProps = {
  name: string;
  onUpdate: (name: string) => void;
  onBack: () => void;
};

function EditWorkoutName({ name, onUpdate, onBack }: EditWorkoutNameProps) {
  const isSubmitDisabled = useCallback(
    (trimmedName: string) => trimmedName.length === 0 || trimmedName === name,
    [name]
  );

  return (
    <NameEditor
      title="Edit workout name"
      placeholder="Workout name"
      // Starts empty so the user types a fresh name rather than editing in place.
      initialName=""
      submitLabel="Update"
      onSubmit={onUpdate}
      resetToken={name}
      focusDelay={100}
      isSubmitDisabled={isSubmitDisabled}
      headerAction={
        <TouchableOpacity onPress={onBack}>
          <SheetArrowLeft />
        </TouchableOpacity>
      }
    />
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
