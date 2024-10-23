import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { getTabActiveTintColor } from '@/constants/Themes';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
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
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />
        }}
      />
      <Tabs.Screen
        name="workout-plans"
        options={{title: "Routines", tabBarIcon:({color}) => <TabBarIcon name="hand-paper-o" color={color}/>}}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />
        }}
      />
      
    </Tabs>
  );
}
