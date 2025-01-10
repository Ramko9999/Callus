import { StyleUtils } from "@/util/styles";
import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { Roulette } from "../list/roulette";
import { textTheme } from "@/constants/Themes";
import {
  addDays,
  generateDateRange,
  getDateEditDisplay,
  getDaysBetween,
  getRouletteDateDisplay,
  MONTHS,
  removeDays,
  truncTime,
} from "@/util/date";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ArrayUtils } from "@/util/misc";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Meridiem = "AM" | "PM";

type Timestamp = {
  date: string;
  hours: number;
  minutes: number;
  meridiem: Meridiem;
};

const HOURS = Array.from({ length: 12 }).map((_, index) =>
  (index + 1).toString()
);
const MINUTES = Array.from({ length: 60 }).map((_, index) =>
  index.toString().padStart(2, "0")
);
const MERIDIEMS = ["AM", "PM"];

const ROULETTE_ITEM_HEIGHT = 30;
const DAYS_TO_DISPLAY = 20;

function getMeridianAdjusedHour(hour: number) {
  const adjusted = hour % 12;
  return adjusted === 0 ? 12 : adjusted;
}

function alterHour(timestamp: number, hour: number, meridiem: Meridiem) {
  const date = new Date(timestamp);
  const meridianAdjustedHour = hour % 12;
  const militaryHour =
    meridiem === "AM" ? meridianAdjustedHour : meridianAdjustedHour + 12;
  date.setHours(militaryHour);
  return date.valueOf();
}

function alterMinutes(timestamp: number, minutes: number) {
  const date = new Date(timestamp);
  date.setMinutes(minutes);
  return date.valueOf();
}

function alterDate(timestamp: number, date: string) {
  const [_, month, days, year] = date.split(" ");
  const timestampDate = new Date(timestamp);
  timestampDate.setDate(parseInt(days));
  timestampDate.setMonth(MONTHS.indexOf(month));
  timestampDate.setFullYear(parseInt(year));
  return timestampDate.valueOf();
}

function extractTimestamp(timestamp: number): Timestamp {
  const timestampDate = new Date(timestamp);
  const hours = timestampDate.getHours();
  const minutes = timestampDate.getMinutes();
  const date = getRouletteDateDisplay(timestamp);
  return {
    hours,
    minutes,
    date,
    meridiem: hours < 12 ? "AM" : "PM",
  };
}

function generateDates(timestamp: number) {
  const daysBetween = getDaysBetween(
    truncTime(timestamp),
    truncTime(Date.now())
  );
  if (daysBetween >= DAYS_TO_DISPLAY) {
    return [
      ...generateDateRange(timestamp, (-1 * DAYS_TO_DISPLAY) / 2),
      ...generateDateRange(addDays(timestamp, 1), DAYS_TO_DISPLAY / 2),
    ];
  } else {
    const precedingDays = DAYS_TO_DISPLAY - daysBetween;
    return [
      ...generateDateRange(timestamp, -1 * precedingDays),
      ...generateDateRange(addDays(timestamp, 1), daysBetween),
    ];
  }
}

function toPickerDate(timestamp: number) {
  return getRouletteDateDisplay(timestamp);
}

function generatePreviousDates(dates: number[]): Promise<number[]> {
  return new Promise((resolve, _) => {
    const previousDates = generateDateRange(
      removeDays(dates[0], 1),
      -1 * DAYS_TO_DISPLAY
    );
    setTimeout(() => {
      resolve([...previousDates, ...dates]);
    }, 1000);
  });
}

function generateNextDates(dates: number[]): Promise<number[]> {
  return new Promise((resolve, _) => {
    const nextDates = generateDateRange(
      addDays(ArrayUtils.last(dates), 1),
      DAYS_TO_DISPLAY
    ).filter((date) => truncTime(date) <= truncTime(Date.now()));

    setTimeout(() => {
      resolve([...dates, ...nextDates]);
    }, 1000);
  });
}

const timestampPickerStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
  },
  colon: {
    ...StyleUtils.flexRowCenterAll(),
    height: ROULETTE_ITEM_HEIGHT,
    alignSelf: "center",
  },
  selection: {
    position: "absolute",
    width: "100%",
    height: ROULETTE_ITEM_HEIGHT,
    top: 2 * ROULETTE_ITEM_HEIGHT,
  },
  gap: {
    marginLeft: 10,
  },
});

type TimestampPickerProps = {
  timestamp: number;
  onUpdate: (timestamp: number) => void;
};

function TimestampPicker({ timestamp, onUpdate }: TimestampPickerProps) {
  const [dates, setDates] = useState(generateDates(timestamp));
  const { hours, minutes, date, meridiem } = extractTimestamp(timestamp);

  const canGenerateNextDays =
    truncTime(ArrayUtils.last(dates)) < truncTime(Date.now());

  const sharedProps = {
    valueSize: textTheme.neutral.fontSize,
    itemHeight: ROULETTE_ITEM_HEIGHT,
  };

  return (
    <View style={timestampPickerStyles.container}>
      <View
        style={[
          timestampPickerStyles.selection,
          { backgroundColor: useThemeColoring("rouletteSelection") },
        ]}
      />
      <Roulette
        values={dates.map(toPickerDate)}
        onSelect={(date) => onUpdate(alterDate(timestamp, date))}
        initialValue={date}
        loadPrevious={() => generatePreviousDates(dates).then(setDates)}
        loadNext={
          canGenerateNextDays
            ? () => generateNextDates(dates).then(setDates)
            : undefined
        }
        {...sharedProps}
      />
      <Roulette
        values={HOURS}
        onSelect={(hour) =>
          onUpdate(alterHour(timestamp, parseInt(hour), meridiem))
        }
        initialValue={getMeridianAdjusedHour(hours).toString()}
        containerStyle={timestampPickerStyles.gap}
        {...sharedProps}
      />
      <View style={timestampPickerStyles.colon}>
        <Text neutral>:</Text>
      </View>
      <Roulette
        values={MINUTES}
        onSelect={(minutes) =>
          onUpdate(alterMinutes(timestamp, parseInt(minutes)))
        }
        initialValue={minutes.toString().padStart(2, "0")}
        {...sharedProps}
      />
      <Roulette
        values={MERIDIEMS}
        onSelect={(meridiem) =>
          onUpdate(alterHour(timestamp, hours, meridiem as Meridiem))
        }
        initialValue={meridiem}
        containerStyle={timestampPickerStyles.gap}
        {...sharedProps}
      />
    </View>
  );
}

const timestampEditStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  preview: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
  },
  picker: {
    overflow: "hidden",
  },
});

type TimestampEditRef = {
  hide: () => void;
};

type TimestampEditProps = {
  label: string;
  isEditing: boolean;
  onHide: () => void;
  onClick: () => void;
  onUpdate: (timestamp: number) => void;
  timestamp: number;
};

const TimestampEdit = forwardRef<TimestampEditRef, TimestampEditProps>(
  ({ label, isEditing, timestamp, onHide, onClick, onUpdate }, ref) => {
    const pickerVisibility = useSharedValue(0);

    useEffect(() => {
      if (isEditing) {
        pickerVisibility.value = withTiming(1);
      }
    }, [isEditing]);

    const hide = () => {
      pickerVisibility.value = withTiming(0, {}, (done) => {
        if (done) {
          runOnJS(onHide)();
        }
      });
    };

    useImperativeHandle(ref, () => ({
      hide,
    }));

    const pickerAnimatedStyle = useAnimatedStyle(() => ({
      height: pickerVisibility.value * ROULETTE_ITEM_HEIGHT * 5,
    }));

    return (
      <View style={timestampEditStyles.container}>
        <TouchableOpacity style={timestampEditStyles.preview} onPress={onClick}>
          <Text>{label}</Text>
          <Text light>{getDateEditDisplay(timestamp)}</Text>
        </TouchableOpacity>
        {isEditing && (
          <Animated.View
            style={[timestampEditStyles.picker, pickerAnimatedStyle]}
          >
            <TimestampPicker timestamp={timestamp} onUpdate={onUpdate} />
          </Animated.View>
        )}
      </View>
    );
  }
);

type CurrentlyActiveTimestampProps = {
  label: string;
};

function CurrentlyActiveTimestamp({ label }: CurrentlyActiveTimestampProps) {
  return (
    <View style={timestampEditStyles.container}>
      <View style={timestampEditStyles.preview}>
        <Text neutral>{label}</Text>
        <Text neutral>Currently Active</Text>
      </View>
    </View>
  );
}

const timestampRangeEditorStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(15),
  },
});

type TimestampRangeEditorProps = {
  startTime: number;
  endTime?: number; // if it isn't passed, it is assumed to the current time
  onUpdateStartTime: (startTime: number) => void;
  onUpdateEndTime: (endTime: number) => void;
};

type TimestampRangeEditorState = {
  isEditingStartTime: boolean;
  isEditingEndTime: boolean;
};

export function TimestampRangeEditor({
  startTime,
  endTime,
  onUpdateStartTime,
  onUpdateEndTime,
}: TimestampRangeEditorProps) {
  const [state, setState] = useState<TimestampRangeEditorState>({
    isEditingEndTime: false,
    isEditingStartTime: false,
  });
  const startTimeRef = useRef<TimestampEditRef>(null);
  const endTimeRef = useRef<TimestampEditRef>(null);

  const handleUpdateStartTime = (startTime: number) => {
    if (endTime != undefined && startTime > endTime) {
      onUpdateEndTime(startTime);
    }
    onUpdateStartTime(startTime);
  };

  const handleUpdateEndTime = (endTime: number) => {
    if (endTime < startTime) {
      onUpdateStartTime(endTime);
    }
    onUpdateEndTime(endTime);
  };

  return (
    <View background style={timestampRangeEditorStyles.container}>
      <TimestampEdit
        ref={startTimeRef}
        label="Start Time"
        isEditing={state.isEditingStartTime}
        timestamp={startTime}
        onHide={() => setState((s) => ({ ...s, isEditingStartTime: false }))}
        onClick={() => {
          if (state.isEditingStartTime) {
            startTimeRef.current?.hide();
          } else {
            endTimeRef.current?.hide();
            setState((s) => ({ ...s, isEditingStartTime: true }));
          }
        }}
        onUpdate={handleUpdateStartTime}
      />
      {endTime ? (
        <TimestampEdit
          ref={endTimeRef}
          label="End Time"
          isEditing={state.isEditingEndTime}
          timestamp={endTime}
          onHide={() => setState((s) => ({ ...s, isEditingEndTime: false }))}
          onClick={() => {
            if (state.isEditingEndTime) {
              endTimeRef.current?.hide();
            } else {
              startTimeRef.current?.hide();
              setState((s) => ({ ...s, isEditingEndTime: true }));
            }
          }}
          onUpdate={handleUpdateEndTime}
        />
      ) : (
        <CurrentlyActiveTimestamp label="End Time" />
      )}
    </View>
  );
}
