import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { StyleUtils } from "@/util/styles";
import {
  getDateEditDisplay,
  getRouletteDateDisplay,
  truncTime,
  removeDays,
  MONTHS,
  getHour,
  getAmOrPm,
} from "@/util/date";
import { getNumberSuffix } from "@/util/misc";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import { forwardRef, ForwardedRef, useState, useCallback } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { SheetX, SheetArrowLeft, commonSheetStyles } from "./common";
import { WheelPicker } from "@/components/util/wheel-picker";
import { convertHexToRGBA } from "@/util/color";
import Animated from "react-native-reanimated";

const WHEEL_ITEM_HEIGHT = 40;
const LOOKBACK_DAYS = 30;

// Generate hours (1-12)
const HOURS = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);

// Generate minutes (00-59)
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);

// AM/PM options
const MERIDIEM = ["AM", "PM"];

const TODAY = truncTime(Date.now());
const DATES = Array.from({ length: LOOKBACK_DAYS }, (_, i) =>
  removeDays(TODAY, i)
).reverse();

const ROULETTE_DATES = DATES.map((d) => getRouletteDateDisplay(d));

type Time = {
  hour: number; // 1-12
  minute: number; // 0-59
  isPM: boolean; // true for PM, false for AM
  daysFromToday: number; // 0 for today, positive number for past days
};

function timestampToTime(timestamp: number): Time {
  const date = new Date(timestamp);
  const today = truncTime(Date.now());
  const daysFromToday = (today - truncTime(timestamp)) / (24 * 60 * 60 * 1000);
  const hours = date.getHours();

  return {
    hour: hours % 12 === 0 ? 12 : hours % 12,
    minute: date.getMinutes(),
    isPM: hours >= 12,
    daysFromToday,
  };
}

function timeToTimestamp(time: Time): number {
  const today = truncTime(Date.now());
  const date = new Date(removeDays(today, time.daysFromToday));
  const hours = time.isPM ? (time.hour % 12) + 12 : time.hour % 12;
  date.setHours(hours);
  date.setMinutes(time.minute);
  return date.getTime();
}

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

type ValidationResult = {
  isValid: boolean;
  error?: string;
};

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

const timeColonStyles = StyleSheet.create({
  colon: {
    height: WHEEL_ITEM_HEIGHT,
    paddingHorizontal: "3%",
    ...StyleUtils.flexRowCenterAll(),
  },
  colonInner: {
    ...StyleUtils.flexColumnCenterAll(),
  },
  colonDot: {
    width: 3,
    height: 3,
    borderRadius: 4,
  },
});

