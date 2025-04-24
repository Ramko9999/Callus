import { UserApi } from "@/api/user";
import { WorkoutApi } from "@/api/workout";
import { INITIAL_ROUTINES } from "@/api/model/routine";
import { AppIcon } from "@/components/theme/custom-svg";
import { useThemeColoring, View } from "@/components/Themed";
import { useUserDetails } from "@/components/user-details";
import { StyleUtils } from "@/util/styles";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Appearance, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleUtils.flexRowCenterAll(),
  },
});

Appearance.setColorScheme("dark");

export function Splash() {
  const navigator = useNavigation();
  const insets = useSafeAreaInsets();
  const { setUserDetails } = useUserDetails();
  const appBgColor = useThemeColoring("appBackground");

  useEffect(() => {
    UserApi.getUserDetails().then(async (userDetails) => {
      // Check if initial routines have been loaded
      const hasLoadedRoutines = await UserApi.hasLoadedInitialRoutines();

      if (!hasLoadedRoutines) {
        try {
          await WorkoutApi.importRoutines(INITIAL_ROUTINES);
          await UserApi.markInitialRoutinesLoaded();
        } catch (error) {
          console.error("Error importing initial routines:", error);
        }
      }

      if (userDetails) {
        setUserDetails(userDetails);
        navigator.navigate("tabs" as never);
      } else {
        navigator.navigate("onboarding" as never);
      }
    });
  }, []);

  return (
    <>
      <StatusBar backgroundColor={appBgColor} />
      <View
        style={[
          splashStyles.container,
          {
            backgroundColor: appBgColor,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <AppIcon
          size={256}
          color={useThemeColoring("primaryText")}
          fill={useThemeColoring("primaryText")}
          viewBox="0 0 520 520"
          strokeWidth={2}
        />
      </View>
    </>
  );
}
