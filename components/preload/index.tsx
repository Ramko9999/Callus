import { initializeAppDataDirectory } from "@/api/store/index";
import { WorkoutApi } from "@/api/workout";
import { useWorkout } from "@/context/WorkoutContext";
import { useState, useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/components/Themed";

const styles = StyleSheet.create({
  loadingView: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent:"center",
    alignItems: "center"
  },
});

type Props = {
  children: React.ReactNode;
};

// todo: use a cool animation with our logo here

export function Preloader({ children }: Props) {
  const [loaded, setLoaded] = useState(false);
  const { actions } = useWorkout();

  const hydrateInProgressWorkout = useCallback(async () => {
    const workout = await WorkoutApi.getInProgressWorkout();
    if (workout) {
      actions.resumeInProgressWorkout(workout);
    }
  }, []);

  useEffect(() => {
    initializeAppDataDirectory()
      .then(hydrateInProgressWorkout)
      .then(() => setLoaded(true));
  }, []);

  return loaded ? (
    children
  ) : (
    <View style={styles.loadingView}>
      <Text _type="neutral">Loading...</Text>
    </View>
  );
}
