import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { StartWorkoutSheet } from "../sheets/start-workout";;
import BottomSheet from "@gorhom/bottom-sheet";
import { TrendsPeriodSelectionSheet } from "@/components/sheets/trends-period-selection";
import { FilterExercises } from "@/components/sheets/filter-exercises";
import { WhatsNewSheet } from "@/components/sheets/whats-new";
import { WhatsNewApi } from "@/api/whats-new";

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
  whatsNew: PopupActions & { checkWhatsNew: () => void };
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
  whatsNew: {
    open: () => {},
    close: () => {},
    checkWhatsNew: () => {},
  },
});

type PopupProviderProps = {
  children: React.ReactNode;
};

export function PopupProvider({ children }: PopupProviderProps) {
  const [isStartWorkoutOpen, setIsStartWorkoutOpen] = useState(false);
  const [isTrendsPeriodSelectionOpen, setIsTrendsPeriodSelectionOpen] =
    useState(false);
  const [isFilterExercisesOpen, setIsFilterExercisesOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("6w");
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [exerciseTypeFilters, setExerciseTypeFilters] = useState<string[]>([]);
  const startWorkoutSheetRef = useRef<BottomSheet>(null);
  const trendsPeriodSelectionSheetRef = useRef<BottomSheet>(null);
  const filterExercisesSheetRef = useRef<BottomSheet>(null);
  const whatsNewSheetRef = useRef<BottomSheet>(null);

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

  const whatsNew = {
    open: () => setIsWhatsNewOpen(true),
    close: () => whatsNewSheetRef.current?.close(),
    checkWhatsNew: async () => {
      const hasSeenWhatsNew = await WhatsNewApi.hasSeenWhatsNew();
      setIsWhatsNewOpen(!hasSeenWhatsNew);
    },
  };

  const setTimeRange = useCallback((range: string) => {
    setSelectedTimeRange(range);
    trendsPeriodSelectionSheetRef.current?.close();
  }, []);

  return (
    <PopupContext.Provider
      value={{ startWorkout, trendsPeriodSelection, filterExercises, whatsNew }}
    >
      {children}
      <StartWorkoutSheet
        ref={startWorkoutSheetRef}
        show={isStartWorkoutOpen}
        hide={() => startWorkoutSheetRef.current?.close()}
        onHide={startWorkout.close}
      />
      <TrendsPeriodSelectionSheet
        ref={trendsPeriodSelectionSheetRef}
        show={isTrendsPeriodSelectionOpen}
        hide={() => trendsPeriodSelectionSheetRef.current?.close()}
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
      <WhatsNewSheet
        ref={whatsNewSheetRef}
        show={isWhatsNewOpen}
        hide={whatsNew.close}
        onHide={() => setIsWhatsNewOpen(false)}
      />
    </PopupContext.Provider>
  );
}

export function usePopup() {
  return useContext(PopupContext);
}
