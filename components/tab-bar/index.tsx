import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useThemeColoring, Text, View } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTabBar } from "./context";
import { useEffect } from "react";
import {
  getCurrentWorkoutActivity,
  getRemainingRest,
  useWorkout,
} from "@/context/WorkoutContext";
import {
  ExercisingActivity,
  RestingActivity,
  WorkoutActivityType,
  Set,
  Workout,
  WorkoutActivity,
} from "@/interface";
import { getDurationDisplay, getTimePeriodDisplay } from "@/util/date";
import { Tabs } from "./tabs";
import { useNavigation } from "@react-navigation/native";
import { useRestOrchestrator } from "../hooks/use-rest-orchestrator";

const previewStyles = StyleSheet.create({
  container: {
    paddingLeft: "3%",
    borderBottomWidth: 1,
  },
  content: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    paddingVertical: "1%",
  },
  overlay: {
    position: "absolute",
    height: "100%",
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

function getPreviewDescription(activity: WorkoutActivity) {
  if (activity.type === WorkoutActivityType.EXERCISING) {
    const { exercise } = activity.activityData as ExercisingActivity;
    return exercise.name;
  } else if (activity.type === WorkoutActivityType.RESTING) {
    const { set } = activity.activityData as RestingActivity;
    return `Resting: ${getDurationDisplay(getRemainingRest(set as Set))}`;
  } else {
    return "Finished";
  }
}

type LiveWorkoutPreviewProps = {
  workout: Workout;
  onClick: () => void;
};

function LiveWorkoutPreview({ workout, onClick }: LiveWorkoutPreviewProps) {
  const activity = getCurrentWorkoutActivity(workout);
  const restProgress = useSharedValue(0);

  useRestOrchestrator();

  useEffect(() => {
    if (activity) {
      if (activity.type === WorkoutActivityType.RESTING) {
        const { set } = activity.activityData as RestingActivity;
        restProgress.value =
          Math.max(
            (set.restStartedAt as number) +
              set.restDuration * 1000 -
              Date.now(),
            0
          ) /
          (set.restDuration * 1000);
      } else {
        restProgress.value = 0;
      }
    }
  }, [activity]);

  const restIndicationColor = useThemeColoring("highlightedAnimationColor");
  const defaultBackground = useThemeColoring("primaryViewBackground");

  const animatedRestStyle = useAnimatedStyle(() => ({
    backgroundColor:
      restProgress.value > 0 ? restIndicationColor : defaultBackground,
    width: `${restProgress.value * 100}%`,
  }));

  return (
    <TouchableOpacity
      style={[
        previewStyles.container,
        { borderBottomColor: useThemeColoring("calendarDayBackground") },
      ]}
      onPress={onClick}
    >
      <Animated.View style={[previewStyles.overlay, animatedRestStyle]} />
      <View style={previewStyles.content}>
        <View style={previewStyles.activity}>
          <Text>{workout.name}</Text>
          <Text light>{getPreviewDescription(activity)}</Text>
        </View>
        <View style={previewStyles.elapsed}>
          <Text>{getTimePeriodDisplay(Date.now() - workout.startedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const tabBarStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  tabs: {
    ...StyleUtils.flexRow(),
  },
  tab: {
    ...StyleUtils.flexColumn(2),
    alignItems: "center",
  },
});

const TO_HIDE_TRANSLATION_MULTIPLIER = 0.14;

export function TabBar(props: BottomTabBarProps) {
  const navigation = useNavigation();
  const { isOpen } = useTabBar();
  const { isInWorkout, editor } = useWorkout();
  const { height } = useWindowDimensions();
  const translation = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      translation.value = withTiming(0);
    } else {
      translation.value = withTiming(height * TO_HIDE_TRANSLATION_MULTIPLIER);
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: translation.value }],
    }),
    []
  );

  return (
    <Animated.View
      style={[
        tabBarStyles.container,
        {
          backgroundColor: useThemeColoring("primaryViewBackground"),
        },
        animatedStyle,
      ]}
    >
      {isInWorkout ? (
        <LiveWorkoutPreview
          workout={editor.workout as Workout}
          onClick={() => {
            //@ts-ignore
            navigation.navigate("liveWorkout");
          }}
        />
      ) : null}
      <Tabs {...props} />
    </Animated.View>
  );
}
