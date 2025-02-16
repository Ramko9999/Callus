import { Exercises } from "@/components/pages/exercises";
import { Onboarding } from "@/components/pages/onboarding";
import { Profile } from "@/components/pages/profile";
import { Routines } from "@/components/pages/routine";
import { SignUp } from "@/components/pages/sign-up";
import { Splash } from "@/components/pages/splash";
import {
  HistoryTabIcon,
  ExerciseTabIcon,
  RoutinesTabIcon,
  ProfileTabIcon,
} from "@/components/theme/icons";
import { useThemeColoring } from "@/components/Themed";
import { TabBar } from "@/components/util/tab-bar";
import { getTabActiveTintColor } from "@/constants/Themes";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "@/components/pages/home";
import { useColorScheme } from "react-native";
import { LiveIndicatorProvider } from "@/components/popup/workout/live";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Tabs() {
  const colorScheme = useColorScheme();
  return (
    <LiveIndicatorProvider>
      <Tab.Navigator
        initialRouteName="history"
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: getTabActiveTintColor(colorScheme ?? "light"),
          headerShown: false,
          lazy: false,
        }}
      >
        <Tab.Screen
          name="history"
          component={Home}
          options={{
            title: "History",
            tabBarIcon: ({ color }) => <HistoryTabIcon color={color} />,
          }}
        />
        <Tab.Screen
          name="exercises"
          component={Exercises}
          options={{
            title: "Exercises",
            tabBarIcon: ({ color }) => <ExerciseTabIcon color={color} />,
          }}
        />

        <Tab.Screen
          name="routines"
          component={Routines}
          options={{
            title: "Routines",
            tabBarIcon: ({ color }) => <RoutinesTabIcon color={color} />,
          }}
        />

        <Tab.Screen
          name="profile"
          component={Profile}
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <ProfileTabIcon color={color} />,
          }}
        />
      </Tab.Navigator>
    </LiveIndicatorProvider>
  );
}

type LayoutProps = {
  onReady: () => void;
};

export function Layout({ onReady }: LayoutProps) {
  const background = useThemeColoring("appBackground");

  return (
    <NavigationContainer
      onReady={onReady}
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background },
      }}
    >
      <Stack.Navigator initialRouteName="splash">
        <Stack.Screen
          name="splash"
          component={Splash}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding"
          component={Onboarding}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="sign-up"
          component={SignUp}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
