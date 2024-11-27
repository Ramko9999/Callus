import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { getTabActiveTintColor } from "@/constants/Themes";
import { Icon } from "@/components/Themed";
import { FontAwesome6 } from "@expo/vector-icons";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // todo: find a better icon for routines

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: getTabActiveTintColor(colorScheme ?? "light"),
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="example"
        options={{
          title: "Example",
          tabBarIcon: ({ color }) => (
            <FontAwesome
              size={28}
              style={{ marginBottom: -3 }}
              name="question"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome
              size={28}
              style={{ marginBottom: -3 }}
              name="history"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: "Routines",
          tabBarIcon: ({ color }) => (
            <FontAwesome6
              size={28}
              style={{ marginBottom: -3 }}
              name="dumbbell"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workout-plans"
        options={{
          title: "Routines",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="hand-paper-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
