import { WorkoutPlayer } from "@/components/workout/player";
import { useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Button } from "react-native";

export default function () {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      title: "Workout",
      headerBackTitle: "Back",
      headerRight: () => (
        <Button title={"Edit"} onPress={() => router.push("/workout-editor")} />
      ),
    });
  }, [navigation]);

  return <WorkoutPlayer />;
}
