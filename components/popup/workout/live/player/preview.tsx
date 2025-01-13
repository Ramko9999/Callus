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
import { Text, useThemeColoring, View } from "../../../../Themed";
import { getDurationDisplay, getTimePeriodDisplay } from "@/util/date";
import { StyleUtils } from "@/util/styles";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useEffect } from "react";
import { PREVIEW_HEIGHT } from "../../../../util/popup/util";

const previewStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    height: PREVIEW_HEIGHT,
    paddingLeft: "3%",
    alignItems: "center",
    borderTopWidth: 1,
  },
  content: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    flex: 1,
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

type PreviewProps = {
  workout: Workout;
  onClick: () => void;
};

export function Preview({ workout, onClick }: PreviewProps) {
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
    <TouchableOpacity style={previewStyles.container} onPress={onClick}>
      <Animated.View style={[previewStyles.overlay, animatedRestStyle]} />
      <View style={previewStyles.content}>
        <View style={previewStyles.activity}>
          <Text action>{workout.name}</Text>
          {getSubtitle()}
        </View>
        <View style={previewStyles.elapsed}>
          <Text action>
            {getTimePeriodDisplay(Date.now() - workout.startedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
