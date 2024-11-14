import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { darkNavigationColorTheme } from "@/constants/Themes";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useColorScheme } from "@/components/useColorScheme";
import { WorkoutProvider } from "@/context/WorkoutContext";
import { ToastProvider } from "react-native-toast-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Preloader } from "@/components/preload";
import { KeypadProvider } from "@/context/keypad";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView>
      <ThemeProvider
        value={colorScheme === "dark" ? darkNavigationColorTheme : DefaultTheme}
      >
        <ToastProvider>
          <WorkoutProvider>
            <Preloader>
              <KeypadProvider>
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </KeypadProvider>
            </Preloader>
          </WorkoutProvider>
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
