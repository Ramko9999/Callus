import * as Notifications from "expo-notifications";

export async function scheduleNotification(
  notificationRequest: Notifications.NotificationRequestInput
): Promise<string | null> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    return null;
  }
  const id = await Notifications.scheduleNotificationAsync(notificationRequest);

  console.log("[NOTIFICATION] scheduled notification", id);
  return id;
}

export async function unscheduleNotifications(
  notificationType: NotificationType
): Promise<void> {
  
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  const matchingNotifications = scheduledNotifications.filter(notification => 
    notification.content.data?.type === notificationType
  );

  
  for (const notification of matchingNotifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    console.log("[NOTIFICATION] cancelled notification:", notification.identifier);
  }
}


export enum NotificationType {
  REST_OVER = "REST_OVER",
  REMIND_LIVE_WORKOUT = "REMIND_LIVE_WORKOUT",
}