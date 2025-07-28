import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useUserDetails } from "@/components/user-details";
import { Platform } from "react-native";

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userDetails } = useUserDetails();

  useEffect(() => {
    const setup = async () => {
      if (userDetails?.notificationsEnabled) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === "granted") {
          // Set up notification handler
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: false,
              shouldPlaySound: false,
              shouldSetBadge: false,
              shouldShowBanner: false,
              shouldShowList: false,
            }),
          });

          if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
              name: "Default",
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              sound: "rest_notification_ending.wav",
            });
          }
          console.log("[NOTIFICATION] setup");
        }
      }
    };
    setup();
  }, [userDetails?.notificationsEnabled]);

  return <>{children}</>;
};
