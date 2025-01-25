import { StyleUtils } from "@/util/styles";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import React from "react";
import { DAYS_OF_WEEK } from "@/util/date";

export const WEEK_HEIGHT = 50;
export const MONTH_HEIGHT = WEEK_HEIGHT * 6;

const OVERLAY_DIMENSION = 40;

const dayStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  overlay: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: 5,
    padding: "5%",
    width: OVERLAY_DIMENSION,
    height: OVERLAY_DIMENSION,
  },
});

type DayProps = {
  day: number;
  isSelected: boolean;
  isMarked: boolean;
  isToday: boolean;
  onClick: (day: number) => void;
};

function Day({ day, isSelected, isMarked, isToday, onClick }: DayProps) {
  const highlightColor = useThemeColoring("primaryAction");
  const tonedPrimaryViewColor = useThemeColoring("calendarDayBackground");

  let viewBackgroundColor = isSelected
    ? { backgroundColor: highlightColor }
    : isToday
    ? { backgroundColor: highlightColor, opacity: 0.3 }
    : { backgroundColor: tonedPrimaryViewColor };

  return (
    <TouchableOpacity
      style={dayStyles.container}
      onPress={() => {
        onClick(day);
      }}
    >
      <View style={[dayStyles.overlay, viewBackgroundColor]}>
        <Text light={!(isMarked || isSelected)}>{day}</Text>
      </View>
    </TouchableOpacity>
  );
}

const daysOfWeekStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    paddingBottom: "2%",
  },
  day: {
    ...StyleUtils.flexRowCenterAll(),
    flex: 1,
  },
});

export function DaysOfWeek() {
  return (
    <View style={daysOfWeekStyles.container}>
      {DAYS_OF_WEEK.map((day) => (
        <View key={day} style={daysOfWeekStyles.day}>
          <Text small light>
            {day}
          </Text>
        </View>
      ))}
    </View>
  );
}

const WEEK_SENTINEL = -1;

const weekStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    height: WEEK_HEIGHT,
  },
});

type WeekProps = {
  week: number[];
  isSelected: (date: number) => boolean;
  isMarked: (date: number) => boolean;
  isToday: (date: number) => boolean;
  onClick: (date: number) => void;
};

export function Week({
  week,
  isSelected,
  isMarked,
  isToday,
  onClick,
}: WeekProps) {
  const { width } = useWindowDimensions();
  return (
    <View style={[weekStyles.container, { width: width }]}>
      {week.map((dayDate, index) => {
        const date = new Date(dayDate);
        return dayDate === WEEK_SENTINEL ? (
          <View key={index} style={{ flex: 1 }} />
        ) : (
          <Day
            key={index}
            day={date.getDate()}
            isSelected={isSelected(dayDate)}
            isMarked={isMarked(dayDate)}
            isToday={isToday(dayDate)}
            onClick={() => onClick(dayDate)}
          />
        );
      })}
    </View>
  );
}

const monthStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    height: MONTH_HEIGHT,
  },
});

type MonthProps = {
  monthDays: number[][];
  isSelected: (date: number) => boolean;
  isMarked: (date: number) => boolean;
  isToday: (date: number) => boolean;
  onClick: (date: number) => void;
};

function padWeekAtFront(week: number[]) {
  const padding = Array.from({ length: 7 - week.length }, () => WEEK_SENTINEL);
  return [...padding, ...week];
}

function padWeekAtEnd(week: number[]) {
  const padding = Array.from({ length: 7 - week.length }, () => WEEK_SENTINEL);
  return [...week, ...padding];
}

export function Month({
  monthDays,
  isSelected,
  isMarked,
  isToday,
  onClick,
}: MonthProps) {
  return (
    <View style={monthStyles.container}>
      {monthDays.map((week, index) => {
        const paddedWeek =
          index === 0
            ? padWeekAtFront(week)
            : index === monthDays.length - 1
            ? padWeekAtEnd(week)
            : week;

        return (
          <Week
            key={index}
            week={paddedWeek}
            isSelected={isSelected}
            isMarked={isMarked}
            isToday={isToday}
            onClick={onClick}
          />
        );
      })}
    </View>
  );
}
