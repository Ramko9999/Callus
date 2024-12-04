import { StyleUtils } from "@/util/styles";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { View, Text, useThemeColoring } from "../Themed";
import { useEffect, useState } from "react";
import {
  addDays,
  DAYS_OF_WEEK,
  generateEnclosingMonth,
  generateEnclosingWeek,
  getMonthFirstDay,
  getNextMonth,
  getPreviousMonth,
  removeDays,
  truncTime,
} from "@/util/date";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Entypo } from "@expo/vector-icons";
import { textTheme } from "@/constants/Themes";
import { WorkoutApi } from "@/api/workout";
import Animated, {
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { DragIndicator } from "../theme/icons";

const DISPLAY_WIDTH_MULTIPLER = 1;
const WEEK_HEIGHT = 75;
const MONTH_HEIGHT = WEEK_HEIGHT * 5;
const OVERLAY_DIMENSION = 35;

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
  marker: { marginTop: -5 },
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
  const textColor = useThemeColoring("primaryText");
  const lightColor = useThemeColoring("dynamicHeaderBorder");

  let viewBackgroundColor = isSelected
    ? { backgroundColor: highlightColor }
    : isToday
    ? { backgroundColor: highlightColor, opacity: 0.3 }
    : {};

  let textProps = isMarked ? {} : { light: true };

  return (
    <TouchableOpacity
      style={[dayStyles.container]}
      onPress={() => {
        onClick(day);
      }}
    >
      <View style={[dayStyles.overlay, viewBackgroundColor]}>
        <Text
          {...textProps}
          action
          style={
            isSelected
              ? { color: "white" }
              : !isMarked
              ? { color: lightColor }
              : {}
          }
        >
          {day}
        </Text>
      </View>
      {isMarked && (
        <Animated.View style={dayStyles.marker} entering={FadeIn}>
          <Entypo
            name="dot-single"
            size={textTheme.large.fontSize}
            color={textColor}
          />
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

const daysOfWeekStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
  },
  day: {
    ...StyleUtils.flexRowCenterAll(),
    flex: 1,
  },
});

function DaysOfWeek() {
  const { width } = useWindowDimensions();
  return (
    <View
      style={[
        daysOfWeekStyles.container,
        { width: width * DISPLAY_WIDTH_MULTIPLER },
      ]}
    >
      {DAYS_OF_WEEK.map((day) => (
        <View key={day} style={daysOfWeekStyles.day}>
          <Text neutral light>
            {day}
          </Text>
        </View>
      ))}
    </View>
  );
}

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
  onlyForMonth?: number;
};

