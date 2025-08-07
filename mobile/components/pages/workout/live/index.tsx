import { Player } from "@/components/pages/workout/live/player";
import { EditExercises } from "@/components/pages/workout/live/edit-exercises";
import { AddExercises } from "@/components/pages/workout/live/add-exercises";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { HeaderPage } from "@/components/util/header-page";
import { useNavigation } from "@react-navigation/native";
import {
  CloseButton,
  MoreButton,
  BackButton,
  PlusButton,
} from "@/components/pages/common";
import { useLiveWorkout } from "./context";
import { getTimePeriodDisplay } from "@/util/date";
import { useThemeColoring } from "@/components/Themed";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SharedValue,
  useDerivedValue,
} from "react-native-reanimated";
import { View, Text } from "@/components/Themed";
import React, { useState, useCallback } from "react";
import { useRef } from "react";
import { Popover, PopoverItem, PopoverRef } from "@/components/util/popover";
import { useRefresh } from "@/components/hooks/use-refresh";
import { Flag, FilePenLine, Dumbbell } from "lucide-react-native";
import Animated from "react-native-reanimated";
import { WorkoutQuery, WorkoutActions } from "@/api/model/workout";
import { WorkoutApi } from "@/api/workout";
import { LiveWorkoutSheets, useLiveWorkoutSheets } from "./sheets";
import { View as RNView, StyleSheet } from "react-native";
import { MaterialTopTabNavigationProp } from "@react-navigation/material-top-tabs";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export type LiveWorkoutTabParamList = {
  Player: undefined;
  Edit: undefined;
  AddExercises: undefined;
};

const Tab = createMaterialTopTabNavigator<LiveWorkoutTabParamList>();

function LiveElapsed() {
  const { workout } = useLiveWorkout();
  useRefresh({ period: 1000 });

  return (
    <Text light>
      {workout?.startedAt
        ? getTimePeriodDisplay(Date.now() - workout.startedAt)
        : ""}
    </Text>
  );
}

const actionStyles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 24,
    height: 24,
  },
});

type AnimatedLeftActionProps = {
  tabSwitchProgress: SharedValue<number>;
  onClosePress: () => void;
  onBackPress: () => void;
};

function AnimatedLeftAction({
  tabSwitchProgress,
  onClosePress,
  onBackPress,
}: AnimatedLeftActionProps) {
  const crossfadeProgress = useDerivedValue(() => {
    return Math.min(tabSwitchProgress.value, 1);
  });

  const closeStyle = useAnimatedStyle(() => ({
    opacity: 1 - crossfadeProgress.value,
    transform: [{ scale: 1 - crossfadeProgress.value * 0.2 }],
    display: crossfadeProgress.value == 1 ? "none" : "flex",
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: crossfadeProgress.value,
    transform: [{ scale: 0.8 + crossfadeProgress.value * 0.2 }],
    display: crossfadeProgress.value == 0 ? "none" : "flex",
  }));

  return (
    <View style={actionStyles.container}>
      <Animated.View style={[closeStyle, { position: "absolute" }]}>
        <CloseButton onClick={onClosePress} />
      </Animated.View>
      <Animated.View style={[backStyle, { position: "absolute" }]}>
        <BackButton onClick={onBackPress} />
      </Animated.View>
    </View>
  );
}

type AnimatedRightActionProps = {
  tabSwitchProgress: SharedValue<number>;
  popoverProgress: SharedValue<number>;
  onMorePress: () => void;
  onPlusPress: () => void;
  ref: React.RefObject<any>;
};

const AnimatedRightAction = React.forwardRef<any, AnimatedRightActionProps>(
  ({ tabSwitchProgress, popoverProgress, onMorePress, onPlusPress }, ref) => {
    const crossfadeProgress = useDerivedValue(() => {
      return Math.min(tabSwitchProgress.value, 1);
    });

    const moreStyle = useAnimatedStyle(() => ({
      opacity: 1 - crossfadeProgress.value,
      transform: [{ scale: 1 - crossfadeProgress.value * 0.2 }],
      display: crossfadeProgress.value == 1 ? "none" : "flex",
    }));

    const plusStyle = useAnimatedStyle(() => ({
      opacity: crossfadeProgress.value,
      transform: [{ scale: 0.8 + crossfadeProgress.value * 0.2 }],
      display: crossfadeProgress.value == 0 ? "none" : "flex",
    }));

    return (
      <View style={actionStyles.container}>
        <Animated.View style={[moreStyle, { position: "absolute" }]}>
          <MoreButton
            ref={ref}
            onClick={onMorePress}
            progress={popoverProgress}
          />
        </Animated.View>
        <Animated.View style={[plusStyle, { position: "absolute" }]}>
          <PlusButton onClick={onPlusPress} />
        </Animated.View>
      </View>
    );
  }
);

