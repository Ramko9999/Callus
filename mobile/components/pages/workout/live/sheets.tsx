import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { Exercise, Set } from "@/interface";
import { EditField } from "@/components/pages/workout/common";
import { SetActions, ExerciseActions } from "@/api/model/workout";
import { EditWorkout } from "@/components/sheets/edit-workout";
import { DiscardSetsAndFinishConfirmation } from "@/components/sheets";
import { EditSetSheet } from "@/components/sheets/edit-set";
import { EditRestDuration } from "@/components/sheets/edit-rest-duration";
import { AddNoteSheet } from "@/components/sheets/add-note";
import { Keyboard } from "react-native";
import { useLiveWorkout } from "./context";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";

type LiveWorkoutSheetsProps = {
  children: React.ReactNode;
  onFinishWorkout: () => void;
};

const LiveWorkoutSheetsContext = createContext<{
  openNameAndTime: () => void;
  openFinishingConfirmation: () => void;
  openEditSet: (exerciseId: string, setId: string, field?: EditField) => void;
  openReorderExercises: () => void;
  openEditRest: (exerciseId: string) => void;
  openAddNote: (exerciseId: string) => void;
  muscleFilters: string[];
  exerciseTypeFilters: string[];
  onUpdateMuscleFilters: (filters: string[]) => void;
  onUpdateExerciseTypeFilters: (filters: string[]) => void;
} | null>(null);

export function useLiveWorkoutSheets() {
  const context = useContext(LiveWorkoutSheetsContext);
  if (!context) {
    throw new Error(
      "useLiveWorkoutSheets must be used within LiveWorkoutSheetsProvider"
    );
  }
  return context;
}

type LiveWorkoutSheetsState = {
  showNameAndTime: boolean;
  showFinishingConfirmation: boolean;
  showEditSetSheet: boolean;
  selectedExerciseId?: string;
  selectedSetId?: string;
  selectedField?: EditField;
  showReorder: boolean;
  showEditRest: boolean;
  showAddNoteSheet: boolean;
  showFilterExercises: boolean;
};

const initialState: LiveWorkoutSheetsState = {
  showNameAndTime: false,
  showFinishingConfirmation: false,
  showEditSetSheet: false,
  showReorder: false,
  showEditRest: false,
  showAddNoteSheet: false,
  showFilterExercises: false,
};

