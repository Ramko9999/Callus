import { commonSettingsStyles, SettingInput, SettingToggle } from "./common";
import { HeaderPage } from "@/components/util/header-page";
import { ScrollView, StyleSheet, Alert, Linking } from "react-native";
import { useThemeColoring, Text, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { tintColor } from "@/util/color";
import { BackButton } from "../common";
import { useUserDetails } from "@/components/user-details";
import * as Notifications from "expo-notifications";
import { UserApi, UserDetails } from "@/api/user";

const notificationsSettingsStyles = StyleSheet.create({
  group: {
    paddingHorizontal: "5%",
    borderRadius: 10,
  },
  header: {
    paddingHorizontal: "5%",
  },
});

export function NotificationsSettings({ navigation }: any) {
  const { userDetails, setUserDetails } = useUserDetails();
  const groupBgColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      if (status !== "granted") {
        setNotificationsEnabled(false);
      } else {
        setNotificationsEnabled(userDetails?.notificationsEnabled ?? false);
      }
    });
  }, [userDetails?.notificationsEnabled]);

  const handleNotificationsToggle = async () => {
    let updatedDetails = { ...(userDetails as UserDetails) };
    if (notificationsEnabled) {
      updatedDetails.notificationsEnabled = false;
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        updatedDetails.notificationsEnabled = false;
        Alert.alert(
          "Permission Required",
          "To enable notifications, please grant permission in your device settings.",
          [
            { text: "Not Now", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      updatedDetails.notificationsEnabled = true;
    }

    await UserApi.updateUserDetails(updatedDetails);
    setUserDetails(updatedDetails);
    setNotificationsEnabled(updatedDetails.notificationsEnabled);
  };

  return (
    <HeaderPage
      title="Notifications"
      leftAction={<BackButton onClick={navigation.goBack} />}
    >
      <ScrollView contentContainerStyle={commonSettingsStyles.container}>
        <View
          style={[
            notificationsSettingsStyles.group,
            { backgroundColor: groupBgColor },
          ]}
        >
          <SettingInput
            label="Notifications"
            value={
              <SettingToggle
                isOn={notificationsEnabled}
                onToggle={handleNotificationsToggle}
              />
            }
          />
        </View>
      </ScrollView>
    </HeaderPage>
  );
}