type AnimatedHeaderProps = {
  workoutName: string;
  tabSwitchProgress: SharedValue<number>;
};

function AnimatedHeader({
  workoutName,
  tabSwitchProgress,
}: AnimatedHeaderProps) {
  const crossfadeProgress = useDerivedValue(() => {
    return Math.max(tabSwitchProgress.value - 1, 0);
  });

  const workoutNameStyle = useAnimatedStyle(() => ({
    opacity: 1 - crossfadeProgress.value,
    transform: [{ scale: 1 - crossfadeProgress.value * 0.1 }],
  }));

  const addExercisesStyle = useAnimatedStyle(() => ({
    opacity: crossfadeProgress.value,
    transform: [{ scale: 0.9 + crossfadeProgress.value * 0.1 }],
  }));

  return (
    <>
      <Text header style={{ color: "transparent" }}>
        {"Add Exercises Placeholder"}
      </Text>
      <Animated.View style={[workoutNameStyle, { position: "absolute" }]}>
        <Text header>{workoutName}</Text>
      </Animated.View>
      <Animated.View style={[addExercisesStyle, { position: "absolute" }]}>
        <Text header>Add Exercises</Text>
      </Animated.View>
    </>
  );
}

type AnimatedSubtitleProps = {
  tabSwitchProgress: SharedValue<number>;
};

function AnimatedSubtitle({ tabSwitchProgress }: AnimatedSubtitleProps) {
  const crossfadeProgress = useDerivedValue(() => {
    return Math.max(tabSwitchProgress.value - 1, 0);
  });

  const liveElapsedStyle = useAnimatedStyle(() => ({
    opacity: 1 - crossfadeProgress.value,
    transform: [{ scale: 1 - crossfadeProgress.value * 0.1 }],
  }));

  return (
    <Animated.View style={liveElapsedStyle}>
      <LiveElapsed />
    </Animated.View>
  );
}

