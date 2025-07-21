import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useThemeColoring } from "@/components/Themed";
import { Workout, SetStatus, Set } from "@/interface";
import { useLiveWorkout } from "@/components/pages/workout/live/context";
import { Period } from "@/util/date";
import { tintColor } from "@/util/color";
import { StyleUtils } from "@/util/styles";
import { useNavigation } from "@react-navigation/native";
import { WorkoutQuery } from "@/api/model/workout";
import { useRefresh } from "../hooks/use-refresh";
import * as Haptics from "expo-haptics";
import { ExerciseStoreSelectors, useExercisesStore } from "../store";

const liveWorkoutPreviewStyles = StyleSheet.create({
  container: {
    position: "absolute",
    left: "3%",
    right: "3%",
    bottom: 10,
    borderRadius: 12,
    padding: "3%",
    borderWidth: 1,
    zIndex: 1000,
  },
  content: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    ...StyleUtils.flexColumn(4),
    flex: 1,
  },
  timeText: {
    fontSize: 24,
    fontWeight: "700",
  },
  workoutInfo: {
    fontSize: 14,
    opacity: 0.7,
  },
});

const previewDescriptionStyles = StyleSheet.create({
  text: {
    fontSize: 14,
    opacity: 0.7,
  },
});

type PreviewDescriptionProps = {
  workout: Workout;
  textColor: string;
};

function PreviewDescription({ workout, textColor }: PreviewDescriptionProps) {
  const currentSetAndExercise = WorkoutQuery.getCurrentSetAndExercise(workout);

  const exerciseName = useExercisesStore((state) =>
    currentSetAndExercise?.exercise.metaId
      ? ExerciseStoreSelectors.getExercise(
          currentSetAndExercise.exercise.metaId,
          state
        ).name
      : ""
  );

  if (!currentSetAndExercise) {
    return (
      <Text style={[previewDescriptionStyles.text, { color: textColor }]}>
        {workout.name} {">"} Finished
      </Text>
    );
  }

  const setIndex = currentSetAndExercise.exercise.sets.findIndex(
    (s: Set) => s.id === currentSetAndExercise.set.id
  );

  if (currentSetAndExercise.set.status === SetStatus.RESTING) {
    return (
      <Text style={[previewDescriptionStyles.text, { color: textColor }]}>
        {workout.name} {">"} {exerciseName} {">"} Set {setIndex + 1} (Resting)
      </Text>
    );
  } else {
    return (
      <Text style={[previewDescriptionStyles.text, { color: textColor }]}>
        {workout.name} {">"} {exerciseName} {">"} Set {setIndex + 1}
      </Text>
    );
  }
}

function getElapsedTimeDisplay(elapsedMillis: number): string {
  const hours = Math.floor(elapsedMillis / Period.HOUR);
  const minutes = Math.floor((elapsedMillis % Period.HOUR) / Period.MINUTE);
  const seconds = Math.floor((elapsedMillis % Period.MINUTE) / Period.SECOND);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

export function LiveWorkoutPreview() {
  const navigation = useNavigation();
  const { isInWorkout, workout } = useLiveWorkout();
  const backgroundColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const borderColor = tintColor(useThemeColoring("appBackground"), 0.2);
  const primaryTextColor = useThemeColoring("primaryText");
  useRefresh({ period: 1000 });

  if (!isInWorkout) return null;

  const elapsedTime = workout?.startedAt ? Date.now() - workout.startedAt : 0;

  return (
    <TouchableOpacity
      style={[
        liveWorkoutPreviewStyles.container,
        { backgroundColor, borderColor },
      ]}
      activeOpacity={1}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // @ts-ignore
        navigation.navigate("liveWorkoutSheet");
      }}
    >
      <View style={liveWorkoutPreviewStyles.content}>
        <View style={liveWorkoutPreviewStyles.leftSection}>
          <Text style={liveWorkoutPreviewStyles.timeText}>
            {getElapsedTimeDisplay(elapsedTime)}
          </Text>
          <PreviewDescription
            workout={workout as Workout}
            textColor={primaryTextColor}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
