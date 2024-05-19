import {
  Workout,
  WorkoutActivity,
  WorkoutActivityType,
  ExercisingActivity,
  ChangingExerciseActivity,
  RestingActivity,
} from "@/interface";
import { View, Text } from "../../Themed";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import {
  ExercisingActivityTile,
  RestingActivityTile,
  ChangingExerciseActivityTile,
} from "./WorkoutActivityTile";
import { useWorkoutActivity } from "@/context/WorkoutActivityContext";
import { getDurationDisplay } from "@/util";

const styles = StyleSheet.create({
  workoutPlayer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  workoutDuration: {
    textAlign:"center",
    fontSize: 36
  }
});

export function WorkoutPlayer() {
  const {
    isInWorkout,
    instantiateWorkout,
    currentActivity,
    hasNextActivity,
    forwardToNextActivity,
  } = useWorkoutActivity();

  const [workoutDuration, setWorkoutDuration] = useState<number>(0);

  useEffect(() => {
    if (isInWorkout) {
      const interval = setInterval(() => {
        setWorkoutDuration((duration) => duration + 1);
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [isInWorkout]);

  if (!isInWorkout) {
    return null;
  }

  const { type, activityData } = currentActivity as WorkoutActivity;

  const getWorkoutActivityTile = () => {
    switch (type) {
      case WorkoutActivityType.EXERCISING:
        return (
          <ExercisingActivityTile
            activityData={activityData as unknown as ExercisingActivity}
            onFinish={forwardToNextActivity}
          />
        );
      case WorkoutActivityType.RESTING:
        return (
          <RestingActivityTile
            activityData={activityData as unknown as RestingActivity}
            onFinish={forwardToNextActivity}
          />
        );
      case WorkoutActivityType.CHANGING_EXERCISE:
        return (
          <ChangingExerciseActivityTile
            activityData={activityData as unknown as ChangingExerciseActivity}
            onFinish={forwardToNextActivity}
          />
        );
      default:
        null;
    }
  };

  return (
    <View style={styles.workoutPlayer}>
      {getWorkoutActivityTile()}
      <Text style={styles.workoutDuration}>{getDurationDisplay(workoutDuration)}</Text>
    </View>
  );
}