function LiveWorkoutContent() {
  const navigation = useNavigation();
  const { workout, saveWorkout } = useLiveWorkout();
  const moreButtonRef = useRef<RNView>(null);
  const moreButtonProgress = useSharedValue(0);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const popoverRef = useRef<PopoverRef>(null);
  const [tabNavigation, setTabNavigation] =
    useState<MaterialTopTabNavigationProp<any> | null>(null);

  const tabSwitchProgress = useSharedValue(0);

  const primaryTextColor = useThemeColoring("primaryText");
  const primaryActionColor = useThemeColoring("primaryAction");
  const { openNameAndTime, openFinishingConfirmation } = useLiveWorkoutSheets();

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation.goBack]);

  const handleBack = useCallback(() => {
    if (activeTabIndex == 1) {
      tabNavigation?.navigate("Player");
    } else {
      tabNavigation?.navigate("Edit");
    }
  }, [activeTabIndex, tabNavigation]);

  const handleMore = useCallback(() => {
    if (moreButtonRef.current) {
      moreButtonRef.current.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number
        ) => {
          popoverRef.current?.open(pageX + width + 5, pageY + 20);
        }
      );
    }
  }, []);

  const handlePlus = useCallback(() => {
    if (activeTabIndex === 1) {
      tabNavigation?.navigate("AddExercises");
    } else {
      // @ts-ignore
      navigation.navigate("createExerciseSheet");
    }
  }, [activeTabIndex, tabNavigation, navigation]);

  const handleTabChange = useCallback((index: number) => {
    setActiveTabIndex(index);
    tabSwitchProgress.value = withTiming(index, {
      duration: 200,
    });
  }, []);

  const handleFinishWorkout = useCallback(() => {
    const finishedWorkout = WorkoutActions(workout!).finish();
    WorkoutApi.saveWorkout(finishedWorkout).then(() => {
      navigation.goBack();
      // @ts-ignore
      navigation.navigate("completedWorkoutSheet", {
        id: workout!.id,
      });
      saveWorkout(undefined);
    });
  }, [workout, navigation, saveWorkout]);

  const handleEditWorkout = useCallback(() => {
    popoverRef.current?.close();
    openNameAndTime();
  }, [openNameAndTime]);

  const handleAttemptToFinishWorkout = useCallback(() => {
    popoverRef.current?.close();
    const hasUnfinishedSets = WorkoutQuery.hasUnfinishedSets(workout!);
    if (hasUnfinishedSets) {
      openFinishingConfirmation();
    } else {
      handleFinishWorkout();
    }
  }, [workout, openFinishingConfirmation, handleFinishWorkout]);

  const handleEditExercises = useCallback(() => {
    popoverRef.current?.close();
    tabNavigation?.navigate("Edit");
  }, [tabNavigation]);

  return (
    <View style={{ height: "100%" }}>
      <HeaderPage
        title={
          <AnimatedHeader
            workoutName={workout?.name ?? "Live Workout"}
            tabSwitchProgress={tabSwitchProgress}
          />
        }
        subtitle={<AnimatedSubtitle tabSwitchProgress={tabSwitchProgress} />}
        leftAction={
          <AnimatedLeftAction
            tabSwitchProgress={tabSwitchProgress}
            onClosePress={handleClose}
            onBackPress={handleBack}
          />
        }
        rightAction={
          <AnimatedRightAction
            ref={moreButtonRef}
            tabSwitchProgress={tabSwitchProgress}
            popoverProgress={moreButtonProgress}
            onMorePress={handleMore}
            onPlusPress={handlePlus}
          />
        }
      >
        <Tab.Navigator
          screenOptions={{
            swipeEnabled: true,
            tabBarStyle: { display: "none" },
          }}
        >
          <Tab.Screen
            name="Player"
            component={Player}
            options={{
              tabBarLabel: "Workout",
            }}
            listeners={({ navigation }) => ({
              focus: () => {
                handleTabChange(0);
                setTabNavigation(navigation);
              },
            })}
          />
          <Tab.Screen
            name="Edit"
            component={EditExercises}
            options={{
              tabBarLabel: "Edit",
            }}
            listeners={({ navigation }) => ({
              focus: () => {
                handleTabChange(1);
                setTabNavigation(navigation);
              },
            })}
          />
          <Tab.Screen
            name="AddExercises"
            component={AddExercises}
            options={{
              tabBarLabel: "Add",
            }}
            listeners={({ navigation }) => ({
              focus: () => {
                handleTabChange(2);
                setTabNavigation(navigation);
              },
            })}
          />
        </Tab.Navigator>
      </HeaderPage>

      <Popover ref={popoverRef} progress={moreButtonProgress}>
        <PopoverItem
          label="Edit Name and Time"
          icon={<FilePenLine size={20} color={primaryTextColor} />}
          onClick={handleEditWorkout}
        />
        <PopoverItem
          label="Edit Exercises"
          icon={<Dumbbell size={20} color={primaryTextColor} />}
          onClick={handleEditExercises}
        />
        <PopoverItem
          label={
            <Text style={{ color: primaryActionColor }}>Finish Workout</Text>
          }
          icon={<Flag size={20} color={primaryActionColor} />}
          onClick={handleAttemptToFinishWorkout}
        />
      </Popover>
    </View>
  );
}

export function LiveWorkout() {
  const navigation = useNavigation();
  const { workout, saveWorkout } = useLiveWorkout();

  const handleFinishWorkout = () => {
    const finishedWorkout = WorkoutActions(workout!).finish();
    WorkoutApi.saveWorkout(finishedWorkout).then(() => {
      navigation.goBack();
      // @ts-ignore
      navigation.navigate("completedWorkoutSheet", {
        id: workout!.id,
      });
      saveWorkout(undefined);
    });
  };

  return (
    <BottomSheetModalProvider>
      <LiveWorkoutSheets onFinishWorkout={handleFinishWorkout}>
        <LiveWorkoutContent />
      </LiveWorkoutSheets>
    </BottomSheetModalProvider>
  );
}
