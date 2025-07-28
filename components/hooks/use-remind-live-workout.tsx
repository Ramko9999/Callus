import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useUserDetails } from "../user-details";
import {
  scheduleNotification,
  unscheduleNotifications,
  NotificationType,
} from "@/api/notification";
import * as Notifications from "expo-notifications";
import { useLiveWorkout } from "../pages/workout/live/context";

export function useRemindLiveWorkout() {
  const { userDetails } = useUserDetails();
  const { isInWorkout } = useLiveWorkout();
  const appStateRef = useRef(AppState.currentState);
  const subscriptionRef = useRef<Notifications.EventSubscription | null>(null);

  const scheduleReminderNotifications = useCallback(
    async (isNotificationEnabled: boolean) => {
      if (!isNotificationEnabled) {
        return;
      }

      await scheduleNotification({
        content: {
          title: "Your Workout is Waiting!",
          body: "You've been away for 5 minutes. Time to get back to your workout!",
          data: {
            type: NotificationType.REMIND_LIVE_WORKOUT,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5 * 60,
        },
      });

      await scheduleNotification({
        content: {
          title: "Don't Forget Your Workout!",
          body: "It's been 15 minutes since you started. Don't let your progress slip away!",
          data: {
            type: NotificationType.REMIND_LIVE_WORKOUT,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 15 * 60,
        },
      });
    },
    []
  );

  const handleAppStateChange = useCallback(
    async (
      nextAppState: AppStateStatus,
      isNotificationEnabled: boolean,
      isInWorkout: boolean
    ) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        appStateRef.current = nextAppState;
        await unscheduleNotifications(NotificationType.REMIND_LIVE_WORKOUT);
      } else if (
        appStateRef.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        appStateRef.current = nextAppState;
        if (isInWorkout && isNotificationEnabled) {
          await scheduleReminderNotifications(isNotificationEnabled);
        }
      }
    },
    []
  );

  useEffect(() => {
    const setup = async () => {
      if (!isInWorkout || !(userDetails?.notificationsEnabled ?? false)) {
        await unscheduleNotifications(NotificationType.REMIND_LIVE_WORKOUT);
      }

      subscriptionRef.current = AppState.addEventListener(
        "change",
        (nextAppState) =>
          handleAppStateChange(
            nextAppState,
            userDetails?.notificationsEnabled ?? false,
            isInWorkout
          )
      );
    };

    setup();

    return () => {
      subscriptionRef.current?.remove();
    };
  }, [
    isInWorkout,
    userDetails?.notificationsEnabled,
    scheduleReminderNotifications,
  ]);
}
