import { useWorkout } from "@/context/WorkoutContext";
import {
  PreviewableBottomSheet,
  PreviewableBottomSheetRef,
} from "../util/sheets";
import { LivePreview } from "./preview";
import { RestingActivity, Workout, WorkoutActivityType } from "@/interface";
import { PREVIEW_HEIGHT } from "./constants";
import { useWindowDimensions } from "react-native";
import { WORKOUT_PLAYER_EDITOR_HEIGHT } from "@/util/styles";
import { Live } from "../workout/player/popup";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type LiveIndicatorProviderContext = {
  showContent: () => void;
  hide: () => void;
  show: () => void;
};

const context = createContext<LiveIndicatorProviderContext>({
  showContent: () => {},
  hide: () => {},
  show: () => {},
});

type LiveIndicatorProviderProps = {
  children: React.ReactNode;
};

const REST_COMPLETING_THRESHOLD = 6000;

// todo: fix the indicator not coming up when a workout is started
export function LiveIndicatorProvider({
  children,
}: LiveIndicatorProviderProps) {
  const { isInWorkout, editor, activity, actions, soundPlayer } = useWorkout();
  const { height } = useWindowDimensions();
  const [now, setNow] = useState(Date.now());
  const [showPreview, setShowPreview] = useState(true);
  const previewableBottomSheetRef = useRef<PreviewableBottomSheetRef>(null);
  const restEndingAudioAlertsRef = useRef<string>();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // todo: if someone adds rest quickly while the workout is running, we need to clear the sounds and the ref
  useEffect(() => {
    if (activity?.type === WorkoutActivityType.RESTING) {
      const { set } = activity.activityData as RestingActivity;
      const restFinished =
        (set.restStartedAt as number) + set.restDuration * 1000;
      if (restFinished < Date.now()) {
        actions.completeRest(set.id);
      } else {
        const isRestEnding =
          restFinished - Date.now() < REST_COMPLETING_THRESHOLD &&
          restFinished - Date.now() > REST_COMPLETING_THRESHOLD - 1000;
        if (isRestEnding && restEndingAudioAlertsRef.current !== set.id) {
          restEndingAudioAlertsRef.current = set.id;
          soundPlayer.playRestCompleting();
        }
      }
    }
  }, [now, activity]);

  return (
    <context.Provider
      value={{
        show: () => {
          setShowPreview(true);
        },
        hide: () => setShowPreview(false),
        showContent: () => {
          setShowPreview(true);
        },
      }}
    >
      <>
        {children}
        {isInWorkout && showPreview && (
          <PreviewableBottomSheet
            ref={previewableBottomSheetRef}
            renderPreview={() => (
              <LivePreview
                workout={editor.workout as Workout}
                onClick={() => {
                  previewableBottomSheetRef.current?.openContent();
                }}
              />
            )}
            previewHeight={PREVIEW_HEIGHT}
            contentHeight={height * WORKOUT_PLAYER_EDITOR_HEIGHT}
          >
            <Live
              hide={() => {
                previewableBottomSheetRef.current?.hideContent();
              }}
            />
          </PreviewableBottomSheet>
        )}
      </>
    </context.Provider>
  );
}

export function useLiveIndicator() {
  return useContext(context);
}
