import { useWorkout } from "@/context/WorkoutContext";
import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import {
  ExercisingActivity,
  RestingActivity,
  Workout,
  WorkoutActivity,
  WorkoutActivityType,
  WorkoutMetadata,
} from "@/interface";
import { useStopwatch } from "@/components/hooks/use-stopwatch";
import { getDurationDisplay, getTimePeriodDisplay } from "@/util/date";
import { useTimer } from "@/components/hooks/use-timer";
import { useEffect, useState } from "react";
import { StyleUtils } from "@/util/styles";
import { LivePlayerPopup } from "./popup";

const indicatorStyles = StyleSheet.create({
  expansive: {
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    width: "100%",
  },
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    paddingVertical: "4%",
    paddingHorizontal: "3%",
    borderWidth: 1,
    borderRadius: 5,
    width: "90%",
  },
  activity: {
    ...StyleUtils.flexColumn(),
    alignItems: "flex-start",
  },
  elapsed: {
    marginLeft: "auto",
    paddingHorizontal: "3%",
  },
});

type RestingActivityIndicatorProps = {
  onRestOver: () => void;
  duration: number; //seconds
  startedAt: number;
};

function RestingActivityIndicator({
  duration,
  startedAt,
  onRestOver,
}: RestingActivityIndicatorProps) {
  const { remainingMs, isOver } = useTimer({
    startTimeMs: startedAt,
    durationMs: duration * 1000,
  });

  useEffect(() => {
    if (isOver) {
      onRestOver();
    }
  }, [isOver, onRestOver]);

  return (
    <Text neutral light>{`Resting: ${getDurationDisplay(
      Math.floor(remainingMs / 1000)
    )}`}</Text>
  );
}

function ExercisingActivityIndicator({ exercise }: ExercisingActivity) {
  return (
    <Text neutral light>
      {exercise.name}
    </Text>
  );
}

function CurrentActivityIndicator({ type, activityData }: WorkoutActivity) {
  const { actions } = useWorkout();

  switch (type) {
    case WorkoutActivityType.EXERCISING:
      return (
        <ExercisingActivityIndicator
          {...(activityData as ExercisingActivity)}
        />
      );
    case WorkoutActivityType.RESTING:
      return (
        <RestingActivityIndicator
          duration={(activityData as RestingActivity).set.restDuration}
          startedAt={(activityData as RestingActivity).set.startedAt as number}
          onRestOver={() => {
            actions.completeRest((activityData as RestingActivity).set.id);
          }}
        />
      );
    case WorkoutActivityType.FINISHED:
      return null;
  }
}

export function WorkoutIndicator() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const { isInWorkout, activity, metadata, editor } = useWorkout();
  const backgroundColor = useThemeColoring("primaryViewBackground");
  const borderColor = useThemeColoring("primaryViewBorder");
  const { elapsedMs } = useStopwatch({ startTimeMs: metadata?.startedAt || 0 });

  return isInWorkout ? (
    <>
      <View style={indicatorStyles.expansive}>
        <TouchableOpacity
          onPress={() => setIsPlayerOpen(true)}
          style={[
            indicatorStyles.container,
            {
              backgroundColor,
              borderColor,
            },
          ]}
        >
          <View style={indicatorStyles.activity}>
            <Text large>{(metadata as WorkoutMetadata).name}</Text>
            <CurrentActivityIndicator {...(activity as WorkoutActivity)} />
          </View>
          <View style={indicatorStyles.elapsed}>
            <Text large>{getTimePeriodDisplay(elapsedMs)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <LivePlayerPopup
        show={isPlayerOpen}
        hide={() => setIsPlayerOpen(false)}
      />
    </>
  ) : null;
}
