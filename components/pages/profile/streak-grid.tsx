import { StyleUtils } from "@/util/styles";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useThemeColoring, View, Text } from "@/components/Themed";
import { useCallback, useState, useMemo } from "react";
import { WorkoutApi } from "@/api/workout";
import { WorkedOutDay } from "@/interface";
import { addDays, removeDays, truncTime } from "@/util/date";
import { batch } from "@/util/misc";
import { useFocusEffect } from "@react-navigation/native";
import { tintColor } from "@/util/color";

const STREAK_COLUMN_GROUP_SIZE = 7;
const STREAK_GROUP_SIZE = 3;
const LOOK_BACK_DAYS = STREAK_COLUMN_GROUP_SIZE * STREAK_GROUP_SIZE * 7;
const MAX_DURATION = 7200000; // 2 hours in milliseconds

function formatCompactDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getStreaksFromWorkedOutDays(
  start: number,
  end: number,
  workedOutDays: WorkedOutDay[]
): WorkedOutDay[] {
  const streaks = [];
  const dayMap = new Map(workedOutDays.map((day) => [day.day, day]));

  for (let i = start; i < end; i = addDays(i, 1)) {
    if (dayMap.has(i)) {
      streaks.push(dayMap.get(i)!);
    } else {
      streaks.push({ day: i, totalDurationWorkedOut: 0 });
    }
  }
  return streaks;
}

function getStreakColorFromDuration(
  duration: number,
  accentColor: string,
  inactiveColor: string
): string {
  if (duration === 0) return inactiveColor;

  // Normalize intensity to a value between 0 and 1 based on totalDurationWorkedOut
  const normalizedIntensity = Math.min(duration / MAX_DURATION, 1);
  return tintColor(accentColor, 1 - normalizedIntensity);
}

type StreakTileProps = {
  duration: number;
  index: number;
};

const streakTileStyles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 2,
    marginBottom: 1,
    marginRight: 1,
  },
});

function StreakTile({ duration, index }: StreakTileProps) {
  const accentColor = useThemeColoring("primaryAction");
  const inactiveColor = useThemeColoring("inactiveTileColor");

  const backgroundColor = useMemo(
    () => getStreakColorFromDuration(duration, accentColor, inactiveColor),
    [duration, accentColor, inactiveColor]
  );

  return (
    <View key={index} style={[streakTileStyles.tile, { backgroundColor }]} />
  );
}

// Define props type for StreakColumn
type StreakColumnProps = {
  streakData: number[];
  columnIndex: number;
};

// Render a column of streak tiles
const streakColumnStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleUtils.flexColumn(3),
  },
});

function StreakColumn({ streakData, columnIndex }: StreakColumnProps) {
  return (
    <View key={columnIndex} style={streakColumnStyles.container}>
      {streakData.map((duration, tileIndex) => (
        <StreakTile key={tileIndex} duration={duration} index={tileIndex} />
      ))}
    </View>
  );
}

// Define props type for StreakGroup
type StreakGroupProps = {
  group: number[];
  date: string;
  groupIndex: number;
};

// Render a group of streak columns with label
const streakGroupStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleUtils.flexColumn(5),
    marginRight: "0.5%",
    marginBottom: "0.5%",
  },
  columnsContainer: {
    flex: 1,
    ...StyleUtils.flexRow(3),
  },
});

export function StreakGroup({ group, date, groupIndex }: StreakGroupProps) {
  const columns = batch(group, STREAK_COLUMN_GROUP_SIZE);

  return (
    <View key={groupIndex} style={streakGroupStyles.container}>
      <Text small light>
        {date}
      </Text>
      <View style={streakGroupStyles.columnsContainer}>
        {columns.map((column, columnIndex) => (
          <StreakColumn
            key={columnIndex}
            streakData={column}
            columnIndex={columnIndex}
          />
        ))}
      </View>
    </View>
  );
}

const workoutStreakGridStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(15),
    marginBottom: "2%",
  },
  header: {
    ...StyleUtils.flexColumn(2),
    justifyContent: "space-between",
  },
  subHeader: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    marginTop: "1%",
  },
  streakContainer: {
    ...StyleUtils.flexRow(),
    flex: 1,
    justifyContent: "flex-start",
  },
});

export function StreakGrid() {
  const [streak, setStreak] = useState<WorkedOutDay[]>(
    Array.from({ length: LOOK_BACK_DAYS }, (_, i) => ({
      day: 0,
      totalDurationWorkedOut: 0,
    }))
  );

  const { height } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      const gridEnd = addDays(truncTime(Date.now()), 1);
      const gridStart = removeDays(gridEnd, LOOK_BACK_DAYS);

      WorkoutApi.getWorkedOutDays(gridEnd, gridStart).then((workedOutDays) => {
        const streaks = getStreaksFromWorkedOutDays(
          gridStart,
          gridEnd,
          workedOutDays
        );
        setStreak(streaks);
      });
    }, [])
  );

  const groupSize = STREAK_COLUMN_GROUP_SIZE * STREAK_GROUP_SIZE;
  const streakGroups = batch(streak, groupSize);

  return (
    <View
      style={[workoutStreakGridStyles.container, { height: height * 0.21 }]}
    >
      <View style={workoutStreakGridStyles.header}>
        <Text header emphasized>
          Activity
        </Text>
      </View>

      <View style={workoutStreakGridStyles.streakContainer}>
        {streakGroups.map((group, index) => (
          <StreakGroup
            key={index}
            group={group.map(
              ({ totalDurationWorkedOut }) => totalDurationWorkedOut
            )}
            date={formatCompactDate(group[0].day)}
            groupIndex={index}
          />
        ))}
      </View>
    </View>
  );
}
