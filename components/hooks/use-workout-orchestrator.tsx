import { useWorkout } from "@/context/WorkoutContext";
import { useRefresh } from "./use-refresh";
import { useEffect, useRef } from "react";
import { RestingActivity, WorkoutActivityType } from "@/interface";

const REST_COMPLETING_THRESHOLD = 6000;

// orchestrates finishing rest in the background of the workout
export function useWorkoutOrchestrator() {
  const { counter } = useRefresh({ period: 1000 });
  const restEndingAudioAlertsRef = useRef<string>();

  const { activity, actions, soundPlayer } = useWorkout();

  useEffect(() => {
    if (activity?.type === WorkoutActivityType.RESTING) {
      const { set } = activity.activityData as RestingActivity;
      const restFinished =
        (set.restStartedAt as number) + set.restDuration * 1000;
      if (restFinished < Date.now()) {
        actions.completeRest(set.id);
      } else {
        // todo: move to a different hook that lets us play and pause sounds
        const isRestEnding =
          restFinished - Date.now() < REST_COMPLETING_THRESHOLD &&
          restFinished - Date.now() > REST_COMPLETING_THRESHOLD - 1000;
        if (isRestEnding && restEndingAudioAlertsRef.current !== set.id) {
          restEndingAudioAlertsRef.current = set.id;
          soundPlayer.playRestCompleting();
        }
      }
    }
  }, [counter, activity]);
}
