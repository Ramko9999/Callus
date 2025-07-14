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
import { TabBarProvider } from "./components/tab-bar/context";
import { Layout, NavigationProvider } from "./layout";
import { SoundProvider } from "./components/sounds";
import { PopupProvider } from "./components/popup";
import { LiveWorkoutProvider } from "./components/pages/workout/live/context";

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
              <SoundProvider>
                <UserDetailsProvider>
                  <LiveWorkoutProvider>
                    <NavigationProvider onReady={SplashScreen.hideAsync}>
                      <PopupProvider>
                        <Preloader>
                          <Layout />
                        </Preloader>
                      </PopupProvider>
                    </NavigationProvider>
                  </LiveWorkoutProvider>
                </UserDetailsProvider>
              </SoundProvider>
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
