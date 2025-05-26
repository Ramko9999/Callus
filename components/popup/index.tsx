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
import { FilterExercises } from "@/components/sheets/filter-exercises";

type PopupActions = {
  open: () => void;
  close: () => void;
};

type FilterExercisesActions = PopupActions & {
  show: boolean;
  muscleFilters: string[];
  exerciseTypeFilters: string[];
  onUpdateMuscleFilters: (filters: string[]) => void;
  onUpdateExerciseTypeFilters: (filters: string[]) => void;
};

type PopupContext = {
  startWorkout: PopupActions;
  trendsPeriodSelection: PopupActions & {
    timeRange: string;
  };
  filterExercises: FilterExercisesActions;
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
  filterExercises: {
    open: () => {},
    close: () => {},
    show: false,
    muscleFilters: [],
    exerciseTypeFilters: [],
    onUpdateMuscleFilters: () => {},
    onUpdateExerciseTypeFilters: () => {},
  },
});

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const { userDetails } = useUserDetails();
  const [isStartWorkoutOpen, setIsStartWorkoutOpen] = useState(false);
  const [isTrendsPeriodSelectionOpen, setIsTrendsPeriodSelectionOpen] =
    useState(false);
  const [isFilterExercisesOpen, setIsFilterExercisesOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("6w");
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [exerciseTypeFilters, setExerciseTypeFilters] = useState<string[]>([]);
  const { isInWorkout, actions } = useWorkout();
  const startWorkoutSheetRef = useRef<BottomSheet>(null);
  const trendsPeriodSelectionSheetRef = useRef<BottomSheet>(null);
  const filterExercisesSheetRef = useRef<BottomSheet>(null);

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

  const filterExercises = {
    open: () => setIsFilterExercisesOpen(true),
    close: () => filterExercisesSheetRef.current?.close(),
    show: isFilterExercisesOpen,
    muscleFilters,
    exerciseTypeFilters,
    onUpdateMuscleFilters: setMuscleFilters,
    onUpdateExerciseTypeFilters: setExerciseTypeFilters,
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
    <PopupContext.Provider value={{ startWorkout, trendsPeriodSelection, filterExercises }}>
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
      <FilterExercises
        ref={filterExercisesSheetRef}
        show={isFilterExercisesOpen}
        hide={filterExercises.close}
        onHide={() => setIsFilterExercisesOpen(false)}
        muscleFilters={muscleFilters}
        exerciseTypeFilters={exerciseTypeFilters}
        onUpdateMuscleFilters={setMuscleFilters}
        onUpdateExerciseTypeFilters={setExerciseTypeFilters}
      />
    </PopupContext.Provider>
  );
}

export function usePopup() {
  return useContext(PopupContext);
}
