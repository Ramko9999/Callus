import { UserApi } from "@/api/user";
import { useThemeColoring, View, Text } from "@/components/Themed";
import { useUserDetails } from "@/components/user-details";
import { StyleUtils } from "@/util/styles";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleUtils.flexRowCenterAll(),
  },
});

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
        <Text>Replace me with a cool loading logo</Text>
      </View>
    </>
  );
}
