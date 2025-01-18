import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import { getTabActiveTintColor } from "@/constants/Themes";
import { TabBar } from "@/components/util/tab-bar";
import {
  ExampleTabIcon,
  ExerciseTabIcon,
  HomeTabIcon,
  ProfileTabIcon,
  RoutinesTabIcon,
} from "@/components/theme/icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // todo: find a better icon for routines

  return (
    <Tabs
      // @ts-ignore
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: getTabActiveTintColor(colorScheme ?? "light"),
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <HomeTabIcon color={color} />,
        }}
      />

      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercises",
          tabBarIcon: ({ color }) => <ExerciseTabIcon color={color} />,
        }}
      />

      <Tabs.Screen
        name="routines"
        options={{
          title: "Routines",
          tabBarIcon: ({ color }) => <RoutinesTabIcon color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <ProfileTabIcon color={color} />,
        }}
      />

      <Tabs.Screen
        name="example"
        options={{
          title: "Example",
          tabBarIcon: ({ color }) => <ExampleTabIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
