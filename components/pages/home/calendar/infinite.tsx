import { View } from "@/components/Themed";
import {
  addDays,
  generateEnclosingMonth,
  generateEnclosingWeek,
  getNextMonth,
  getPreviousMonth,
  removeDays,
  truncTime,
} from "@/util/date";
import { ArrayUtils } from "@/util/misc";
import { useRef, useState } from "react";
import { FlatList, useWindowDimensions, StyleSheet } from "react-native";
import { Month, Week } from "./core";
import * as Haptics from "expo-haptics";
import React from "react";

const PAGE_LOAD_SIZE = 3;
const INITIAL_NUMBER_TO_RENDER = PAGE_LOAD_SIZE * 2 + 1;
const PAGE_LOAD_THRESHOLD = 1;

type InfiniteCalendarProps<T> = {
  initialData: T[];
  initialDataIndex: number;
  loadMore: (data: T[], loadSize: number) => T[];
  loadPrevious: (data: T[], loadSize: number) => T[];
  onSelect: (data: T) => void;
  keyExtractor: (data: T) => string;
  render: (data: T, index: number) => React.ReactNode;
};

function InfiniteCalendar<T>({
  initialData,
  initialDataIndex,
  loadMore,
  loadPrevious,
  onSelect,
  keyExtractor,
  render,
}: InfiniteCalendarProps<T>) {
  const hasInitiallyScrolled = useRef(false);
  const hasSelectedInitialDate = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  const [data, setData] = useState<T[]>([...initialData]);

  const { width } = useWindowDimensions();

  const handleScrollToInitialValue = () => {
    if (!hasInitiallyScrolled.current) {
      flatListRef.current?.scrollToIndex({
        index: initialDataIndex,
        animated: false,
      });
      hasInitiallyScrolled.current = true;
    }
  };

  return (
    <FlatList
      ref={flatListRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      snapToInterval={width}
      decelerationRate="fast"
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 0.5 }}
      initialNumToRender={INITIAL_NUMBER_TO_RENDER}
      onViewableItemsChanged={({ viewableItems }) => {
        if (
          viewableItems &&
          viewableItems.length > 0 &&
          hasInitiallyScrolled.current
        ) {
          if (hasSelectedInitialDate.current) {
            onSelect(viewableItems[0].item);
          }
          hasSelectedInitialDate.current = true;
        }
      }}
      renderItem={({ item, index }) => (
        <View
          onLayout={() => {
            if (index === data.length - 1) {
              handleScrollToInitialValue();
            }
          }}
        >
          {render(item, index)}
        </View>
      )}
      onEndReachedThreshold={PAGE_LOAD_THRESHOLD}
      onEndReached={() => setData((data) => loadMore(data, PAGE_LOAD_SIZE))}
      onStartReachedThreshold={PAGE_LOAD_THRESHOLD}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
      onStartReached={() => {
        if (hasInitiallyScrolled.current) {
          setData((data) => loadPrevious(data, PAGE_LOAD_SIZE));
        }
      }}
      keyExtractor={(item, _) => keyExtractor(item)}
    />
  );
}

type CalendarProps = {
  currentDate: number;
  onSelectDate: (date: number) => void;
  isActive: (date: number) => boolean;
};

function generatePreviousWeeks(currentDate: number, n: number) {
  const weeks = [];
  const week = generateEnclosingWeek(currentDate);
  let weekDay = removeDays(week[0], 1);
  for (let i = 0; i < n; i++) {
    const lastWeek = generateEnclosingWeek(weekDay);
    weeks.push(lastWeek);
    weekDay = removeDays(lastWeek[0], 1);
  }
  return weeks.reverse();
}

function generateNextWeeks(currentDate: number, n: number) {
  const weeks = [];
  const week = generateEnclosingWeek(currentDate);
  let weekDay = addDays(ArrayUtils.last(week), 1);
  for (let i = 0; i < n; i++) {
    const nextWeek = generateEnclosingWeek(weekDay);
    weeks.push(nextWeek);
    weekDay = addDays(ArrayUtils.last(nextWeek), 1);
  }
  return weeks;
}

function generateInitialWeeks(currentDate: number, n: number) {
  const previousWeeks = generatePreviousWeeks(currentDate, n);
  const nextWeeks = generateNextWeeks(currentDate, n);
  return [...previousWeeks, generateEnclosingWeek(currentDate), ...nextWeeks];
}

export function WeeksCalendar({
  currentDate,
  onSelectDate,
  isActive,
}: CalendarProps) {
  return (
    <InfiniteCalendar
      initialData={generateInitialWeeks(currentDate, PAGE_LOAD_SIZE)}
      initialDataIndex={PAGE_LOAD_SIZE}
      loadMore={(currentWeeks, loadSize) => [
        ...currentWeeks,
        ...generateNextWeeks(ArrayUtils.last(currentWeeks)[0], loadSize),
      ]}
      loadPrevious={(currentWeeks, loadSize) => [
        ...generatePreviousWeeks(currentWeeks[0][0], loadSize),
        ...currentWeeks,
      ]}
      onSelect={(currentWeek) => onSelectDate(currentWeek[0])}
      keyExtractor={(week) => week[0].toString()}
      render={(week, _) => (
        <Week
          week={week}
          isMarked={isActive}
          isSelected={(date) => date === currentDate}
          isToday={(date) => date === truncTime(Date.now())}
          onClick={(date) => {
            onSelectDate(date);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }}
        />
      )}
    />
  );
}

function generatePreviousMonths(currentDate: number, n: number) {
  const months = [];
  let monthDay = currentDate;
  for (let i = 0; i < n; i++) {
    const lastMonth = generateEnclosingMonth(getPreviousMonth(monthDay));
    months.push(lastMonth);
    monthDay = lastMonth[0][0];
  }
  return months.reverse();
}

function generateNextMonths(currentDate: number, n: number) {
  const months = [];
  let monthDay = currentDate;
  for (let i = 0; i < n; i++) {
    const nextMonth = generateEnclosingMonth(getNextMonth(monthDay));
    months.push(nextMonth);
    monthDay = nextMonth[0][0];
  }
  return months;
}

function generateInitialMonths(currentDate: number, n: number) {
  const previousMonths = generatePreviousMonths(currentDate, n);
  const nextMonths = generateNextMonths(currentDate, n);
  return [
    ...previousMonths,
    generateEnclosingMonth(currentDate),
    ...nextMonths,
  ];
}

export function MonthsCalendar({
  currentDate,
  onSelectDate,
  isActive,
}: CalendarProps) {
  return (
    <InfiniteCalendar
      initialData={generateInitialMonths(currentDate, PAGE_LOAD_SIZE)}
      initialDataIndex={PAGE_LOAD_SIZE}
      loadMore={(currentMonths, loadSize) => [
        ...currentMonths,
        ...generateNextMonths(ArrayUtils.last(currentMonths)[0][0], loadSize),
      ]}
      loadPrevious={(currentMonths, loadSize) => [
        ...generatePreviousMonths(currentMonths[0][0][0], loadSize),
        ...currentMonths,
      ]}
      onSelect={(currentMonth) => onSelectDate(currentMonth[0][0])}
      keyExtractor={(month) => month[0][0].toString()}
      render={(month, _) => (
        <Month
          monthDays={month}
          isSelected={(date) => date === currentDate}
          isMarked={isActive}
          isToday={(date) => date === truncTime(Date.now())}
          onClick={(date) => {
            onSelectDate(date);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }}
        />
      )}
    />
  );
}
