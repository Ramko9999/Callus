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

type LiveIndicatorProps = {
  showPreview: boolean;
};

const REST_COMPLETING_THRESHOLD = 6000;

function LiveIndicator({ showPreview }: LiveIndicatorProps) {
  const [now, setNow] = useState(Date.now());
  const { isInWorkout, editor, soundPlayer, activity, actions } = useWorkout();
  const previewableBottomSheetRef = useRef<PreviewableBottomSheetRef>(null);
  const { height } = useWindowDimensions();
  const restEndingAudioAlertsRef = useRef<string>();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInWorkout) {
      interval = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isInWorkout]);

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

  const shouldShowIndicator = isInWorkout && showPreview;

  return (
    shouldShowIndicator && (
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
    )
  );
}

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

// todo: fix the indicator not coming up when a workout is started
export function LiveIndicatorProvider({
  children,
}: LiveIndicatorProviderProps) {
  const [showPreview, setShowPreview] = useState(true);
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
        {<LiveIndicator showPreview={showPreview} />}
      </>
    </context.Provider>
  );
}

export function useLiveIndicator() {
  return useContext(context);
}
