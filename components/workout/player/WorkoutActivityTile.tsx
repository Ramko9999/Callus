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
import { NAME_TO_EXERCISE_META } from "@/constants";
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

type RestingActivityTileProps = {
  activityData: RestingActivity;
  onFinish: () => void;
  onUpdateRestDuration: (updatedDuration: number) => void;
};

export function RestingActivityTile({
  activityData,
  onFinish,
  onUpdateRestDuration,
}: RestingActivityTileProps) {
  // todo: use stopwatch and use timer and create a hook called useRestTimer to sound the rings
  const { set } = activityData;
  const { restDuration, restStartedAt } = set;
  const { isOver, remainingMs } = useTimer({
    startTimeMs: restStartedAt as number,
    durationMs: restDuration * 1000,
  });

  const { soundPlayer } = useWorkout();

  console.log({isOver, remainingMs});

  useEffect(() => {
    if (isOver) {
      onFinish();
    } else if (remainingMs <= 1000) {
      soundPlayer.playNextSetBegin();
    } else {
      if (remainingMs <= 6000 && restDuration % 2 === 0) {
        soundPlayer.playRestCompleting();
      }
    }
  }, [isOver, remainingMs]);

  return (
    <View style={styles.activityTile}>
      <Text _type="emphasized" style={styles.activityTileTitle}>
        Rest
      </Text>
      <Text _type="large">{getDurationDisplay(Math.floor(remainingMs / 1000))}</Text>
      <View style={styles.activityTileActions}>
        <Action
          _action={{ name: "Subtract 15s", type: "neutral" }}
          onPress={() => onUpdateRestDuration(restDuration - 15)}
        />
        <Action
          _action={{ name: "Skip", type: "neutral" }}
          onPress={onFinish}
        />
        <Action
          _action={{ name: "Add 15s", type: "neutral" }}
          onPress={() => onUpdateRestDuration(restDuration + 15)}
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
  const router = useRouter();

  const onFinishWorkout = () => {
    onFinish();
    router.back();
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
