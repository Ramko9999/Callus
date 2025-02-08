import { UserApi } from "@/api/user";
import { AppIcon } from "@/components/theme/custom-svg";
import { useThemeColoring, View, Text } from "@/components/Themed";
import { useUserDetails } from "@/components/user-details";
import { StyleUtils } from "@/util/styles";
import { useRouter } from "expo-router";
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUserDetails } = useUserDetails();
  const appBgColor = useThemeColoring("appBackground");

  useEffect(() => {
    UserApi.getUserDetails().then((userDetails) => {
      if (userDetails) {
        setUserDetails(userDetails);
        router.push("/(tabs)/history");
      } else {
        router.push("/onboarding");
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
