import { useWorkout } from "@/context/WorkoutContext";
import { useRefresh } from "./use-refresh";
import { useEffect, useRef } from "react";
import { RestingActivity, WorkoutActivityType } from "@/interface";
import { useSound } from "../sounds";

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
export function useRestOrchestrator() {
  const { counter } = useRefresh({ period: 1000 });
  const { play, stop } = useSound();
  const restEndingAudioAlertsRef = useRef<string>();

  const { activity, actions } = useWorkout();

  useEffect(() => {
    if (activity?.type !== WorkoutActivityType.RESTING) {
      stop("ready_up");
    }
    if (activity?.type === WorkoutActivityType.RESTING) {
      const { set } = activity.activityData as RestingActivity;
      if (isRestFinished(set.restStartedAt as number, set.restDuration)) {
        actions.completeRest(set.id);
      } else if (
        isRestFinishing(set.restStartedAt as number, set.restDuration)
      ) {
        if (restEndingAudioAlertsRef.current !== set.id) {
          play("ready_up");
          restEndingAudioAlertsRef.current = set.id;
        }
      } else {
        restEndingAudioAlertsRef.current = "";
        stop("ready_up");
      }
    }
  }, [counter, activity]);
}