export function LiveWorkoutSheets({
  children,
  onFinishWorkout,
}: LiveWorkoutSheetsProps) {
  const { workout, saveWorkout } = useLiveWorkout();

  const [sheetsState, setSheetsState] =
    useState<LiveWorkoutSheetsState>(initialState);
  const [shouldRenderSheets, setShouldRenderSheets] = useState<boolean>(false);

  // Filter state
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [exerciseTypeFilters, setExerciseTypeFilters] = useState<string[]>([]);

  // Sheet refs
  const editNameSheetRef = useRef<BottomSheetModal>(null);
  const discardAndFinishSheetRef = useRef<BottomSheet>(null);
  const editSetSheetRef = useRef<BottomSheet>(null);
  const editRestSheetRef = useRef<BottomSheet>(null);
  const addNoteSheetRef = useRef<BottomSheet>(null);

  const openNameAndTime = useCallback(() => {
    editNameSheetRef.current?.present();
  }, []);

  const openFinishingConfirmation = useCallback(() => {
    setSheetsState({ ...initialState, showFinishingConfirmation: true });
  }, []);

  const openEditSet = useCallback(
    (exerciseId: string, setId: string, field?: EditField) => {
      setSheetsState({
        ...initialState,
        selectedExerciseId: exerciseId,
        selectedSetId: setId,
        selectedField: field,
        showEditSetSheet: true,
      });
    },
    []
  );

  const openReorderExercises = useCallback(
    () => setSheetsState({ ...initialState, showReorder: true }),
    []
  );

  const openEditRest = useCallback((exerciseId: string) => {
    setSheetsState({
      ...initialState,
      selectedExerciseId: exerciseId,
      showEditRest: true,
    });
  }, []);

  const openAddNote = useCallback((exerciseId: string) => {
    setSheetsState({
      ...initialState,
      selectedExerciseId: exerciseId,
      showAddNoteSheet: true,
    });
  }, []);

  const handleFinishConfirm = useCallback(() => {
    setSheetsState({ ...initialState, showFinishingConfirmation: false });
    onFinishWorkout();
  }, [onFinishWorkout]);

  const handleUpdateSetFromSheet = useCallback(
    (setId: string, update: Partial<Set>) => {
      saveWorkout((currentWorkout) => {
        if (currentWorkout) {
          return SetActions(currentWorkout, setId).update(update);
        }
        return currentWorkout;
      });
    },
    [saveWorkout]
  );

  const onHideAddNote = useCallback(() => {
    Keyboard.dismiss();
    setSheetsState({ ...initialState });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRenderSheets(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const {
    showNameAndTime,
    showFinishingConfirmation,
    showEditSetSheet,
    selectedExerciseId,
    selectedSetId,
    selectedField,
    showEditRest,
    showAddNoteSheet,
  } = sheetsState;

  // Find the selected exercise
  const selectedExercise = selectedExerciseId
    ? workout?.exercises.find((ex) => ex.id === selectedExerciseId)
    : undefined;

  return (
    <LiveWorkoutSheetsContext.Provider
      value={{
        openNameAndTime,
        openFinishingConfirmation,
        openEditSet,
        openReorderExercises,
        openEditRest,
        openAddNote,
        muscleFilters,
        exerciseTypeFilters,
        onUpdateMuscleFilters: setMuscleFilters,
        onUpdateExerciseTypeFilters: setExerciseTypeFilters,
      }}
    >
      {children}
      {workout && shouldRenderSheets && (
        <>
          {/* Player Sheets */}
          <EditWorkout
            ref={editNameSheetRef}
            workout={workout}
            onUpdate={(update) =>
              saveWorkout((currentWorkout) => {
                if (currentWorkout) {
                  return {
                    ...currentWorkout,
                    ...update,
                  };
                }
                return currentWorkout;
              })
            }
            disableEndDateEdit={true}
          />
          <DiscardSetsAndFinishConfirmation
            ref={discardAndFinishSheetRef}
            show={showFinishingConfirmation}
            hide={() => discardAndFinishSheetRef.current?.close()}
            onHide={() => setSheetsState({ ...initialState })}
            onDiscard={handleFinishConfirm}
          />
          {selectedExercise && selectedSetId && (
            <EditSetSheet
              ref={editSetSheetRef}
              show={showEditSetSheet}
              hide={() => editSetSheetRef.current?.close()}
              onHide={() => setSheetsState({ ...initialState })}
              exercise={selectedExercise}
              setId={selectedSetId}
              focusField={selectedField}
              onUpdate={handleUpdateSetFromSheet}
            />
          )}

          {selectedExerciseId && (
            <EditRestDuration
              ref={editRestSheetRef}
              show={showEditRest}
              hide={() => editRestSheetRef.current?.close()}
              onHide={() => setSheetsState({ ...initialState })}
              duration={
                workout.exercises.find(
                  (ex: Exercise) => ex.id === selectedExerciseId
                )?.restDuration || 0
              }
              onUpdateDuration={(duration) => {
                saveWorkout((currentWorkout) => {
                  if (currentWorkout && selectedExerciseId) {
                    return ExerciseActions(
                      currentWorkout,
                      selectedExerciseId
                    ).updateRest(duration);
                  }
                  return currentWorkout;
                });
              }}
            />
          )}
          {selectedExerciseId && (
            <AddNoteSheet
              ref={addNoteSheetRef}
              show={showAddNoteSheet}
              hide={() => addNoteSheetRef.current?.close()}
              onHide={onHideAddNote}
              note={
                workout.exercises.find(
                  (ex: Exercise) => ex.id === selectedExerciseId
                )?.note || ""
              }
              onUpdate={(note) => {
                saveWorkout((currentWorkout) => {
                  if (currentWorkout && selectedExerciseId) {
                    return ExerciseActions(
                      currentWorkout,
                      selectedExerciseId
                    ).update({ note });
                  }
                  return currentWorkout;
                });
              }}
            />
          )}
        </>
      )}
    </LiveWorkoutSheetsContext.Provider>
  );
}
