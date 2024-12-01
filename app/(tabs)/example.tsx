import { useEffect, useRef, useState } from "react";
import { DynamicHeaderPage } from "@/components/util/dynamic-header-page";
import {
  addDays,
  getLongDateDisplay,
  generateEnclosingWeek,
  removeDays,
  truncTime,
  getNextMonth,
  getMonthFirstDay,
  getDurationDisplay,
} from "@/util/date";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { WorkoutApi } from "@/api/workout";
import { MonthCalendar, WeekCalendar, WorkoutCalendar } from "@/components/home/calendar";
import * as Haptics from "expo-haptics";
import { DragIndicator } from "@/components/theme/icons";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}


function Example() {
  const [date, setDate] = useState(Date.now());
  return (
    <DynamicHeaderPage title={getLongDateDisplay(date)}>
      <WorkoutCalendar
        currentDate={truncTime(date)}
        onSelectDate={(date) => {
          setDate(date);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
      />
    </DynamicHeaderPage>
  );
}

