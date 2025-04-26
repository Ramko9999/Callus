import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { StartWorkoutSheet } from "../pages/home/start-workout";
import { useWorkout } from "@/context/WorkoutContext";
import { useToast } from "react-native-toast-notifications";
import { Routine, Workout } from "@/interface";
import { WorkoutActions } from "@/api/model/workout";
import { useUserDetails } from "@/components/user-details";
import BottomSheet from "@gorhom/bottom-sheet";
import { TrendsPeriodSelectionSheet } from "@/components/pages/profile/summary/trends-period-selection";

type PopupActions = {
  open: () => void;
  close: () => void;
};

type PopupContext = {
  startWorkout: PopupActions;
  trendsPeriodSelection: PopupActions & {
    timeRange: string;
  };
};

const PopupContext = createContext<PopupContext>({
  startWorkout: {
    open: () => {},
    close: () => {},
  },
  trendsPeriodSelection: {
    open: () => {},
    close: () => {},
    timeRange: "6w",
  },
});

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const { userDetails } = useUserDetails();
  const [isStartWorkoutOpen, setIsStartWorkoutOpen] = useState(false);
  const [isTrendsPeriodSelectionOpen, setIsTrendsPeriodSelectionOpen] =
    useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("6w");
  const { isInWorkout, actions } = useWorkout();
  const startWorkoutSheetRef = useRef<BottomSheet>(null);
  const trendsPeriodSelectionSheetRef = useRef<BottomSheet>(null);

  const toast = useToast();

  const startWorkout = {
    open: () => setIsStartWorkoutOpen(true),
    close: () => setIsStartWorkoutOpen(false),
  };

  const trendsPeriodSelection = {
    open: () => setIsTrendsPeriodSelectionOpen(true),
    close: () => setIsTrendsPeriodSelectionOpen(false),
    timeRange: selectedTimeRange,
  };

  const startFromRoutine = useCallback(
    (routine: Routine) => {
      if (isInWorkout) {
        toast.show(
          "Please finish your current workout before trying to start another workout",
          { type: "danger" }
        );
      } else {
        actions.startWorkout(
          WorkoutActions.createFromRoutine(
            routine,
            userDetails?.bodyweight as number
          )
        );
        startWorkoutSheetRef.current?.close();
      }
    },
    [isInWorkout, toast, actions, userDetails?.bodyweight]
  );

  const quickStart = useCallback(() => {
    if (isInWorkout) {
      toast.show(
        "Please finish your current workout before trying to start another workout",
        { type: "danger" }
      );
    } else {
      actions.startWorkout(
        WorkoutActions.createFromQuickStart(userDetails?.bodyweight as number)
      );
      startWorkoutSheetRef.current?.close();
    }
  }, [isInWorkout, toast, actions, userDetails?.bodyweight]);

  const startFromWorkout = useCallback(
    (workout: Workout) => {
      if (isInWorkout) {
        toast.show(
          "Please finish your current workout before trying to start another workout",
          { type: "danger" }
        );
      } else {
        actions.startWorkout(
          WorkoutActions.createFromWorkout(
            workout,
            userDetails?.bodyweight as number
          )
        );
        startWorkoutSheetRef.current?.close();
      }
    },
    [isInWorkout, toast, actions, userDetails?.bodyweight]
  );

  const setTimeRange = useCallback((range: string) => {
    setSelectedTimeRange(range);
    trendsPeriodSelectionSheetRef.current?.close();
  }, []);

  return (
    <PopupContext.Provider value={{ startWorkout, trendsPeriodSelection }}>
      {children}
      <StartWorkoutSheet
        ref={startWorkoutSheetRef}
        show={isStartWorkoutOpen}
        onHide={startWorkout.close}
        onQuickStart={quickStart}
        onStartFromRoutine={startFromRoutine}
        onStartFromWorkout={startFromWorkout}
      />
      <TrendsPeriodSelectionSheet
        ref={trendsPeriodSelectionSheetRef}
        show={isTrendsPeriodSelectionOpen}
        onHide={trendsPeriodSelection.close}
        selectedTimeRange={selectedTimeRange}
        onSelectTimeRange={setTimeRange}
      />
    </PopupContext.Provider>
  );
}

export function usePopup() {
  return useContext(PopupContext);
}
