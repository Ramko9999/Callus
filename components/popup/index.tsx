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
import { Routine } from "@/interface";
import { WorkoutActions } from "@/api/model/workout";
import { useUserDetails } from "@/components/user-details";
import BottomSheet from "@gorhom/bottom-sheet";

type PopupActions = {
  open: () => void;
  close: () => void;
};

type PopupContext = {
  startWorkout: PopupActions;
};

const PopupContext = createContext<PopupContext>({
  startWorkout: {
    open: () => {},
    close: () => {},
  },
});

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const { userDetails } = useUserDetails();
  const [isStartWorkoutOpen, setIsStartWorkoutOpen] = useState(false);
  const { isInWorkout, actions } = useWorkout();
  const startWorkoutSheetRef = useRef<BottomSheet>(null);

  const toast = useToast();

  const startWorkout = {
    open: () => setIsStartWorkoutOpen(true),
    close: () => setIsStartWorkoutOpen(false),
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
      console.log("Starting new workout");
      actions.startWorkout(
        WorkoutActions.createFromQuickStart(userDetails?.bodyweight as number)
      );
      startWorkoutSheetRef.current?.close();
    }
  }, [actions]);

  return (
    <PopupContext.Provider value={{ startWorkout }}>
      {children}
      <StartWorkoutSheet
        ref={startWorkoutSheetRef}
        show={isStartWorkoutOpen}
        onHide={startWorkout.close}
        onQuickStart={quickStart}
        onStartFromRoutine={startFromRoutine}
      />
    </PopupContext.Provider>
  );
}

export function usePopup() {
  return useContext(PopupContext);
}