function TimeColon() {
  const color = useThemeColoring("primaryText");
  return (
    <View style={timeColonStyles.colon}>
      <View style={timeColonStyles.colonInner}>
        <View style={[timeColonStyles.colonDot, { backgroundColor: color }]} />
        <View style={{ height: 3 }} />
        <View style={[timeColonStyles.colonDot, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

const editTimeStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingBottom: "10%",
  },
  pickerContainer: {
    paddingHorizontal: "5%",
  },
  timePickerContainer: {
    ...StyleUtils.flexRowCenterAll(),
  },
  datePickerWrapper: {
    flex: 2.5,
    alignItems: "center",
  },
  timePickerWrapper: {
    flex: 0.8,
    alignItems: "center",
  },
  meridiemWrapper: {
    flex: 0.6,
    alignItems: "center",
    marginLeft: 12,
  },
  labelStyle: {
    fontSize: 20,
    fontWeight: "600",
  },
  errorContainer: {
    marginTop: "4%",
    marginBottom: "4%",
    paddingHorizontal: "4%",
    paddingVertical: "3%",
    borderRadius: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
  },
});

type EditTimeProps = {
  title: string;
  timestamp: number;
  onUpdate: (timestamp: number) => void;
  onBack: () => void;
  validate: (timestamp: number) => ValidationResult;
};

function EditTime({
  title,
  timestamp,
  onUpdate,
  onBack,
  validate,
}: EditTimeProps) {
  const actionColor = useThemeColoring("primaryAction");
  const errorColor = useThemeColoring("dangerAction");
  const [time, setTime] = useState<Time>(() => timestampToTime(timestamp));
  const currentTimestamp = timeToTimestamp(time);
  const isUnchanged = currentTimestamp === timestamp;

  const validation = validate(currentTimestamp);
  const isDisabled = isUnchanged || !validation.isValid;

  const handleDateSelect = useCallback((_: string, index: number) => {
    setTime((prev) => ({
      ...prev,
      daysFromToday: LOOKBACK_DAYS - 1 - index,
    }));
  }, []);

  const handleHourSelect = useCallback((value: string) => {
    setTime((prev) => ({
      ...prev,
      hour: parseInt(value),
    }));
  }, []);

  const handleMinuteSelect = useCallback((value: string) => {
    setTime((prev) => ({
      ...prev,
      minute: parseInt(value),
    }));
  }, []);

  const handleMeridiemSelect = useCallback((value: string) => {
    setTime((prev) => ({
      ...prev,
      isPM: value === "PM",
    }));
  }, []);

  const handleUpdate = useCallback(() => {
    onUpdate(timeToTimestamp(time));
    onBack();
  }, [time, onUpdate, onBack]);

  return (
    <View style={editTimeStyles.container}>
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          {title}
        </Text>
        <TouchableOpacity onPress={onBack}>
          <SheetArrowLeft />
        </TouchableOpacity>
      </View>
      <Animated.View style={editTimeStyles.pickerContainer}>
        <View style={editTimeStyles.timePickerContainer}>
          <View style={editTimeStyles.datePickerWrapper}>
            <WheelPicker
              values={ROULETTE_DATES}
              onSelect={handleDateSelect}
              defaultIndex={LOOKBACK_DAYS - 1 - time.daysFromToday}
              itemHeight={WHEEL_ITEM_HEIGHT}
              labelStyle={editTimeStyles.labelStyle}
            />
          </View>
          <View style={editTimeStyles.timePickerWrapper}>
            <WheelPicker
              values={HOURS}
              onSelect={handleHourSelect}
              defaultIndex={time.hour - 1}
              itemHeight={WHEEL_ITEM_HEIGHT}
              labelStyle={editTimeStyles.labelStyle}
            />
          </View>
          <TimeColon />
          <View style={editTimeStyles.timePickerWrapper}>
            <WheelPicker
              values={MINUTES}
              onSelect={handleMinuteSelect}
              defaultIndex={time.minute}
              itemHeight={WHEEL_ITEM_HEIGHT}
              labelStyle={editTimeStyles.labelStyle}
            />
          </View>
          <View style={editTimeStyles.meridiemWrapper}>
            <WheelPicker
              values={MERIDIEM}
              onSelect={handleMeridiemSelect}
              defaultIndex={time.isPM ? 1 : 0}
              itemHeight={WHEEL_ITEM_HEIGHT}
              labelStyle={editTimeStyles.labelStyle}
            />
          </View>
        </View>
        {validation.error && (
          <Animated.View
            key={"error"}
            style={[
              editTimeStyles.errorContainer,
              { backgroundColor: convertHexToRGBA(errorColor, 0.1) },
            ]}
          >
            <Text style={[editTimeStyles.errorText, { color: errorColor }]}>
              {validation.error}
            </Text>
          </Animated.View>
        )}
        <TouchableOpacity
          style={[
            commonSheetStyles.sheetButton,
            {
              backgroundColor: actionColor,
              opacity: isDisabled ? 0.5 : 1,
            },
          ]}
          disabled={isDisabled}
          onPress={handleUpdate}
        >
          <Text neutral emphasized>
            Update
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const startEndTimeDisplayStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingBottom: "10%",
  },
  times: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
    paddingHorizontal: "5%",
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

type StartEndTimeDisplayProps = {
  startTime: number;
  endTime: number | null;
  onStartTimePress: () => void;
  onEndTimePress: () => void;
  hide: () => void;
};

function StartEndTimeDisplay({
  startTime,
  endTime,
  onStartTimePress,
  onEndTimePress,
  hide,
}: StartEndTimeDisplayProps) {
  const borderColor = convertHexToRGBA(useThemeColoring("lightText"), 0.12);

  const handleStartTimePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStartTimePress();
  }, [onStartTimePress]);

  const handleEndTimePress = useCallback(() => {
    if (endTime != null) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onEndTimePress();
    }
  }, [onEndTimePress, endTime]);

  return (
    <View style={startEndTimeDisplayStyles.container}>
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          Edit start and end time
        </Text>
        <TouchableOpacity onPress={hide}>
          <SheetX />
        </TouchableOpacity>
      </View>
      <View style={startEndTimeDisplayStyles.times}>
        <TouchableOpacity
          style={startEndTimeDisplayStyles.timeRow}
          onPress={handleStartTimePress}
        >
          <Text neutral>Start</Text>
          <Text neutral light>
            {getDateEditDisplay(startTime)}
          </Text>
        </TouchableOpacity>
        <View
          style={[
            startEndTimeDisplayStyles.divider,
            { backgroundColor: borderColor },
          ]}
        />
        <TouchableOpacity
          style={startEndTimeDisplayStyles.timeRow}
          onPress={handleEndTimePress}
          disabled={endTime == null}
        >
          <Text neutral>End</Text>
          <Text neutral light>
            {endTime != null ? getDateEditDisplay(endTime) : "Currently Active"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type EditStartEndTimesProps = {
  show: boolean;
  hide: () => void;
  onHide: () => void;
  startedAt: number;
  endedAt: number | null;
  onUpdate: (update: Partial<{ startedAt: number; endedAt: number }>) => void;
};

export const EditStartEndTimes = forwardRef(
  (
    {
      show,
      hide,
      onHide,
      startedAt,
      endedAt,
      onUpdate,
    }: EditStartEndTimesProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    const [isEditingStartTime, setIsEditingStartTime] = useState(false);
    const [isEditingEndTime, setIsEditingEndTime] = useState(false);

    const validateStart = useCallback(
      (timestamp: number): ValidationResult => {
        const futureValidation = validateFutureTime(timestamp);
        if (!futureValidation.isValid) return futureValidation;

        if (endedAt && timestamp > endedAt) {
          const startTimeStr = formatDateTime(timestamp);
          const endTimeStr = formatDateTime(endedAt);
          return {
            isValid: false,
            error: `Start time '${startTimeStr}' cannot be set after the end time '${endTimeStr}'`,
          };
        }

        return { isValid: true };
      },
      [endedAt]
    );

    const validateEnd = useCallback(
      (timestamp: number): ValidationResult => {
        const futureValidation = validateFutureTime(timestamp);
        if (!futureValidation.isValid) return futureValidation;

        if (timestamp < startedAt) {
          const endTimeStr = formatDateTime(timestamp);
          const startTimeStr = formatDateTime(startedAt);
          return {
            isValid: false,
            error: `End time '${endTimeStr}' cannot be set before the start time '${startTimeStr}'`,
          };
        }

        return { isValid: true };
      },
      [startedAt]
    );

    const handleStartTimePress = useCallback(() => {
      setIsEditingStartTime(true);
      setIsEditingEndTime(false);
    }, []);

    const handleEndTimePress = useCallback(() => {
      setIsEditingEndTime(true);
      setIsEditingStartTime(false);
    }, []);

    const handleBack = useCallback(() => {
      setIsEditingStartTime(false);
      setIsEditingEndTime(false);
    }, []);

    const onSheetHide = useCallback(() => {
      setIsEditingStartTime(false);
      setIsEditingEndTime(false);
      onHide();
    }, []);

    const handleUpdateEndTime = useCallback(
      (timestamp: number) => {
        if (timestamp < startedAt) {
          onUpdate({ startedAt: timestamp, endedAt: timestamp });
        } else {
          onUpdate({ endedAt: timestamp });
        }
      },
      [onUpdate, startedAt]
    );

    const handleUpdateStartTime = useCallback(
      (timestamp: number) => {
        if (endedAt != undefined && timestamp > endedAt) {
          onUpdate({ startedAt: timestamp, endedAt: timestamp });
        } else {
          onUpdate({ startedAt: timestamp });
        }
      },
      [onUpdate, endedAt]
    );

    return (
      <PopupBottomSheet ref={ref} show={show} onHide={onSheetHide}>
        {isEditingStartTime ? (
          <EditTime
            title="Edit start time"
            timestamp={startedAt}
            onUpdate={handleUpdateStartTime}
            onBack={handleBack}
            validate={validateStart}
          />
        ) : isEditingEndTime ? (
          <EditTime
            title="Edit end time"
            timestamp={endedAt as number}
            onUpdate={handleUpdateEndTime}
            onBack={handleBack}
            validate={validateEnd}
          />
        ) : (
          <StartEndTimeDisplay
            startTime={startedAt}
            endTime={endedAt}
            onStartTimePress={handleStartTimePress}
            onEndTimePress={handleEndTimePress}
            hide={hide}
          />
        )}
      </PopupBottomSheet>
    );
  }
);
