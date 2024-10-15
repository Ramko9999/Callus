import {
  WorkoutActivity,
  WorkoutActivityType,
  ExercisingActivity,
  RestingActivity,
  WorkoutMetadata,
} from "@/interface";
import { View, Text } from "../../Themed";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import {
  ExercisingActivityTile,
  FinishWorkoutActivityTile,
  RestingActivityTile,
} from "./WorkoutActivityTile";
import { useWorkout } from "@/context/WorkoutContext";
import { getTimePeriodDisplay } from "@/util";

const styles = StyleSheet.create({
  workoutPlayer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  workoutDuration: {
    textAlign: "center",
    fontSize: 36,
  },
});

export function WorkoutPlayer() {
  const { isInWorkout, activity, metadata, actions } = useWorkout();

  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (isInWorkout) {
      const interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [isInWorkout]);

  if (!isInWorkout) {
    return null;
  }

  const { type, activityData } = activity as WorkoutActivity;

  const getWorkoutActivityTile = () => {
    switch (type) {
      case WorkoutActivityType.EXERCISING:
        const exercisingData = activityData as unknown as ExercisingActivity;
        return (
          <ExercisingActivityTile
            activityData={exercisingData}
            onFinish={() => actions.completeSet(exercisingData.setId)}
          />
        );
      case WorkoutActivityType.RESTING:
        const restingData = activityData as unknown as RestingActivity;
        return (
          <RestingActivityTile
            activityData={activityData as unknown as RestingActivity}
            onFinish={() => actions.completeRest(restingData.setId)}
            onUpdateRestDuration={(duration) => actions.updateRestDuration(restingData.setId, duration)}
          />
        );
      case WorkoutActivityType.FINISHED:
        return <FinishWorkoutActivityTile onFinish={actions.finishWorkout} />;
      default:
        null;
    }
  };

  return (
    <View style={styles.workoutPlayer}>
      {getWorkoutActivityTile()}
      <Text _type="neutral" style={styles.workoutDuration}>
        {getTimePeriodDisplay(now - (metadata as WorkoutMetadata).startedAt)}
      </Text>
    </View>
  );
}
