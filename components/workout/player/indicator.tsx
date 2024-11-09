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
import { getDurationDisplay, getTimePeriodDisplay } from "@/util";
import { useTimer } from "@/components/hooks/use-timer";
import { useEffect, useState } from "react";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { StyleUtils } from "@/util/styles";
import { HistoricalEditorPopup } from "../new-editor/historical";

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

function ExercisingActivityIndicator({ name }: ExercisingActivity) {
  return (
    <Text neutral light>
      {name}
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
          {...(activityData as RestingActivity)}
          onRestOver={() => {
            actions.completeRest((activityData as RestingActivity).setId);
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
  const { elapsedMs } = useStopwatch({ startTimeMs: metadata?.startedAt || 0 });

  if (!isInWorkout) {
    return null;
  }

  const { name } = metadata as WorkoutMetadata;
  const { workout } = editor;
  return (
    <>
      <View style={indicatorStyles.expansive}>
        <TouchableOpacity
          onPress={() => setIsPlayerOpen(true)}
          style={[
            indicatorStyles.container,
            {
              backgroundColor: useThemeColoring("primaryViewBackground"),
              borderColor: useThemeColoring("primaryViewBorder"),
            },
          ]}
        >
          <View style={indicatorStyles.activity}>
            <Text large>{name}</Text>
            <CurrentActivityIndicator {...(activity as WorkoutActivity)} />
          </View>
          <View style={indicatorStyles.elapsed}>
            <Text large>{getTimePeriodDisplay(elapsedMs)}</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      // replace with LivePlayer, if we can get that, we have made enormous progress and are seeing the light at the end of the tunnel
      <HistoricalEditorPopup
        show={isPlayerOpen}
        hide={() => setIsPlayerOpen(false)}
        workout={workout as Workout}
        onSaveWorkout={(w) => {}}
      />
    </>
  );
}
