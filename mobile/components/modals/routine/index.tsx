import React, { useCallback, useEffect, useRef, useState } from "react";
import { View as RNView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { HeaderPage } from "@/components/util/header-page";
import {
  CloseButton,
  MoreButton,
  BackButton,
  PlusButton,
} from "@/components/pages/common";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { Popover, PopoverItem, PopoverRef } from "@/components/util/popover";
import {
  Flag,
  FilePenLine,
  Dumbbell,
  Shuffle,
  Trash2,
} from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { WorkoutApi } from "@/api/workout";
import { WorkoutCreation } from "@/api/model/workout";
import { useUserDetails } from "@/components/user-details";
import { useToast } from "react-native-toast-notifications";
import { useLiveWorkout } from "@/components/pages/workout/live/context";
import { RoutineProvider, useRoutine } from "./context";
import { RoutineSheets, useRoutineSheets } from "./sheets";
import { EditRoutine } from "./edit";
import { AddExercises } from "./add-exercises";

export type RoutineTabParamList = {
  Edit: undefined;
  AddExercises: undefined;
};

const Tab = createMaterialTopTabNavigator<RoutineTabParamList>();

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
  const closeStyle = useAnimatedStyle(() => ({
    opacity: 1 - tabSwitchProgress.value,
    transform: [{ scale: 1 - tabSwitchProgress.value * 0.2 }],
    display: tabSwitchProgress.value === 1 ? "none" : "flex",
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: tabSwitchProgress.value,
    transform: [{ scale: 0.8 + tabSwitchProgress.value * 0.2 }],
    display: tabSwitchProgress.value === 0 ? "none" : "flex",
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
};

const AnimatedRightAction = React.forwardRef<any, AnimatedRightActionProps>(
  ({ tabSwitchProgress, popoverProgress, onMorePress, onPlusPress }, ref) => {
    const moreStyle = useAnimatedStyle(() => ({
      opacity: 1 - tabSwitchProgress.value,
      transform: [{ scale: 1 - tabSwitchProgress.value * 0.2 }],
      display: tabSwitchProgress.value === 1 ? "none" : "flex",
    }));

    const plusStyle = useAnimatedStyle(() => ({
      opacity: tabSwitchProgress.value,
      transform: [{ scale: 0.8 + tabSwitchProgress.value * 0.2 }],
      display: tabSwitchProgress.value === 0 ? "none" : "flex",
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
  routineName: string;
  tabSwitchProgress: SharedValue<number>;
  onTitlePress: () => void;
};

function AnimatedHeader({
  routineName,
  tabSwitchProgress,
  onTitlePress,
}: AnimatedHeaderProps) {
  const nameStyle = useAnimatedStyle(() => ({
    opacity: 1 - tabSwitchProgress.value,
    transform: [{ scale: 1 - tabSwitchProgress.value * 0.1 }],
  }));

  const addExercisesStyle = useAnimatedStyle(() => ({
    opacity: tabSwitchProgress.value,
    transform: [{ scale: 0.9 + tabSwitchProgress.value * 0.1 }],
  }));

  return (
    <>
      <Text header style={{ color: "transparent" }}>
        {"Add Exercises Placeholder"}
      </Text>
      <Animated.View style={[nameStyle, { position: "absolute" }]}>
        <Text header onPress={onTitlePress}>
          {routineName}
        </Text>
      </Animated.View>
      <Animated.View style={[addExercisesStyle, { position: "absolute" }]}>
        <Text header>Add Exercises</Text>
      </Animated.View>
    </>
  );
}

type AnimatedSubtitleProps = {
  exerciseCount: number;
  tabSwitchProgress: SharedValue<number>;
};

function AnimatedSubtitle({
  exerciseCount,
  tabSwitchProgress,
}: AnimatedSubtitleProps) {
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: 1 - tabSwitchProgress.value,
    transform: [{ scale: 1 - tabSwitchProgress.value * 0.1 }],
  }));

  return (
    <Animated.View style={subtitleStyle}>
      <Text light>{`${exerciseCount} exercises`}</Text>
    </Animated.View>
  );
}

type RoutineModalContentProps = {
  isDraft: boolean;
  sheetsReady: boolean;
  tabNavigation: any;
  setTabNavigation: (navigation: any) => void;
};

function RoutineModalContent({
  isDraft,
  sheetsReady,
  tabNavigation,
  setTabNavigation,
}: RoutineModalContentProps) {
  const navigation = useNavigation();
  const { routine } = useRoutine();
  const {
    openEditName,
    openReorderExercises,
    openStartConfirmation,
    openDeleteConfirmation,
  } = useRoutineSheets();

  const moreButtonRef = useRef<RNView>(null);
  const moreButtonProgress = useSharedValue(0);
  const popoverRef = useRef<PopoverRef>(null);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const tabSwitchProgress = useSharedValue(0);

  const hasPresentedDraftName = useRef(false);

  useEffect(() => {
    if (isDraft && sheetsReady && !hasPresentedDraftName.current) {
      hasPresentedDraftName.current = true;
      openEditName("create");
    }
  }, [isDraft, sheetsReady, openEditName]);

  const primaryTextColor = useThemeColoring("primaryText");
  const primaryActionColor = useThemeColoring("primaryAction");
  const dangerActionColor = useThemeColoring("dangerAction");

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleBack = useCallback(() => {
    tabNavigation?.navigate("Edit");
  }, [tabNavigation]);

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
    // The plus button is only visible on the AddExercises tab.
    // @ts-ignore
    navigation.navigate("createExerciseSheet");
  }, [navigation]);

  const handleTabChange = useCallback((index: number) => {
    setActiveTabIndex(index);
    tabSwitchProgress.value = withTiming(index, { duration: 200 });
  }, []);

  const handleTitlePress = useCallback(() => {
    openEditName("rename");
  }, [openEditName]);

  const handleEditName = useCallback(() => {
    popoverRef.current?.close();
    openEditName("rename");
  }, [openEditName]);

  const handleAddExercises = useCallback(() => {
    popoverRef.current?.close();
    tabNavigation?.navigate("AddExercises");
  }, [tabNavigation]);

  const handleReorderExercises = useCallback(() => {
    popoverRef.current?.close();
    openReorderExercises();
  }, [openReorderExercises]);

  const handleStart = useCallback(() => {
    popoverRef.current?.close();
    openStartConfirmation();
  }, [openStartConfirmation]);

  const handleDelete = useCallback(() => {
    popoverRef.current?.close();
    openDeleteConfirmation();
  }, [openDeleteConfirmation]);

  return (
    <View style={{ height: "100%" }}>
      <HeaderPage
        title={
          <AnimatedHeader
            routineName={routine.name}
            tabSwitchProgress={tabSwitchProgress}
            onTitlePress={handleTitlePress}
          />
        }
        subtitle={
          <AnimatedSubtitle
            exerciseCount={routine.plan.length}
            tabSwitchProgress={tabSwitchProgress}
          />
        }
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
            name="Edit"
            component={EditRoutine}
            listeners={({ navigation }) => ({
              focus: () => {
                handleTabChange(0);
                setTabNavigation(navigation);
              },
            })}
          />
          <Tab.Screen
            name="AddExercises"
            component={AddExercises}
            listeners={({ navigation }) => ({
              focus: () => {
                handleTabChange(1);
                setTabNavigation(navigation);
              },
            })}
          />
        </Tab.Navigator>
      </HeaderPage>

      <Popover ref={popoverRef} progress={moreButtonProgress}>
        <PopoverItem
          label="Edit Name"
          icon={<FilePenLine size={20} color={primaryTextColor} />}
          onClick={handleEditName}
        />
        <PopoverItem
          label="Add Exercises"
          icon={<Dumbbell size={20} color={primaryTextColor} />}
          onClick={handleAddExercises}
        />
        <PopoverItem
          label="Reorder Exercises"
          icon={<Shuffle size={20} color={primaryTextColor} />}
          onClick={handleReorderExercises}
        />
        <PopoverItem
          label={
            <Text style={{ color: primaryActionColor }}>Start Routine</Text>
          }
          icon={<Flag size={20} color={primaryActionColor} />}
          onClick={handleStart}
        />
        <PopoverItem
          label={
            <Text style={{ color: dangerActionColor }}>Delete Routine</Text>
          }
          icon={<Trash2 size={20} color={dangerActionColor} />}
          onClick={handleDelete}
        />
      </Popover>
    </View>
  );
}

type RoutineModalProps = { route: any };

export function RoutineModal({ route }: RoutineModalProps) {
  const { id, isDraft } = route.params;

  return (
    <RoutineProvider routineId={id} isDraft={isDraft}>
      <RoutineModalBody isDraft={!!isDraft} />
    </RoutineProvider>
  );
}

function RoutineModalBody({ isDraft }: { isDraft: boolean }) {
  const navigation = useNavigation();
  const { routine } = useRoutine();
  const { isInWorkout, saveWorkout } = useLiveWorkout();
  const { userDetails } = useUserDetails();
  const toast = useToast();
  const [tabNavigation, setTabNavigation] = useState<any>(null);
  const [sheetsReady, setSheetsReady] = useState<boolean>(false);

  const handleSheetsReady = useCallback(() => {
    setSheetsReady(true);
  }, []);

  const handleStart = useCallback(() => {
    if (isInWorkout) {
      toast.show(
        "Please finish your current workout before trying to start another workout",
        { type: "danger" }
      );
    } else {
      saveWorkout(
        WorkoutCreation.createFromRoutine(
          routine,
          userDetails?.bodyweight as number
        )
      );
      navigation.goBack();
      // @ts-ignore
      navigation.navigate("liveWorkoutSheet");
    }
  }, [isInWorkout, toast, saveWorkout, routine, userDetails, navigation]);

  const handleDelete = useCallback(() => {
    WorkoutApi.deleteRoutine(routine.id).then(() => navigation.goBack());
  }, [routine.id, navigation]);

  const handleNameSaved = useCallback(
    (mode: "create" | "rename") => {
      if (mode === "create") {
        tabNavigation?.navigate("AddExercises");
      }
    },
    [tabNavigation]
  );

  return (
    <BottomSheetModalProvider>
      <RoutineSheets
        onStart={handleStart}
        onDelete={handleDelete}
        onNameSaved={handleNameSaved}
        onSheetsReady={handleSheetsReady}
      >
        <RoutineModalContent
          isDraft={isDraft}
          sheetsReady={sheetsReady}
          tabNavigation={tabNavigation}
          setTabNavigation={setTabNavigation}
        />
      </RoutineSheets>
    </BottomSheetModalProvider>
  );
}