function Week({
  week,
  isSelected,
  isMarked,
  isToday,
  onClick,
  onlyForMonth,
}: WeekProps) {
  const { width } = useWindowDimensions();
  return (
    <View
      style={[weekStyles.container, { width: width * DISPLAY_WIDTH_MULTIPLER }]}
    >
      {week.map((dayDate, index) => {
        const date = new Date(dayDate);
        const shouldUsePlaceholder =
          onlyForMonth != undefined &&
          onlyForMonth !== new Date(dayDate).getMonth();
        return shouldUsePlaceholder ? (
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
  month: number;
  isSelected: (date: number) => boolean;
  isMarked: (date: number) => boolean;
  isToday: (date: number) => boolean;
  onClick: (date: number) => void;
};

function Month({
  monthDays,
  month,
  isSelected,
  isMarked,
  isToday,
  onClick,
}: MonthProps) {
  return (
    <View style={monthStyles.container}>
      {monthDays.map((week, index) => (
        <Week
          key={index}
          week={week}
          isSelected={isSelected}
          isMarked={isMarked}
          isToday={isToday}
          onClick={onClick}
          onlyForMonth={month}
        />
      ))}
    </View>
  );
}

const weekCalendarStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
  },
  carousel: {
    ...StyleUtils.flexRow(),
    overflow: "hidden",
  },
});

type WeekCalendarProps = {
  currentDate: number;
  onSelectDate: (date: number) => void;
  isActive: (date: number) => boolean;
};

export function WeekCalendar({
  currentDate,
  onSelectDate,
  isActive,
}: WeekCalendarProps) {
  const translationX = useSharedValue(0);
  const week = generateEnclosingWeek(currentDate);
  const lastWeek = generateEnclosingWeek(removeDays(week[0], 1));
  const nextWeek = generateEnclosingWeek(addDays(week[6], 1));
  const { width } = useWindowDimensions();

  const displayWidth = width * DISPLAY_WIDTH_MULTIPLER;
  const swipeThreshold = displayWidth / 2;

  useEffect(() => {
    translationX.value = 0;
  }, [currentDate]);

  const goToLastWeek = () => {
    onSelectDate(removeDays(currentDate, 7));
  };

  const goToNextWeek = () => {
    onSelectDate(addDays(currentDate, 7));
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translationX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > swipeThreshold) {
        if (event.translationX < 0) {
          translationX.value = withTiming(-1 * displayWidth, {}, (done) => {
            if (done) {
              runOnJS(goToNextWeek)();
            }
          });
        } else {
          translationX.value = withTiming(displayWidth, {}, (done) => {
            if (done) {
              runOnJS(goToLastWeek)();
            }
          });
        }
      } else {
        translationX.value = withTiming(0);
      }
    });

  const weekAnimatedStyle = useAnimatedStyle(() => ({
    left: translationX.value - displayWidth,
  }));

  return (
    <View style={weekCalendarStyles.container}>
      <DaysOfWeek />
      <GestureDetector gesture={panGesture}>
        <View style={[weekCalendarStyles.carousel, { width: displayWidth }]}>
          <Animated.View style={weekAnimatedStyle}>
            <Week
              week={lastWeek}
              isMarked={(date) => false}
              isSelected={(date) => false}
              isToday={(date) => false}
              onClick={() => {}}
            />
          </Animated.View>
          <Animated.View style={weekAnimatedStyle}>
            <Week
              week={week}
              isMarked={isActive}
              isSelected={(date) => date === currentDate}
              isToday={(date) => date === truncTime(Date.now())}
              onClick={onSelectDate}
            />
          </Animated.View>
          <Animated.View style={weekAnimatedStyle}>
            <Week
              week={nextWeek}
              isMarked={(date) => false}
              isSelected={(date) => false}
              isToday={(date) => false}
              onClick={() => {}}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

const monthCalendarStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
  },
  carousel: {
    ...StyleUtils.flexRow(),
    overflow: "hidden",
  },
});

type MonthCalendarProps = {
  currentDate: number;
  onSelectDate: (date: number) => void;
  isActive: (date: number) => boolean;
};

export function MonthCalendar({
  currentDate,
  onSelectDate,
  isActive,
}: MonthCalendarProps) {
  const translationX = useSharedValue(0);

  const month = generateEnclosingMonth(currentDate);
  const lastMonth = generateEnclosingMonth(getPreviousMonth(currentDate));
  const nextMonth = generateEnclosingMonth(getNextMonth(currentDate));

  const { width } = useWindowDimensions();

  const displayWidth = width * DISPLAY_WIDTH_MULTIPLER;
  const swipeThreshold = displayWidth / 2;

  useEffect(() => {
    translationX.value = 0;
  }, [currentDate]);

  const goToLastMonth = () => {
    onSelectDate(getPreviousMonth(currentDate));
  };

  const goToNextMonth = () => {
    onSelectDate(getNextMonth(currentDate));
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translationX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > swipeThreshold) {
        if (event.translationX < 0) {
          translationX.value = withTiming(-1 * displayWidth, {}, (done) => {
            if (done) {
              runOnJS(goToNextMonth)();
            }
          });
        } else {
          translationX.value = withTiming(displayWidth, {}, (done) => {
            if (done) {
              runOnJS(goToLastMonth)();
            }
          });
        }
      } else {
        translationX.value = withTiming(0);
      }
    });

  const monthAnimatedStyle = useAnimatedStyle(() => ({
    left: translationX.value - displayWidth,
  }));

  return (
    <View style={monthCalendarStyles.container}>
      <DaysOfWeek />
      {
        <GestureDetector gesture={panGesture}>
          <View style={[monthCalendarStyles.carousel, { width: displayWidth }]}>
            <Animated.View style={monthAnimatedStyle}>
              <Month
                month={new Date(getPreviousMonth(currentDate)).getMonth()}
                monthDays={lastMonth}
                isMarked={(date) => false}
                isSelected={(date) => false}
                isToday={(date) => false}
                onClick={() => {}}
              />
            </Animated.View>
            <Animated.View style={monthAnimatedStyle}>
              <Month
                month={new Date(currentDate).getMonth()}
                monthDays={month}
                isMarked={isActive}
                isSelected={(date) => date === currentDate}
                isToday={(date) => date === truncTime(Date.now())}
                onClick={onSelectDate}
              />
            </Animated.View>
            <Animated.View style={monthAnimatedStyle}>
              <Month
                month={new Date(getNextMonth(currentDate)).getMonth()}
                monthDays={nextMonth}
                isMarked={(date) => false}
                isSelected={(date) => false}
                isToday={(date) => false}
                onClick={() => {}}
              />
            </Animated.View>
          </View>
        </GestureDetector>
      }
    </View>
  );
}

