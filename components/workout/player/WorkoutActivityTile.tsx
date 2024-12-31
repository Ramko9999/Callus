import {
  Difficulty,
  DifficultyType,
  ExerciseMeta,
  ExercisingActivity,
  RestingActivity,
} from "@/interface";
import { View, Text, Action } from "../../Themed";
import { StyleSheet, Image } from "react-native";
import { useState, useEffect } from "react";
import { getDurationDisplay } from "@/util/date";
import { useRouter } from "expo-router";
import { useWorkout } from "@/context/WorkoutContext";
import { DifficultyTile } from "./difficulty-tile";
import { NAME_TO_EXERCISE_META } from "@/api/exercise";
import { useTimer } from "@/components/hooks/use-timer";

const styles = StyleSheet.create({
  activityTile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "90%",
    gap: 20,
  },
  activityTileTitle: {
    fontSize: 36,
  },
  activityTileActions: {
    display: "flex",
    flexDirection: "row",
    marginTop: "10%",
    gap: 60,
  },
  activityTileAction: {
    backgroundColor: "green",
    padding: "10%",
  },
  exercisingActivityTileDemo: {
    width: "80%",
    height: "50%",
    borderRadius: 20,
  },
});

type ExercisingActivityTileProps = {
  activityData: ExercisingActivity;
  onFinish: () => void;
};

export function ExercisingActivityTile({
  activityData,
  onFinish,
}: ExercisingActivityTileProps) {
  const { exercise, set } = activityData;
  const meta = NAME_TO_EXERCISE_META.get(exercise.name) as ExerciseMeta;

  // todo: load the image quick
  return (
    <View style={styles.activityTile}>
      <Text _type="emphasized" style={styles.activityTileTitle}>
        {exercise.name}
      </Text>
      <DifficultyTile
        difficulty={set.difficulty as Difficulty}
        type={meta.difficultyType as DifficultyType}
      />
      <Image
        source={{ uri: meta.demoUrl || "" }}
        style={styles.exercisingActivityTileDemo}
      />
      <View style={styles.activityTileActions}>
        <Action
          _action={{ name: "Done", type: "neutral" }}
          onPress={onFinish}
        />
      </View>
    </View>
  );
}

type FinishWorkoutActivityTileProps = {
  onFinish: () => void;
};

export function FinishWorkoutActivityTile({
  onFinish,
}: FinishWorkoutActivityTileProps) {

  const onFinishWorkout = () => {
    onFinish();
  };

  return (
    <View style={styles.activityTile}>
      <Action
        _action={{ name: "Finish", type: "neutral", style: {} }}
        onPress={onFinishWorkout}
      />
    </View>
  );
}
