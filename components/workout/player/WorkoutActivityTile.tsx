import {
  ExercisingActivity,
  RestingActivity
} from "@/interface";
import { View, Text } from "../../Themed";
import { StyleSheet, Button } from "react-native";
import { useState, useEffect } from "react";
import { getDurationDisplay } from "@/util";

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
    fontWeight: "bold",
    fontSize: 36,
  },
  activityTileSubtitle: {
    fontSize: 24,
  },
  activityTileActions: {
    display: "flex",
    flexDirection: "row",
    marginTop: "10%",
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
  const { exerciseName, reps, weight } = activityData;
  return (
    <View style={styles.activityTile}>
      <Text style={styles.activityTileTitle}>{exerciseName}</Text>
      <Text style={styles.activityTileSubtitle}>
        {weight} x {reps}
      </Text>
      <View style={styles.activityTileActions}>
        <Button title={"Done"} onPress={onFinish} />
      </View>
    </View>
  );
}

type RestingActivityTileProps = {
  activityData: RestingActivity;
  onFinish: () => void;
};

export function RestingActivityTile({
  activityData,
  onFinish,
}: RestingActivityTileProps) {
  const { duration } = activityData;
  const [restDuration, setRestDuration] = useState<number>(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setRestDuration((duration) => Math.max(0, duration - 1));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (restDuration === 0) {
      onFinish();
    }
  }, [restDuration]);

  return (
    <View style={styles.activityTile}>
      <Text style={styles.activityTileTitle}>Rest</Text>
      <Text style={styles.activityTileSubtitle}>
        {getDurationDisplay(restDuration)}
      </Text>
      <View style={styles.activityTileActions}>
        <Button title={"Skip"} onPress={onFinish}></Button>
        <Button
          title={"Add 15s"}
          onPress={() => setRestDuration((duration) => duration + 15)}
        />
      </View>
    </View>
  );
}
