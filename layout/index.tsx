import { Exercises } from "@/components/pages/exercises";
import { Profile } from "@/components/pages/profile";
import { Routines } from "@/components/pages/routine";
import { Splash } from "@/components/pages/splash";
import {
  HistoryTabIcon,
  ExerciseTabIcon,
  RoutinesTabIcon,
  ProfileTabIcon,
} from "@/components/theme/icons";
import { useThemeColoring } from "@/components/Themed";
import { TabBar } from "@/components/tab-bar";
import { getTabActiveTintColor } from "@/constants/Themes";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
import { SettingsModal } from "@/components/modals/settings";
import { Congratulations } from "@/components/modals/congratulations";
import { Onboarding } from "@/components/pages/onboarding";
import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import React from "react";

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

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

  useEffect(() => {
    if (fromOnboarding) {
      flickerAnimation.value = withTiming(0, { duration: 2000 });
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
        initialRouteName="profile"
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: getTabActiveTintColor(colorScheme ?? "light"),
          headerShown: false,
          lazy: false,
          animation: "shift",
        }}
      >
        <Tab.Screen
          name="profile"
          component={Profile}
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <ProfileTabIcon color={color} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="history"
          component={Home}
          options={{
            title: "History",
            tabBarIcon: ({ color, focused }) => (
              <HistoryTabIcon color={color} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="routines"
          component={Routines}
          options={{
            title: "Routines",
            tabBarIcon: ({ color, focused }) => (
              <RoutinesTabIcon color={color} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="exercises"
          component={Exercises}
          options={{
            title: "Exercises",
            tabBarIcon: ({ color, focused }) => (
              <ExerciseTabIcon color={color} focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
      <Animated.View style={[tabsStyles.flicker, flickerAnimationStyle]} />
    </>
  );
}

type LayoutProps = {
  onReady: () => void;
};

export function Layout({ onReady }: LayoutProps) {
  const appBgColor = useThemeColoring("appBackground");

  return (
    <NavigationContainer
      onReady={onReady}
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: appBgColor },
      }}
    >
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
          <Stack.Screen name="settings" component={SettingsModal} />
          <Stack.Screen
            name="completedWorkout"
            component={CompletedWorkoutModal}
          />
          <Stack.Screen name="routine" component={RoutineModal} />
          <Stack.Screen name="liveWorkout" component={LiveWorkoutModal} />
          <Stack.Screen name="congratulations" component={Congratulations} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
