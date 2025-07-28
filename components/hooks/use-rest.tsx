import { useRefresh } from "./use-refresh";
import { useCallback, useEffect, useRef } from "react";
import { SetStatus } from "@/interface";
import { useSound } from "../sounds";
import {
  Easing,
  SharedValue,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useCurrentSet, useLiveWorkout } from "../pages/workout/live/context";
import { SetActions } from "@/api/model/workout";
import { useUserDetails } from "../user-details";
import {
  scheduleNotification,
  unscheduleNotifications,
  NotificationType,
} from "@/api/notification";
import * as Notifications from "expo-notifications";
import { useDebounce } from "./use-debounce";

const REST_FINISHING_THRESHOLD = 5000;

// restDuration is in seconds
function isRestFinished(restStartedAt: number, restDuration: number) {
  return restStartedAt + restDuration * 1000 < Date.now();
}

function isRestFinishing(restStartedAt: number, restDuration: number) {
  const restFinishEta = restStartedAt + restDuration * 1000;
  return (
    restFinishEta - Date.now() < REST_FINISHING_THRESHOLD &&
    restFinishEta > Date.now()
  );
}

// orchestrates finishing rest in the background of the workout
export function useRestSounds() {
  const { counter } = useRefresh({ period: 1000 });
  const { play, stop } = useSound();
  const restEndingAudioAlertsRef = useRef<string>("");

  const currentSet = useCurrentSet();
  const { saveWorkout } = useLiveWorkout();

  useEffect(() => {
    if (currentSet?.set.status !== SetStatus.RESTING) {
      stop("ready_up");
    }
    if (currentSet?.set.status === SetStatus.RESTING) {
      if (
        isRestFinished(
          currentSet.set.restStartedAt as number,
          currentSet.set.restDuration
        )
      ) {
        saveWorkout((workout) =>
          SetActions(workout!, currentSet.set.id).finish()
        );
      } else if (
        isRestFinishing(
          currentSet.set.restStartedAt as number,
          currentSet.set.restDuration
        )
      ) {
        if (restEndingAudioAlertsRef.current !== currentSet.set.id) {
          play("ready_up");
          restEndingAudioAlertsRef.current = currentSet.set.id;
        }
      } else {
        restEndingAudioAlertsRef.current = "";
        stop("ready_up");
      }
    }
  }, [counter, currentSet?.set.status]);
}

type UseRestResult = {
  remainingRestMs: number;
  restProgress: SharedValue<number>;
};

type UseRestProps = {
  isResting: boolean;
  restDurationMs: number;
  restStartedAtMs: number;
};

export function useRest({
  isResting,
  restDurationMs,
  restStartedAtMs,
}: UseRestProps): UseRestResult {
  const restProgress = useSharedValue(0);
  useRefresh({ period: 1000 });
  useEffect(() => {
    if (isResting && restDurationMs > 0) {
      const remaining = Math.max(
        restDurationMs + restStartedAtMs - Date.now(),
        0
      );
      const currentRestProgress = 1 - remaining / restDurationMs;
      restProgress.value = withSequence(
        withTiming(currentRestProgress),
        withTiming(1, {
          duration: remaining,
          easing: Easing.linear,
        })
      );
    } else {
      restProgress.value = 0;
    }
  }, [isResting, restDurationMs, restStartedAtMs]);

  const remainingRestMs = isResting
    ? Math.max(restDurationMs + restStartedAtMs - Date.now(), 0)
    : 0;

  return { remainingRestMs, restProgress };
}

const REST_NOTIFICATION_MESSAGES = [
  {
    title: "Time to Crush It!",
    body: "Your rest is up! Let's push harder and make this set count!",
  },
  {
    title: "Hey, Ready?",
    body: "Rest's over! Let's get moving.",
  },
  {
    title: "Back at It!",
    body: "Rest done, energy up, go smash that next set!",
  },
  {
    title: "You Got This!",
    body: "Rest is over. Keep the momentum going!",
  },
  {
    title: "Beat Your Best!",
    body: "Time's ticking. Let's go for that next set and break your limits!",
  },
  {
    title: "Rest's Over!",
    body: "Time to hit the next set. Let's do this!",
  },
  {
    title: "Ready for the next round?",
    body: "Shake off the rest and show that set who's boss!",
  },
  {
    title: "Focus Time",
    body: "Rest complete. Dial in and give this set your best effort.",
  },
  {
    title: "Lights, Camera, Action!",
    body: "Your break's done. Now it's showtime for the next set!",
  },
  {
    title: "Keep the Fire Burning",
    body: "Rest ended. Stoke the energy and crush your next reps.",
  },
  {
    title: "Next Set, Next Level!",
    body: "You rested. Now rise to the challenge!",
  },
  {
    title: "Get Back to It!",
    body: "Rest is over. Time to get back to it!",
  },
  {
    title: "Reset Complete",
    body: "Recharge done! Hit the next set with full force.",
  },
  {
    title: "Let's Go!",
    body: "Rest finished. Back to the grind!",
  },
  {
    title: "Push Past Limits",
    body: "Break's ended. Time to shatter your goals!",
  },
  {
    title: "Time to Hustle",
    body: "Your rest clocked out. Time to get back to work!",
  },
  {
    title: "Rise and Grind",
    body: "Rest done. Let's build that strength set by set!",
  },
  {
    title: "Champions Don't Rest Long",
    body: "Break's over. You know what to do next!",
  },
  {
    title: "Ready to Dominate?",
    body: "Rest time's up. Show that set who's in charge!",
  },
];

export function useRestNotification() {
  const { userDetails } = useUserDetails();
  const { invoke } = useDebounce({ delay: 300 });

  const currentSet = useCurrentSet();

  const scheduleRestNotification = useCallback(
    async (toNotifyInMillis: number) => {
      await unscheduleNotifications(NotificationType.REST_OVER);
      const randomIndex = Math.floor(
        Math.random() * REST_NOTIFICATION_MESSAGES.length
      );
      const randomMessage = REST_NOTIFICATION_MESSAGES[randomIndex];
      await scheduleNotification({
        content: {
          ...randomMessage,
          sound: "rest_notification_ending.wav",
          data: {
            type: NotificationType.REST_OVER,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.floor(toNotifyInMillis / 1000),
        },
      });
    },
    []
  );

  const debouncedScheduleRestNotification = useCallback(
    // @ts-ignore
    invoke(scheduleRestNotification),
    [invoke, scheduleRestNotification]
  );

  useEffect(() => {
    const handle = async () => {
      if (!userDetails?.notificationsEnabled) {
        await unscheduleNotifications(NotificationType.REST_OVER);
        return;
      }

      if (currentSet?.set.status === SetStatus.RESTING) {
        const restEndTime =
          (currentSet.set.restStartedAt as number) +
          currentSet.set.restDuration * 1000;
        const now = Date.now();

        if (restEndTime > now) {
          debouncedScheduleRestNotification(restEndTime - now);
        }
      } else {
        await unscheduleNotifications(NotificationType.REST_OVER);
      }
    };
    handle();
  }, [
    currentSet?.set.status,
    userDetails?.notificationsEnabled,
    currentSet?.set.restDuration,
  ]);
}
