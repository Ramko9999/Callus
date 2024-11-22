import {
  Difficulty,
  DifficultyType,
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
  const { name, difficulty, difficultyType } = activityData;
  const uri = NAME_TO_EXERCISE_META.get(name)?.demoUrl || "";

  // todo: load the image quick
  return (
    <View style={styles.activityTile}>
      <Text _type="emphasized" style={styles.activityTileTitle}>
        {name}
      </Text>
      <DifficultyTile
        difficulty={difficulty as Difficulty}
        type={difficultyType as DifficultyType}
      />
      <Image source={{ uri }} style={styles.exercisingActivityTileDemo} />
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
  const { duration, startedAt } = activityData;
  const [restDuration, setRestDuration] = useState<number>(
    duration + Math.ceil((startedAt - Date.now()) / 1000.0)
  );
  const { soundPlayer } = useWorkout();

  useEffect(() => {
    if (restDuration >= 0) {
      const interval = setInterval(() => {
        setRestDuration(
          duration + Math.ceil((startedAt - Date.now()) / 1000.0)
        );
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [duration]);

  useEffect(() => {
    if (restDuration < 0) {
      onFinish();
    }
    if (restDuration == 0) {
      soundPlayer.playNextSetBegin().then(onFinish);
    } else {
      if (restDuration <= 6 && restDuration % 2 === 0) {
        soundPlayer.playRestCompleting();
      }
    }
  }, [restDuration]);

  return (
    <View style={styles.activityTile}>
      <Text _type="emphasized" style={styles.activityTileTitle}>
        Rest
      </Text>
      <Text _type="large">{getDurationDisplay(restDuration)}</Text>
      <View style={styles.activityTileActions}>
        <Action
          _action={{ name: "Subtract 15s", type: "neutral" }}
          onPress={() => onUpdateRestDuration(duration - 15)}
        />
        <Action
          _action={{ name: "Skip", type: "neutral" }}
          onPress={onFinish}
        />
        <Action
          _action={{ name: "Add 15s", type: "neutral" }}
          onPress={() => onUpdateRestDuration(duration + 15)}
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
