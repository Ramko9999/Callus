import { useRefresh } from "./use-refresh";
import { useEffect, useRef } from "react";
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
