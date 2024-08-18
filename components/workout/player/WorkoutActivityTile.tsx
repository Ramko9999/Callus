import {
  ExercisingActivity,
  RestingActivity
} from "@/interface";
import { View, Text, Action } from "../../Themed";
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
    fontSize: 36,
  },
  activityTileActions: {
    display: "flex",
    flexDirection: "row",
    marginTop: "10%",
    gap: 20
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
      <Text _type="emphasized" style={styles.activityTileTitle}>{exerciseName}</Text>
      <Text _type="large">
        {weight} x {reps}
      </Text>
      <View style={styles.activityTileActions}>
        <Action _action={{name:"Done", type: "neutral"}} onPress={onFinish}/>
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
      <Text _type="emphasized" style={styles.activityTileTitle}>Rest</Text>
      <Text _type="large">
        {getDurationDisplay(restDuration)}
      </Text>
      <View style={styles.activityTileActions}>
      <Action _action={{name:"Skip", type: "neutral"}} onPress={onFinish}/>
      <Action _action={{name:"Add 15s", type: "neutral"}} onPress={() => setRestDuration((duration) => duration + 15)}/>
      </View>
    </View>
  );
}
