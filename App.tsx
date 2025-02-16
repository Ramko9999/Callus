import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import React, { useEffect } from "react";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { darkNavigationColorTheme } from "./constants/Themes";
import { useColorScheme } from "react-native";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "react-native-toast-notifications";
import { Preloader } from "./components/preload";
import { UserDetailsProvider } from "./components/user-details";
import { TabBarProvider } from "./components/util/tab-bar/context";
import { WorkoutProvider } from "./context/WorkoutContext";
import { Layout } from "./layout";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView>
      <ThemeProvider
        value={colorScheme === "dark" ? darkNavigationColorTheme : DefaultTheme}
      >
        <SafeAreaProvider>
          <TabBarProvider>
            <ToastProvider>
              <WorkoutProvider>
                <Preloader>
                  <UserDetailsProvider>
                    <Layout onReady={SplashScreen.hideAsync} />
                  </UserDetailsProvider>
                </Preloader>
              </WorkoutProvider>
            </ToastProvider>
          </TabBarProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export function App() {
  const [loaded, error] = useFonts({
    SpaceMono: require("./assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  // todo: do we even need those fonts, if not remove them
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}
