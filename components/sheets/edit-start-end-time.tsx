import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { StyleUtils } from "@/util/styles";
import {
  getDateEditDisplay,
  getRouletteDateDisplay,
  truncTime,
  removeDays,
} from "@/util/date";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import { forwardRef, ForwardedRef, useState, useCallback } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  SharedValue,
  runOnJS,
  withTiming,
  Easing,
  useAnimatedReaction,
} from "react-native-reanimated";
import { Gesture, GestureDetector, State } from "react-native-gesture-handler";
import { convertHexToRGBA } from "@/util/color";
import { SheetX, SheetArrowLeft, commonSheetStyles } from "./common";

const ITEM_HEIGHT = 35;
const VISIBLE_ITEMS = 5;
const LOOKBACK_DAYS = 30;

const snapPoint = (
  value: number,
  velocity: number,
  points: number[]
): number => {
  "worklet";
  const point = value + velocity * 0.2;
  const deltas = points.map((p) => Math.abs(point - p));
  const minDelta = Math.min.apply(null, deltas);
  return points[deltas.indexOf(minDelta)];
};

const timeColonStyles = StyleSheet.create({
  colon: {
    height: ITEM_HEIGHT,
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

const rouletteItemStyles = StyleSheet.create({
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
  },
});

type RouletteItemProps = {
  label: string;
  translateY: SharedValue<number>;
  offset: number;
};

function RouletteItem({ label, translateY, offset }: RouletteItemProps) {
  const style = useAnimatedStyle(() => {
    const maxAngle = 60;
    const angle = interpolate(
      translateY.value + offset,
      [-ITEM_HEIGHT * 2, 0, ITEM_HEIGHT * 2],
      [maxAngle, 0, -maxAngle]
    );
    const opacity = interpolate(
      Math.abs(translateY.value + offset),
      [0, ITEM_HEIGHT * 2],
      [1, 0.3]
    );
    return {
      transform: [{ perspective: 400 }, { rotateX: `${angle}deg` }],
      opacity,
    };
  });

  return (
    <Animated.View style={[rouletteItemStyles.item, style]}>
      <Text neutral>{label}</Text>
    </Animated.View>
  );
}

type RouletteProps = {
  values: string[];
  onSelect: (value: string, index: number) => void;
  defaultIndex?: number;
};

const rouletteStyles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: "hidden",
    alignItems: "center",
  },
  picker: {
    alignItems: "center",
  },
  spacer: {
    height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
  },
});

function Roulette({ values, onSelect, defaultIndex = 0 }: RouletteProps) {
  const translateY = useSharedValue(-defaultIndex * ITEM_HEIGHT);
  const startY = useSharedValue(-defaultIndex * ITEM_HEIGHT);
  const velocity = useSharedValue<number>(0);
  const gestureState = useSharedValue<State>(State.UNDETERMINED);

  const snapPoints = values.map((_, index) => -index * ITEM_HEIGHT);

  const onEnd = (translation: number, velocity: number) => {
    const targetTranslation = snapPoint(translation, velocity, snapPoints);
    const duration = Math.max(Math.abs(velocity / 30), 500);
    translateY.value = withTiming(
      targetTranslation,
      { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1.0) },
      (finished) => {
        if (finished) {
          runOnJS(onSelect)(
            values[snapPoints.indexOf(targetTranslation)],
            snapPoints.indexOf(targetTranslation)
          );
        }
      }
    );
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
      velocity.value = 0;
      gestureState.value = State.BEGAN;
    })
    .onUpdate((event) => {
      translateY.value = startY.value + event.translationY;
      gestureState.value = State.ACTIVE;
    })
    .onEnd(({ velocityY }) => {
      velocity.value = velocityY;
      gestureState.value = State.END;
      runOnJS(onEnd)(translateY.value, velocity.value);
    });

  const pickerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  useAnimatedReaction(
    () =>
      Math.max(
        Math.min(
          Math.round(-translateY.value / ITEM_HEIGHT),
          values.length - 1
        ),
        0
      ),
    (current, previous) => {
      if (current !== previous && previous !== null) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [values.length]
  );

  return (
    <View style={rouletteStyles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[rouletteStyles.picker, pickerAnimatedStyle]}>
          <View style={rouletteStyles.spacer} />
          {values.map((label, i) => (
            <RouletteItem
              key={i}
              label={label}
              translateY={translateY}
              offset={i * ITEM_HEIGHT}
            />
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const timePickerStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
  },
  pickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    ...StyleUtils.flexRowCenterAll(),
    paddingHorizontal: "3%",
  },
  ampmContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
});

type TimePickerProps = {
  timestamp: number;
  onSelect: (timestamp: number) => void;
};

function TimePicker({ timestamp, onSelect }: TimePickerProps) {
  const date = new Date(timestamp);

  // Generate hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  // Generate minutes (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  // AM/PM options
  const meridiem = ["AM", "PM"];

  const handleHourSelect = (value: string) => {
    const newDate = new Date(timestamp);
    const hour = parseInt(value);
    const isPM = newDate.getHours() >= 12;
    newDate.setHours(isPM ? hour + 12 : hour);
    onSelect(newDate.getTime());
  };

  const handleMinuteSelect = (value: string) => {
    const newDate = new Date(timestamp);
    newDate.setMinutes(parseInt(value));
    onSelect(newDate.getTime());
  };

  const handleMeridiemSelect = (value: string) => {
    const newDate = new Date(timestamp);
    const currentHour = newDate.getHours();
    const isPM = value === "PM";
    const newHour = isPM ? (currentHour % 12) + 12 : currentHour % 12;
    newDate.setHours(newHour);
    onSelect(newDate.getTime());
  };

  const getSelectedHours = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours() % 12;
    return hours === 0 ? 11 : hours - 1;
  };

  return (
    <View style={timePickerStyles.container}>
      <View style={timePickerStyles.pickerContainer}>
        <Roulette
          values={hours}
          onSelect={handleHourSelect}
          defaultIndex={getSelectedHours(timestamp)}
        />
      </View>
      <TimeColon />
      <View style={timePickerStyles.pickerContainer}>
        <Roulette
          values={minutes}
          onSelect={handleMinuteSelect}
          defaultIndex={date.getMinutes()}
        />
      </View>
      <View style={timePickerStyles.ampmContainer}>
        <Roulette
          values={meridiem}
          onSelect={handleMeridiemSelect}
          defaultIndex={date.getHours() >= 12 ? 1 : 0}
        />
      </View>
    </View>
  );
}

const datetimePickerStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
  },
  highlight: {
    position: "absolute",
    borderRadius: 10,
    left: 0,
    right: 0,
    top: "50%",
    height: ITEM_HEIGHT,
    marginTop: -ITEM_HEIGHT / 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    zIndex: 1,
    paddingHorizontal: "2%",
  },
});

type DatetimePickerProps = {
  timestamp: number;
  onSelect: (timestamp: number) => void;
};

function DatetimePicker({ timestamp, onSelect }: DatetimePickerProps) {
  const today = truncTime(Date.now());
  const dates = Array.from({ length: LOOKBACK_DAYS }, (_, i) =>
    removeDays(today, i)
  ).reverse();

  const handleDateSelect = (value: string, index: number) => {
    const newDate = new Date(timestamp);
    const selectedDate = new Date(dates[index]);
    newDate.setFullYear(selectedDate.getFullYear());
    newDate.setMonth(selectedDate.getMonth());
    newDate.setDate(selectedDate.getDate());
    onSelect(newDate.getTime());
  };

  return (
    <View style={datetimePickerStyles.container}>
      <View style={datetimePickerStyles.highlight} pointerEvents="none" />
      <Roulette
        values={dates.map((d) => getRouletteDateDisplay(d))}
        onSelect={handleDateSelect}
        defaultIndex={dates.findIndex((d) => d === truncTime(timestamp))}
      />
      <TimePicker timestamp={timestamp} onSelect={onSelect} />
    </View>
  );
}

const editTimeStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingBottom: "10%",
  },
  highlight: {
    position: "absolute",
    borderRadius: 10,
    left: 0,
    right: 0,
    top: "50%",
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  pickerContainer: {
    paddingHorizontal: "5%",
  },
});

type EditTimeProps = {
  title: string;
  timestamp: number;
  onUpdate: (timestamp: number) => void;
  onBack: () => void;
};

function EditTime({ title, timestamp, onUpdate, onBack }: EditTimeProps) {
  const actionColor = useThemeColoring("primaryAction");
  const [currentTimestamp, setCurrentTimestamp] = useState(timestamp);
  const isUnchanged = currentTimestamp === timestamp;

  const handleUpdate = useCallback(() => {
    onUpdate(currentTimestamp);
    onBack();
  }, [onUpdate, currentTimestamp, onBack]);

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
      <View style={editTimeStyles.pickerContainer}>
        <DatetimePicker
          timestamp={currentTimestamp}
          onSelect={setCurrentTimestamp}
        />
        <TouchableOpacity
          style={[
            commonSheetStyles.sheetButton,
            {
              backgroundColor: actionColor,
              opacity: isUnchanged ? 0.5 : 1,
            },
          ]}
          disabled={isUnchanged}
          onPress={handleUpdate}
        >
          <Text neutral emphasized>
            Update
          </Text>
        </TouchableOpacity>
      </View>
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
          />
        ) : isEditingEndTime ? (
          <EditTime
            title="Edit end time"
            timestamp={endedAt as number}
            onUpdate={handleUpdateEndTime}
            onBack={handleBack}
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
