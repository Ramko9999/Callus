import { UserApi } from "@/api/user";
import { AppIcon } from "@/components/theme/custom-svg";
import { useThemeColoring, View } from "@/components/Themed";
import { useUserDetails } from "@/components/user-details";
import { RootStackParamList } from "@/layout/types";
import { StyleUtils } from "@/util/styles";
import { StackScreenProps } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { Appearance, StyleSheet } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleUtils.flexRowCenterAll(),
  },
});

Appearance.setColorScheme("dark");

type SplashProps = StackScreenProps<RootStackParamList, "splash">;

export function Splash({ navigation }: SplashProps) {
  const insets = useSafeAreaInsets();
  const { setUserDetails } = useUserDetails();
  const appBgColor = useThemeColoring("appBackground");

  useEffect(() => {
    UserApi.getUserDetails().then(async (userDetails) => {
      if (userDetails) {
        setUserDetails(userDetails);
        navigation.replace("tabs", { screen: "history" });
      } else {
        navigation.replace("onboarding");
      }
    });
  }, []);

  return (
    <>
      <SystemBars style="light" />
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
