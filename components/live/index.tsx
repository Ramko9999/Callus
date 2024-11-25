import { useWorkout } from "@/context/WorkoutContext";
import {
  PreviewableBottomSheet,
  PreviewableBottomSheetRef,
} from "../util/sheets";
import { LivePreview } from "./preview";
import { Workout } from "@/interface";
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

export function LiveIndicatorProvider({
  children,
}: LiveIndicatorProviderProps) {
  const { isInWorkout, editor } = useWorkout();
  const { height } = useWindowDimensions();
  const [now, setNow] = useState(Date.now());
  const [showPreview, setShowPreview] = useState(true);
  const previewableBottomSheetRef = useRef<PreviewableBottomSheetRef>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

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
