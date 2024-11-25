import { View } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { Roulette, RouletteItem } from "./roulette";
import {
  addDays,
  generateDateRange,
  getRouletteDateDisplay,
  Period,
  truncTime,
  AM_OR_PM,
  getAmOrPm,
  HOURS,
  MINUTES,
  usingDateOf,
} from "@/util/date";
import { useCallback, useState } from "react";

const DAYS_TO_DISPLAY = 180;

function generateRouletteDays(timestamp: number) {
  const currentTimestamp = Date.now();
  const differenceInDays =
    (truncTime(currentTimestamp) - truncTime(timestamp)) / Period.DAY;
  if (differenceInDays >= DAYS_TO_DISPLAY / 2) {
    return [
      ...generateDateRange(timestamp, (-1 * DAYS_TO_DISPLAY) / 2),
      ...generateDateRange(addDays(timestamp, 1), DAYS_TO_DISPLAY / 2),
    ];
  } else {
    const precedingDays = DAYS_TO_DISPLAY - differenceInDays;
    return [
      ...generateDateRange(timestamp, -1 * precedingDays),
      ...generateDateRange(addDays(timestamp, 1), differenceInDays),
    ];
  }
}

const datetimePickerStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
  },
});

type DateTimePickerProps = {
  timestamp: number;
  onUpdate: (timestamp: number) => void;
};


// todo: make this a lot better, it works for now and let's move on, but this need to be clean and smooth
export function DateTimePicker({ timestamp, onUpdate }: DateTimePickerProps) {
  const [days, setDays] = useState(generateRouletteDays(timestamp));

  const handleDateLock = useCallback(
    (index: number) => {
      onUpdate(usingDateOf(timestamp, days[index]));
    },
    [timestamp, onUpdate]
  );

  const handleHourLock = useCallback(
    (index: number) => {
      const amOrPm = getAmOrPm(timestamp);
      const date = new Date(timestamp);
      if (amOrPm === "AM") {
        date.setHours(index);
      } else {
        date.setHours(index + 12);
      }
      onUpdate(date.valueOf());
    },
    [timestamp, onUpdate]
  );

  const handleMinutesLock = useCallback(
    (index: number) => {
      const date = new Date(timestamp);
      date.setMinutes(index);
      onUpdate(date.valueOf());
    },
    [timestamp, onUpdate]
  );

  const handleAmOrPmLock = useCallback(
    (index: number) => {
      const date = new Date(timestamp);
      if (AM_OR_PM[index] === "AM") {
        date.setHours(date.getHours() % 12);
      } else {
        date.setHours((date.getHours() % 12) + 12);
      }
      onUpdate(date.valueOf());
    },
    [timestamp, onUpdate]
  );

  return (
    <View style={datetimePickerStyles.container}>
      <Roulette
        numberOfItems={DAYS_TO_DISPLAY}
        currentIndex={days.indexOf(timestamp)}
        onLock={handleDateLock}
        render={(index) => (
          <RouletteItem value={getRouletteDateDisplay(days[index])} />
        )}
      />
      <Roulette
        numberOfItems={HOURS.length}
        currentIndex={new Date(timestamp).getHours() % 12}
        onLock={handleHourLock}
        render={(index) => (
          <RouletteItem value={index % 12 === 0 ? "12" : index.toString()} />
        )}
      />
      <Roulette
        numberOfItems={MINUTES.length}
        currentIndex={new Date(timestamp).getMinutes()}
        onLock={handleMinutesLock}
        render={(index) => (
          <RouletteItem value={index.toString().padStart(2, "0")} />
        )}
      />
      <Roulette
        numberOfItems={2}
        currentIndex={AM_OR_PM.indexOf(getAmOrPm(timestamp))}
        onLock={handleAmOrPmLock}
        render={(index) => <RouletteItem value={AM_OR_PM[index]} />}
      />
    </View>
  );
}
