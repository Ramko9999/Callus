import { Exercises } from "@/components/pages/exercises";
import { Profile } from "@/components/pages/profile";
import { Routines } from "@/components/pages/routine";
import { Splash } from "@/components/pages/splash";
import { useThemeColoring } from "@/components/Themed";
import { TabBar } from "@/components/tab-bar";
import { getTabActiveTintColor } from "@/constants/Themes";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import {
  createStackNavigator,
  StackScreenProps,
  TransitionPresets,
} from "@react-navigation/stack";
import Home from "@/components/pages/home";
import { Platform, useColorScheme } from "react-native";
import { RootStackParamList, TabParamList } from "./types";
import { ExerciseInsightsOverviewModal } from "@/components/modals/exercise/insight";
import { CompletedWorkoutModal } from "@/components/modals/workout/completed";
import { RoutineModal } from "@/components/modals/routine";
import { LiveWorkoutModal } from "@/components/modals/workout/live";
import { Settings } from "@/components/pages/settings";
import { Congratulations } from "@/components/modals/congratulations";
import { Onboarding } from "@/components/pages/onboarding";
import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import React from "react";
import { usePopup } from "@/components/popup";
import { BetterExerciseInsight } from "@/components/exercise/insight";
import { CompletedWorkout } from "@/components/pages/workout/completed/index";
import { createSlideUpModalNavigator } from "@/components/util/slide-up";

const Tab = createMaterialTopTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();
const SlideUpModal = createSlideUpModalNavigator();

const tabsStyles = StyleSheet.create({
  flicker: {
    position: "absolute",
    top: 0,
    left: 0,
    ...StyleUtils.expansive(),
  },
});

type TabsProps = StackScreenProps<RootStackParamList, "tabs">;

function Tabs({ route }: TabsProps) {
  const fromOnboarding = route.params?.fromOnboarding ?? false;
  const flickerAnimation = useSharedValue(fromOnboarding ? 1 : 0);
  const colorScheme = useColorScheme();
  const primaryAction = useThemeColoring("primaryAction");
  const { whatsNew } = usePopup();

  const openWhatsNew = () => {
    setTimeout(() => {
      whatsNew.checkWhatsNew();
    }, 300);
  };

  useEffect(() => {
    if (fromOnboarding) {
      flickerAnimation.value = withTiming(0, { duration: 2000 }, (done) => {
        if (done) {
          runOnJS(openWhatsNew)();
        }
      });
    } else {
      openWhatsNew();
    }
  }, [fromOnboarding]);

  const flickerAnimationStyle = useAnimatedStyle(() => {
    return {
      display: flickerAnimation.value === 0 ? "none" : "flex",
      backgroundColor: interpolateColor(
        flickerAnimation.value,
        [0, 1],
        ["transparent", primaryAction]
      ),
    };
  });

  return (
    <>
      <Tab.Navigator
        initialRouteName="history"
        tabBar={(props) => <TabBar {...props} />}
        tabBarPosition="bottom"
        screenOptions={{
          tabBarActiveTintColor: getTabActiveTintColor(colorScheme ?? "light"),
          animationEnabled: false,
        }}
      >
        <Tab.Screen
          name="history"
          component={Home}
          options={{
            title: "History",
          }}
        />
        <Tab.Screen
          name="exercises"
          component={Exercises}
          options={{
            title: "Exercises",
          }}
        />
        <Tab.Screen
          name="routines"
          component={Routines}
          options={{
            title: "Routines",
          }}
        />
        <Tab.Screen
          name="profile"
          component={Profile}
          options={{
            title: "Profile",
          }}
        />
      </Tab.Navigator>
      <Animated.View style={[tabsStyles.flicker, flickerAnimationStyle]} />
    </>
  );
}

type NavigationProviderProps = {
  children: React.ReactNode;
  onReady: () => void;
};

export function NavigationProvider({
  children,
  onReady,
}: NavigationProviderProps) {
  const appBgColor = useThemeColoring("appBackground");

  return (
    <NavigationContainer
      onReady={onReady}
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: appBgColor },
      }}
    >
      {children}
    </NavigationContainer>
  );
}

function InnerLayout() {
  return (
    <Stack.Navigator
      initialRouteName="splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="splash" component={Splash} />
      <Stack.Screen
        name="tabs"
        component={Tabs}
        options={({ route }) => ({
          headerShown: false,
          animation: route.params?.fromOnboarding ? "none" : "default",
        })}
      />
      <Stack.Screen name="settings" component={Settings} />
      <Stack.Screen name="onboarding" component={Onboarding} />
      <Stack.Group
        screenOptions={{
          presentation: "modal",
          gestureEnabled: true,
          ...(Platform.OS === "android"
            ? TransitionPresets.ModalPresentationIOS
            : {}),
        }}
      >
        <Stack.Screen
          name="exerciseInsight"
          component={ExerciseInsightsOverviewModal}
        />
        <Stack.Screen
          name="completedWorkout"
          component={CompletedWorkoutModal}
        />
        <Stack.Screen name="routine" component={RoutineModal} />
        <Stack.Screen name="liveWorkout" component={LiveWorkoutModal} />
        <Stack.Screen name="congratulations" component={Congratulations} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export function Layout() {
  return (
    <SlideUpModal.Navigator>
      <SlideUpModal.Screen name="main" component={InnerLayout} />
      <SlideUpModal.Screen
        name="exerciseInsightSheet"
        options={{ enableContentPanningGesture: false, enableBackdrop: false }}
        component={BetterExerciseInsight}
      />
      <SlideUpModal.Screen
        name="completedWorkoutSheet"
        options={{ enableContentPanningGesture: false, enableBackdrop: false }}
        component={CompletedWorkout}
      />
    </SlideUpModal.Navigator>
  );
}
