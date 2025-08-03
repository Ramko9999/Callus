import { getConnection, migrateTables } from "@/api/store/index";
import { WorkoutApi } from "@/api/workout";
import { useLiveWorkout } from "@/components/pages/workout/live/context";
import { useState, useEffect, useCallback, createContext } from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/components/Themed";
import { Store } from "@/api/store";
import { StyleUtils } from "@/util/styles";
import React from "react";
import { useSound } from "../sounds";
import { useExercisesStore } from "../store";
import { toExerciseMeta } from "@/api/model/custom-exercise";
import { EXERCISE_REPOSITORY } from "@/api/exercise";

// todo: preloader likely isn't even necessary anymore tbh, we can load all these things in the splash screen
type PreloaderContext = {
  hasOnboarded: boolean;
  reCheckOnboarding: () => void;
};

const context = createContext<PreloaderContext>({
  hasOnboarded: false,
  reCheckOnboarding: () => {},
});

async function preloadDB() {
  const db = await getConnection();
  Store.setup(db);
  await migrateTables(db);
}

const styles = StyleSheet.create({
  loading: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    height: "100%",
  },
});

type PreloaderState = {
  hasLoaded: boolean;
};

type Props = {
  children: React.ReactNode;
};

// todo: use a cool animation with our logo here
export function Preloader({ children }: Props) {
  const [state, setState] = useState<PreloaderState>({
    hasLoaded: false,
  });
  const { saveWorkout } = useLiveWorkout();
  const { initialize } = useSound();
  const { setExercises } = useExercisesStore();

  const hydrateInProgressWorkout = useCallback(async () => {
    const workout = await WorkoutApi.getInProgressWorkout();
    if (workout) {
      saveWorkout(workout);
    }
  }, []);

  const preload = async () => {
    await preloadDB();
    await hydrateInProgressWorkout();

    const customExercises = await Store.instance().getCustomExercises();
    const allExercises = [
      ...customExercises.map(toExerciseMeta),
      ...EXERCISE_REPOSITORY,
    ];
    setExercises(allExercises);
    setState({ hasLoaded: true });
  };

  useEffect(() => {
    preload();
  }, []);

  // todo: replace with our icon or whatever
  return (
    <>
      {state.hasLoaded ? (
        children
      ) : (
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      )}
    </>
  );
}
