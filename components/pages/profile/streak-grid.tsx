import { StyleUtils } from "@/util/styles";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useThemeColoring, View, Text } from "@/components/Themed";
import { useCallback, useState, useMemo, useEffect } from "react";
import { WorkoutApi } from "@/api/workout";
import { WorkedOutDay } from "@/interface";
import { addDays, removeDays, truncTime } from "@/util/date";
import { batch } from "@/util/misc";
import { useFocusEffect } from "@react-navigation/native";
import { tintColor } from "@/util/color";
import Animated, {
  withSpring,
  withDelay,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

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
  isLoading: boolean;
};

const streakTileStyles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 1,
    marginRight: 1,
    ...StyleUtils.flexRowCenterAll(),
  },
  tile: {
    aspectRatio: 1,
  },
});

function StreakTile({ duration, index, isLoading }: StreakTileProps) {
  const accentColor = useThemeColoring("primaryAction");
  const inactiveColor = useThemeColoring("inactiveTileColor");
  const animationProgress = useSharedValue(0);

  const backgroundColor = useMemo(
    () => getStreakColorFromDuration(duration, accentColor, inactiveColor),
    [duration, accentColor, inactiveColor]
  );

  useEffect(() => {
    if (!isLoading) {
      animationProgress.value = withDelay(
        index * 10,
        withSpring(1, { duration: 1000 })
      );
    }
  }, [isLoading]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animationProgress.value * 100}%`,
    };
  });

  return (
    <View
      key={index}
      style={[streakTileStyles.container, { backgroundColor: inactiveColor }]}
    >
      <Animated.View
        style={[streakTileStyles.tile, { backgroundColor }, animatedStyle]}
      />
    </View>
  );
}

type StreakColumnProps = {
  streakData: number[];
  columnIndex: number;
  isLoading: boolean;
};

const streakColumnStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleUtils.flexColumn(3),
  },
});

function StreakColumn({
  streakData,
  columnIndex,
  isLoading,
}: StreakColumnProps) {
  return (
    <View key={columnIndex} style={streakColumnStyles.container}>
      {streakData.map((duration, tileIndex) => (
        <StreakTile
          key={tileIndex}
          duration={duration}
          index={columnIndex * streakData.length}
          isLoading={isLoading}
        />
      ))}
    </View>
  );
}

type StreakGroupProps = {
  group: number[];
  date: string;
  groupIndex: number;
  isLoading: boolean;
};

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

export function StreakGroup({
  group,
  date,
  groupIndex,
  isLoading,
}: StreakGroupProps) {
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
            columnIndex={groupIndex * columns.length + columnIndex}
            isLoading={isLoading}
          />
        ))}
      </View>
    </View>
  );
}

const workoutStreakGridStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(15),
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
      day: addDays(truncTime(Date.now()), i + 1 - LOOK_BACK_DAYS),
      totalDurationWorkedOut: 0,
    }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const { height } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const gridEnd = addDays(truncTime(Date.now()), 1);
      const gridStart = removeDays(gridEnd, LOOK_BACK_DAYS);

      WorkoutApi.getWorkedOutDays(gridEnd, gridStart).then((workedOutDays) => {
        const streaks = getStreaksFromWorkedOutDays(
          gridStart,
          gridEnd,
          workedOutDays
        );
        setIsLoading(false);
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
            isLoading={isLoading}
          />
        ))}
      </View>
    </View>
  );
}