const workoutCalendarStyles = StyleSheet.create({
  container: {
    marginLeft: "-3%",
    ...StyleUtils.flexColumn(),
    borderRadius: 5,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
  },
  content: {
    overflow: "hidden",
  },
  dragContainer: {
    padding: "3%",
  },
  calendar: {
    position: "absolute",
  },
});

type WorkoutCalendarProps = {
  currentDate: number;
  onSelectDate: (date: number) => void;
};

// todo: fix box shadow
export function WorkoutCalendar({
  currentDate,
  onSelectDate,
}: WorkoutCalendarProps) {
  const previousHeight = useSharedValue(0);
  const calendarHeight = useSharedValue(0);
  const dragThreshold = (MONTH_HEIGHT - WEEK_HEIGHT) / 2;

  const [workedOutDays, setWorkedOutDays] = useState(new Set<number>());

  useEffect(() => {
    WorkoutApi.getWorkedOutDays(
      getNextMonth(currentDate),
      getMonthFirstDay(currentDate)
    ).then(setWorkedOutDays);
  }, [currentDate]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      previousHeight.value = 0;
    })
    .onUpdate((event) => {
      const newHeight =
        calendarHeight.value + event.translationY - previousHeight.value;
      if (newHeight >= 0 && newHeight <= MONTH_HEIGHT - WEEK_HEIGHT) {
        calendarHeight.value = newHeight;
        previousHeight.value = event.translationY;
      }
    })
    .onEnd((event) => {
      calendarHeight.value = withTiming(
        calendarHeight.value < dragThreshold ? 0 : MONTH_HEIGHT - WEEK_HEIGHT
      );
    });

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
    <>
      <View
        background
        style={[
          workoutCalendarStyles.container,
          { shadowColor: useThemeColoring("dynamicHeaderBorder") },
        ]}
      >
        <Animated.View
          style={[workoutCalendarStyles.content, calendarAnimatedStyle]}
        >
          <Animated.View
            style={[workoutCalendarStyles.calendar, weekAnimatedStyle]}
          >
            <WeekCalendar
              currentDate={currentDate}
              onSelectDate={onSelectDate}
              isActive={(date) => workedOutDays.has(date)}
            />
          </Animated.View>
          <Animated.View
            style={[workoutCalendarStyles.calendar, monthAnimatedStyle]}
          >
            <MonthCalendar
              currentDate={currentDate}
              onSelectDate={onSelectDate}
              isActive={(date) => workedOutDays.has(date)}
            />
          </Animated.View>
        </Animated.View>
        <GestureDetector gesture={panGesture}>
          <View style={workoutCalendarStyles.dragContainer}>
            <DragIndicator />
          </View>
        </GestureDetector>
      </View>
    </>
  );
}
