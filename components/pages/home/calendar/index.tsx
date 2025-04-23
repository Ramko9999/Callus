import { useCallback, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import PagerView from "react-native-pager-view";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useThemeColoring, Text, View } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { generateEnclosingMonth, DAYS_OF_WEEK, truncTime } from "@/util/date";
import { WorkoutApi } from "@/api/workout";
import { useFocusEffect } from "@react-navigation/native";

// Day Component
const dayStyles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    ...StyleUtils.flexRowCenterAll(),
  },
  overlay: {
    position: "absolute",
    aspectRatio: 1,
    borderWidth: 1,
    height: "65%",
    borderRadius: "50%",
  },
  otherMonth: {
    opacity: 0.5,
  },
  dot: {
    position: "absolute",
    bottom: "20%",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

type DayProps = {
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isMarked: boolean;
  onPress: () => void;
};

function Day({ day, isCurrentMonth, isSelected, isMarked, onPress }: DayProps) {
  const primaryColor = useThemeColoring("primaryAction");
  const textColor = useThemeColoring("primaryText");

  return (
    <TouchableOpacity
      style={[dayStyles.container, !isCurrentMonth && dayStyles.otherMonth]}
      onPress={onPress}
      disabled={!isCurrentMonth}
    >
      {isSelected && (
        <View
          style={[
            dayStyles.overlay,
            {
              backgroundColor: primaryColor,
            },
          ]}
        />
      )}
      <Text
        sneutral
        style={[{ color: textColor }, isSelected && { fontWeight: "600" }]}
      >
        {new Date(day).getDate()}
      </Text>
      {isMarked && !isSelected && (
        <View
          style={[
            dayStyles.dot,
            {
              backgroundColor: primaryColor,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

// Month Component
const monthStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingBottom: "4%",
    flex: 1,
  },
  week: {
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    flex: 1,
  },
});

type MonthProps = {
  year: number;
  month: number;
  selectedDate: number | null;
  onDayClick: (day: number) => void;
};

function Month({ year, month, selectedDate, onDayClick }: MonthProps) {
  const weeks = generateEnclosingMonth(new Date(year, month, 1).getTime());
  const currentMonth = new Date(year, month, 1).getMonth();
  const [workedOutDays, setWorkedOutDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    const monthStart = new Date(year, month, 1).getTime();
    const monthEnd = new Date(year, month + 1, 0).getTime();

    WorkoutApi.getWorkedOutDays(monthEnd, monthStart).then(setWorkedOutDays);
  }, [year, month]);

  useFocusEffect(
    useCallback(() => {
      const monthStart = new Date(year, month, 1).getTime();
      const monthEnd = new Date(year, month + 1, 0).getTime();

      WorkoutApi.getWorkedOutDays(monthEnd, monthStart).then(setWorkedOutDays);
    }, [year, month])
  );

  return (
    <View style={monthStyles.container}>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={monthStyles.week}>
          {week.map((day, dayIndex) => {
            const date = new Date(day);
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isSelected =
              selectedDate === date.getTime() && isCurrentMonth;
            const isMarked = workedOutDays.has(day);

            return (
              <Day
                key={dayIndex}
                day={day}
                isCurrentMonth={isCurrentMonth}
                isSelected={isSelected}
                isMarked={isMarked}
                onPress={() => onDayClick(day)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// CalendarHeader Component
const calendarHeaderStyles = StyleSheet.create({
  container: {
    borderRadius: 5,
    overflow: "hidden",
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "4%",
    paddingTop: "1%",
    paddingBottom: "2%",
  },
  navigation: {
    ...StyleUtils.flexRow(10),
    justifyContent: "flex-end",
  },
  chevron: {
    padding: "3%",
  },
});

type CalendarHeaderProps = {
  monthDatum: MonthData;
  canGoBack: boolean;
  onGoBack: () => void;
  canGoForward: boolean;
  onGoForward: () => void;
};

function CalendarHeader({
  monthDatum,
  canGoBack,
  onGoBack,
  canGoForward,
  onGoForward,
}: CalendarHeaderProps) {
  const chevronActiveColor = useThemeColoring("primaryText");
  const chevronDisabledColor = useThemeColoring("lightText");

  return (
    <View style={calendarHeaderStyles.container}>
      <Text style={{ fontSize: 18 }} emphasized>
        {new Date(monthDatum.year, monthDatum.month).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </Text>
      <View style={calendarHeaderStyles.navigation}>
        <TouchableOpacity
          style={calendarHeaderStyles.chevron}
          onPress={onGoBack}
          disabled={!canGoBack}
        >
          <ChevronLeft
            size={24}
            color={canGoBack ? chevronActiveColor : chevronDisabledColor}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={calendarHeaderStyles.chevron}
          onPress={onGoForward}
          disabled={!canGoForward}
        >
          <ChevronRight
            size={24}
            color={canGoForward ? chevronActiveColor : chevronDisabledColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// DaysOfWeek Component
const daysOfWeekStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    paddingTop: "3%",
  },
  day: {
    fontSize: 14,
    flex: 1,
    textAlign: "center",
    opacity: 0.7,
  },
});

type DaysOfWeekProps = {
  textColor: string;
};

function DaysOfWeek({ textColor }: DaysOfWeekProps) {
  return (
    <View style={daysOfWeekStyles.container}>
      {DAYS_OF_WEEK.map((day) => (
        <Text key={day} style={[daysOfWeekStyles.day, { color: textColor }]}>
          {day}
        </Text>
      ))}
    </View>
  );
}

// Calendar Component
const calendarStyles = StyleSheet.create({
  container: {
    width: "94%",
    ...StyleUtils.flexColumn(),
    alignSelf: "center",
    paddingTop: "2%",
    borderRadius: 5,
    overflow: "hidden",
  },
  page: {
    flex: 1,
  },
});

type CalendarProps = {
  onDateChange?: (item: CalendarItem) => void;
};

export function Calendar({ onDateChange }: CalendarProps) {
  const [data] = useState<MonthData[]>(generateMonthsData(Date.now()));
  const [currentPage, setCurrentPage] = useState(
    findIndexThatContainsDate(data, Date.now())
  );
  const [selectedItem, setSelectedItem] = useState<CalendarItem>(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: null,
    };
  });
  const pagerRef = useRef<PagerView>(null);
  const textColor = useThemeColoring("primaryText");
  const { height } = useWindowDimensions();

  const onPageSelected = useCallback(
    (event: any) => {
      const newIndex = event.nativeEvent.position;
      setCurrentPage(newIndex);
      const newMonth = data[newIndex];
      setSelectedItem((prev) => ({
        ...prev,
        year: newMonth.year,
        month: newMonth.month,
        day: null,
      }));
    },
    [data]
  );

  const onGoBack = useCallback(() => {
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1);
    }
  }, [currentPage]);

  const onGoForward = useCallback(() => {
    if (currentPage < data.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    }
  }, [currentPage, data.length]);

  const handleDayClick = useCallback(
    (day: number) => {
      const date = new Date(day);
      const newItem = {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
      };

      // If clicking the same day that's already selected, toggle it off
      if (
        selectedItem.year === newItem.year &&
        selectedItem.month === newItem.month &&
        selectedItem.day === newItem.day
      ) {
        setSelectedItem((prev) => ({
          ...prev,
          day: null,
        }));
      } else {
        setSelectedItem(newItem);
      }
      onDateChange?.(
        selectedItem.day === newItem.day ? { ...newItem, day: null } : newItem
      );
    },
    [selectedItem, onDateChange]
  );

  useEffect(() => {
    onDateChange?.(selectedItem);
  }, [selectedItem, onDateChange]);

  return (
    <View background style={calendarStyles.container}>
      <CalendarHeader
        monthDatum={data[currentPage]}
        canGoBack={currentPage > 0}
        onGoBack={onGoBack}
        canGoForward={currentPage < data.length - 1}
        onGoForward={onGoForward}
      />
      <DaysOfWeek textColor={textColor} />
      <PagerView
        ref={pagerRef}
        style={{ height: 0.25 * height }}
        initialPage={currentPage}
        onPageSelected={onPageSelected}
      >
        {data.map((monthData, index) => (
          <View
            key={`${monthData.year}-${monthData.month}`}
            style={calendarStyles.page}
            collapsable={false}
          >
            {index >= currentPage - OFFSCREEN_PAGES &&
            index <= currentPage + OFFSCREEN_PAGES ? (
              <Month
                {...monthData}
                selectedDate={
                  selectedItem.day
                    ? new Date(
                        selectedItem.year,
                        selectedItem.month,
                        selectedItem.day
                      ).getTime()
                    : null
                }
                onDayClick={handleDayClick}
              />
            ) : (
              <View style={calendarStyles.page} />
            )}
          </View>
        ))}
      </PagerView>
    </View>
  );
}

// Constants and Utility Types
const OFFSCREEN_PAGES = 1;

type MonthData = {
  year: number;
  month: number;
};

export type CalendarItem = {
  year: number;
  month: number;
  day: number | null;
};

// Utility Functions
function findIndexThatContainsDate(data: MonthData[], date: number) {
  return data.findIndex((item) => doesCorrespondToMonth(item, date));
}

function doesCorrespondToMonth(item: MonthData, date: number) {
  const d = new Date(date);
  return item.year === d.getFullYear() && d.getMonth() === item.month;
}

function generateMonthsData(currentDate: number) {
  const date = new Date(currentDate);
  const currentYearMonth = 12 * date.getFullYear() + date.getMonth();
  return Array.from({ length: 49 }, (_, i) => {
    const yearMonth = currentYearMonth - (24 - i);
    const year = Math.floor(yearMonth / 12);
    const month = yearMonth % 12;
    return {
      year,
      month,
    };
  });
}
