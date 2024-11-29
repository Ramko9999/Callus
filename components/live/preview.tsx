import {
  getCurrentWorkoutActivity,
  getRemainingRest,
} from "@/context/WorkoutContext";
import {
  Exercise,
  Workout,
  WorkoutActivityType,
  Set,
  RestingActivity,
} from "@/interface";
import { Text, useThemeColoring, View } from "../Themed";
import { getDurationDisplay, getTimePeriodDisplay } from "@/util/date";
import { StyleUtils } from "@/util/styles";
import { StyleSheet, TouchableOpacity } from "react-native";
import { PREVIEW_HEIGHT } from "./constants";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useEffect } from "react";

const livePreviewStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    height: PREVIEW_HEIGHT,
    paddingLeft: "3%",
    alignItems: "center",
    borderTopWidth: 1,
  },
  overlay: {
    position: "absolute",
    height: PREVIEW_HEIGHT,
  },
  activity: {
    ...StyleUtils.flexColumn(),
    alignItems: "flex-start",
  },
  elapsed: {
    marginLeft: "auto",
    paddingHorizontal: "3%",
  },
});

type LivePreviewProps = {
  workout: Workout;
  onClick: () => void;
};

export function LivePreview({ workout, onClick }: LivePreviewProps) {
  const activity = getCurrentWorkoutActivity(workout);
  const restProgress = useSharedValue(0);

  useEffect(() => {
    if (activity.type === WorkoutActivityType.RESTING) {
      const { set } = activity.activityData as RestingActivity;
      restProgress.value =
        Math.max(
          (set.restStartedAt as number) + set.restDuration * 1000 - Date.now(),
          0
        ) /
        (set.restDuration * 1000);
    } else {
      restProgress.value = 0;
    }
  }, [activity]);

  const getSubtitle = () => {
    if (activity.type === WorkoutActivityType.EXERCISING) {
      const { exercise } = activity.activityData;
      return (
        <Text neutral light>
          {(exercise as Exercise).name}
        </Text>
      );
    } else if (activity.type === WorkoutActivityType.RESTING) {
      const { set } = activity.activityData;

      return (
        <Text neutral light>{`Resting: ${getDurationDisplay(
          getRemainingRest(set as Set)
        )}`}</Text>
      );
    }
    return null;
  };

  const restIndicationColor = useThemeColoring("highlightedAnimationColor");
  const defaultBackground = useThemeColoring("primaryViewBackground");

  const animatedRestStyle = useAnimatedStyle(() => ({
    backgroundColor:
      restProgress.value > 0 ? restIndicationColor : defaultBackground,
    width: `${restProgress.value * 100}%`,
  }));

  return (
    <TouchableOpacity onPress={onClick}>
      <Animated.View style={[livePreviewStyles.overlay, animatedRestStyle]} />
      <View style={livePreviewStyles.container}>
        <View style={livePreviewStyles.activity}>
          <Text large>{workout.name}</Text>
          {getSubtitle()}
        </View>
        <View style={livePreviewStyles.elapsed}>
          <Text large>
            {getTimePeriodDisplay(Date.now() - workout.startedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
