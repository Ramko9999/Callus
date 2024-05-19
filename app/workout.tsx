import { Text, View } from "@/components/Themed";
import { WorkoutPlayer } from "@/components/workout/player";
import { useEffect } from "react";
import { Stack, useNavigation } from "expo-router";

export default function Workout() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: "Workout", headerBackTitle: "Back" });
  }, [navigation]);

  return <WorkoutPlayer />;
}
