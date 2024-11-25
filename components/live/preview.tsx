import {
  getCurrentWorkoutActivity,
  getRemainingRest,
} from "@/context/WorkoutContext";
import { Exercise, Workout, WorkoutActivityType, Set } from "@/interface";
import { Text, View } from "../Themed";
import { getDurationDisplay, getTimePeriodDisplay } from "@/util/date";
import { StyleUtils } from "@/util/styles";
import { StyleSheet, TouchableOpacity } from "react-native";
import { PREVIEW_HEIGHT } from "./constants";

const livePreviewStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    height: PREVIEW_HEIGHT,
    paddingLeft: "3%",
    alignItems: "center",
    borderTopWidth: 1,
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

  return (
    <TouchableOpacity onPress={onClick}>
      <View background style={livePreviewStyles.container}>
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
