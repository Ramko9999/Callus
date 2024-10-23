import { useWorkout } from "@/context/WorkoutContext";
import { StyleSheet } from "react-native";
import { View, Text } from "@/components/Themed";
import {
  ExercisingActivity,
  RestingActivity,
  WorkoutActivity,
  WorkoutActivityType,
  WorkoutMetadata,
} from "@/interface";
import { useStopwatch } from "@/components/hooks/use-stopwatch";
import { getDurationDisplay, getTimePeriodDisplay } from "@/util";
import { useTimer } from "@/components/hooks/use-timer";
import { useEffect } from "react";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useRouter } from "expo-router";

const styles = StyleSheet.create({
  indicator: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "auto",
    elevation: 20,
    shadowRadius: 30,
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowColor: "black",
    paddingVertical: "2%"
  },
});

function RestingActivityIndication({
  setId,
  duration,
  startedAt,
}: RestingActivity) {
  const { actions } = useWorkout();
  const { remainingMs, isOver } = useTimer({
    startTimeMs: startedAt,
    durationMs: duration * 1000,
  });

  useEffect(() => {
    if (isOver) {
      actions.completeRest(setId);
    }
  }, [isOver]);

  return (
    <View>
      <Text _type="small">{`Resting: ${getDurationDisplay(Math.floor(remainingMs / 1000))}`}</Text>
    </View>
  );
}

function ExercisingActivityIndication({ name }: ExercisingActivity) {
  return (
    <View>
      <Text _type="small">{name}</Text>
    </View>
  );
}

function ActivityIndication({ type, activityData }: WorkoutActivity) {
  switch (type) {
    case WorkoutActivityType.EXERCISING:
      return (
        <ExercisingActivityIndication
          {...(activityData as ExercisingActivity)}
        />
      );
    case WorkoutActivityType.RESTING:
      return (
        <RestingActivityIndication {...(activityData as RestingActivity)} />
      );
    case WorkoutActivityType.FINISHED:
      return null;
  }
}

export function WorkoutIndicator() {
    // todo: add a better box shadow
  const router = useRouter();
  const { actions, isInWorkout, activity, metadata } = useWorkout();
  const { elapsedMs } = useStopwatch({ startTimeMs: metadata?.startedAt || 0 });

  if (!isInWorkout) {
    return null;
  }

  const { name } = metadata as WorkoutMetadata;
  return (
    <TouchableWithoutFeedback onPress={() => router.push("/workout-player")}>
      <View style={styles.indicator}>
        <Text _type="neutral">`{name}: {getTimePeriodDisplay(elapsedMs)}`</Text>
        <ActivityIndication {...(activity as WorkoutActivity)} />
      </View>
    </TouchableWithoutFeedback>
  );
}
