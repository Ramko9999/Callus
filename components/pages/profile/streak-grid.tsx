import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { useThemeColoring, View, Text } from "@/components/Themed";
import { useCallback, useState } from "react";
import { WorkoutApi } from "@/api/workout";
import { addDays, getDateDisplay, removeDays, truncTime } from "@/util/date";
import { batch } from "@/util/misc";
import { useFocusEffect } from "@react-navigation/native";

const STREAK_COLUMN_GROUP_SIZE = 6;
const STREAK_GROUP_SIZE = 3;
const STREAK_TILE_DIMENSION = 17;
const LOOK_BACK_DAYS = STREAK_COLUMN_GROUP_SIZE * STREAK_GROUP_SIZE * 5;

const streakTileStyles = StyleSheet.create({
  container: {
    width: STREAK_TILE_DIMENSION,
    height: STREAK_TILE_DIMENSION,
    borderRadius: 4,
  },
});

type StreakTileProps = {
  intensity: number; // todo: see if we need to have an intensity in addition to if a workout was done
};

// todo: fix the coloring
function StreakTile({ intensity }: StreakTileProps) {
  const activeColor = useThemeColoring("primaryAction");
  const inactiveColor = useThemeColoring("inactiveTileColor");

  return (
    <View>
      <View
        style={[
          streakTileStyles.container,
          {
            backgroundColor: intensity > 0 ? activeColor : inactiveColor,
          },
        ]}
      />
    </View>
  );
}

const streakColumnStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    justifyContent: "flex-start",
  },
});

type StreakColumnProps = {
  streak: number[];
};

function StreakColumn({ streak }: StreakColumnProps) {
  return (
    <View style={streakColumnStyles.container}>
      {streak.map((intensity, index) => (
        <StreakTile intensity={intensity} key={index} />
      ))}
    </View>
  );
}

const streakGroupStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
  },
  columns: {
    ...StyleUtils.flexRow(10),
  },
});

type StreakGroupProps = {
  group: string;
  streak: number[];
};

function StreakGroup({ group, streak }: StreakGroupProps) {
  return (
    <View style={streakGroupStyles.container}>
      <Text neutral light>
        {group}
      </Text>
      <View style={streakGroupStyles.columns}>
        {batch(streak, STREAK_COLUMN_GROUP_SIZE).map((streak, index) => (
          <StreakColumn key={index} streak={streak} />
        ))}
      </View>
    </View>
  );
}

function getStreaksFromWorkedOutDays(
  start: number,
  end: number,
  workedOutDays: Set<number>
) {
  const streaks = [];

  for (let i = start; i < end; i = addDays(i, 1)) {
    streaks.push({ day: i, intensity: workedOutDays.has(i) ? 1 : 0 });
  }
  return streaks;
}

const workoutMonthStreakGridStyles = StyleSheet.create({
  grid: {
    ...StyleUtils.flexRow(10),
    borderRadius: 10,
    padding: "2%",
  },
  container: {
    ...StyleUtils.flexColumn(10),
  },
});

type WorkedOutDay = {
  intensity: number;
  day: number;
};

type WorkoutStreakGridState = {
  streak: WorkedOutDay[];
};

export function WorkoutStreakGrid() {
  const [{ streak }, setState] = useState<WorkoutStreakGridState>({
    streak: Array.from({ length: LOOK_BACK_DAYS }, () => ({
      intensity: 0,
      day: 0,
    })),
  });

  useFocusEffect(
    useCallback(() => {
      const gridEnd = addDays(truncTime(Date.now()), 1);
      const gridStart = removeDays(gridEnd, LOOK_BACK_DAYS);
      WorkoutApi.getWorkedOutDays(gridEnd, gridStart).then((workedOutDaysSet) =>
        setState({
          streak: getStreaksFromWorkedOutDays(
            gridStart,
            gridEnd,
            workedOutDaysSet
          ),
        })
      );
    }, [])
  );

  return (
    <View style={workoutMonthStreakGridStyles.container}>
      <Text action>{`Last ${LOOK_BACK_DAYS} days`}</Text>
      <View background style={workoutMonthStreakGridStyles.grid}>
        {batch(streak, STREAK_GROUP_SIZE * STREAK_COLUMN_GROUP_SIZE).map(
          (streakGroup, index) => {
            return (
              <StreakGroup
                key={index}
                group={getDateDisplay(streakGroup[0].day)}
                streak={streakGroup.map(({ intensity }) => intensity)}
              />
            );
          }
        )}
      </View>
    </View>
  );
}
