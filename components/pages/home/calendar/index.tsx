import { useThemeColoring, View } from "@/components/Themed";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { DaysOfWeek, MONTH_HEIGHT, WEEK_HEIGHT } from "./core";
import { StyleUtils } from "@/util/styles";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import React from "react";
import { CalendarDays, ChevronUp } from "lucide-react-native";
import { textTheme } from "@/constants/Themes";
import { MonthsCalendar, WeeksCalendar } from "./infinite";

const calendarStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  content: {
    overflow: "hidden",
  },
  calendar: {
    position: "absolute",
  },
});

type CalendarProps = {
  currentDate: number;
  onSelectDate: (date: number) => void;
  showMonthCalendar: boolean;
  isActive: (date: number) => boolean;
};

enum CalendarState {
  WEEK,
  MONTH,
  BOTH,
}

export function Calendar({
  currentDate,
  onSelectDate,
  showMonthCalendar,
  isActive,
}: CalendarProps) {
  const calendarHeight = useSharedValue(0);
  const [internalCalendarState, setInternalCalendarState] = useState(
    showMonthCalendar ? CalendarState.MONTH : CalendarState.WEEK
  );

  const showOnlyMonthCalendar = () => {
    setInternalCalendarState(CalendarState.MONTH);
  };

  const showOnlyWeekCalendar = () => {
    setInternalCalendarState(CalendarState.WEEK);
  };

  useEffect(() => {
    setInternalCalendarState(CalendarState.BOTH);
    if (showMonthCalendar) {
      calendarHeight.value = withTiming(
        MONTH_HEIGHT - WEEK_HEIGHT,
        {},
        (done) => {
          if (done) {
            runOnJS(showOnlyMonthCalendar)();
          }
        }
      );
    } else {
      calendarHeight.value = withTiming(0, {}, (done) => {
        if (done) {
          runOnJS(showOnlyWeekCalendar)();
        }
      });
    }
  }, [showMonthCalendar]);

  const calendarAnimatedStyle = useAnimatedStyle(() => ({
    height: calendarHeight.value + WEEK_HEIGHT,
  }));

  const weekAnimatedStyle = useAnimatedStyle(() => ({
    zIndex: calendarHeight.value === MONTH_HEIGHT - WEEK_HEIGHT ? 0 : 1,
    opacity: interpolate(
      calendarHeight.value,
      [0, MONTH_HEIGHT - WEEK_HEIGHT],
      [1, 0]
    ),
  }));

  const monthAnimatedStyle = useAnimatedStyle(() => ({
    zIndex: calendarHeight.value === 0 ? 1 : 0,
    opacity: interpolate(
      calendarHeight.value,
      [0, MONTH_HEIGHT - WEEK_HEIGHT],
      [0, 1]
    ),
  }));

  return (
    <View background style={calendarStyles.container}>
      <DaysOfWeek />
      <Animated.View style={[calendarStyles.content, calendarAnimatedStyle]}>
        <Animated.View style={[calendarStyles.calendar, weekAnimatedStyle]}>
          {internalCalendarState !== CalendarState.MONTH && (
            <WeeksCalendar
              currentDate={currentDate}
              onSelectDate={onSelectDate}
              isActive={isActive}
            />
          )}
        </Animated.View>
        <Animated.View style={[calendarStyles.calendar, monthAnimatedStyle]}>
          {internalCalendarState !== CalendarState.WEEK && (
            <MonthsCalendar
              currentDate={currentDate}
              onSelectDate={onSelectDate}
              isActive={isActive}
            />
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const calendarActionStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    alignItems: "center",
  },
});

type CalendarActionProps = {
  showingMonthCalendar: boolean;
  toggle: () => void;
};

export function CalendarHeaderAction({
  showingMonthCalendar,
  toggle,
}: CalendarActionProps) {
  const color = useThemeColoring("primaryAction");

  return (
    <TouchableOpacity onPress={toggle}>
      <View style={calendarActionStyles.container}>
        {showingMonthCalendar && (
          <ChevronUp color={color} size={textTheme.small.fontSize} />
        )}
        <CalendarDays color={color} />
      </View>
    </TouchableOpacity>
  );
}
