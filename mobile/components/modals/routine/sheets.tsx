import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Keyboard } from "react-native";
import { Set } from "@/interface";
import { EditField } from "@/components/pages/workout/common";
import { ExercisePlanActions, SetPlanActions } from "@/api/model/routine";
import { EditRoutineName } from "@/components/sheets/edit-routine-name";
import { EditSetSheet } from "@/components/sheets/edit-set";
import { EditRestDuration } from "@/components/sheets/edit-rest-duration";
import { AddNoteSheet } from "@/components/sheets/add-note";
import { ReorderExercisesSheet } from "@/components/sheets/reorder-exercises";
import {
  RoutineStartConfirmation,
  RoutineDeleteConfirmation,
} from "@/components/sheets";
import { useRoutine } from "./context";
import { exercisePlanToExercise } from "@/util/workout/routine-adapter";

type RoutineSheetsContextValue = {
  openEditName: (mode: "create" | "rename") => void;
  openEditSet: (
    exercisePlanId: string,
    setId: string,
    field?: EditField
  ) => void;
  openEditRest: (exercisePlanId: string) => void;
  openAddNote: (exercisePlanId: string) => void;
  openReorderExercises: () => void;
  openStartConfirmation: () => void;
  openDeleteConfirmation: () => void;
  muscleFilters: string[];
  exerciseTypeFilters: string[];
  onUpdateMuscleFilters: (filters: string[]) => void;
  onUpdateExerciseTypeFilters: (filters: string[]) => void;
};

const RoutineSheetsContext = createContext<RoutineSheetsContextValue | null>(
  null
);

export function useRoutineSheets() {
  const context = useContext(RoutineSheetsContext);
  if (!context) {
    throw new Error(
      "useRoutineSheets must be used within RoutineSheets"
    );
  }
  return context;
}

type RoutineSheetsState = {
  showEditName: boolean;
  editNameMode: "create" | "rename";
  selectedExercisePlanId?: string;
  selectedSetId?: string;
  selectedField?: EditField;
  showEditRest: boolean;
  showAddNote: boolean;
  showStart: boolean;
  showDelete: boolean;
};

const initialState: RoutineSheetsState = {
  showEditName: false,
  editNameMode: "rename",
  showEditRest: false,
  showAddNote: false,
  showStart: false,
  showDelete: false,
};

type RoutineSheetsProps = {
  children: React.ReactNode;
  onNameSaved?: (mode: "create" | "rename") => void;
  onSheetsReady?: () => void;
  onStart: () => void;
  onDelete: () => void;
};

export function RoutineSheets({
  children,
  onNameSaved,
  onSheetsReady,
  onStart,
  onDelete,
}: RoutineSheetsProps) {
  const { routine, onSave } = useRoutine();

  const [state, setState] = useState<RoutineSheetsState>(initialState);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [exerciseTypeFilters, setExerciseTypeFilters] = useState<string[]>(
    []
  );
  const [shouldRenderSheets, setShouldRenderSheets] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRenderSheets(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (shouldRenderSheets) {
      onSheetsReady?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRenderSheets]);

  const editNameSheetRef = useRef<BottomSheetModal>(null);
  const editSetSheetRef = useRef<BottomSheetModal>(null);
  const editRestSheetRef = useRef<BottomSheet>(null);
  const addNoteSheetRef = useRef<BottomSheet>(null);
  const reorderSheetRef = useRef<BottomSheetModal>(null);
  const startSheetRef = useRef<BottomSheet>(null);
  const deleteSheetRef = useRef<BottomSheet>(null);

  const openEditName = useCallback((mode: "create" | "rename") => {
    setState({ ...initialState, showEditName: true, editNameMode: mode });
    editNameSheetRef.current?.present();
  }, []);

  const openEditSet = useCallback(
    (exercisePlanId: string, setId: string, field?: EditField) => {
      setState({
        ...initialState,
        selectedExercisePlanId: exercisePlanId,
        selectedSetId: setId,
        selectedField: field,
      });
      editSetSheetRef.current?.present();
    },
    []
  );

  const openEditRest = useCallback((exercisePlanId: string) => {
    setState({
      ...initialState,
      selectedExercisePlanId: exercisePlanId,
      showEditRest: true,
    });
  }, []);

  const openAddNote = useCallback((exercisePlanId: string) => {
    setState({
      ...initialState,
      selectedExercisePlanId: exercisePlanId,
      showAddNote: true,
    });
  }, []);

  const openReorderExercises = useCallback(() => {
    reorderSheetRef.current?.present();
  }, []);

  const openStartConfirmation = useCallback(() => {
    setState({ ...initialState, showStart: true });
  }, []);

  const openDeleteConfirmation = useCallback(() => {
    setState({ ...initialState, showDelete: true });
  }, []);

  const handleHideEditName = useCallback(() => {
    Keyboard.dismiss();
    setState({ ...initialState });
  }, []);

  const handleSaveName = useCallback(
    (name: string) => {
      onSave({ ...routine, name });
      onNameSaved?.(state.editNameMode);
    },
    [routine, onSave, onNameSaved, state.editNameMode]
  );

  const selectedExercisePlan = state.selectedExercisePlanId
    ? routine.plan.find((plan) => plan.id === state.selectedExercisePlanId)
    : undefined;

  const handleUpdateSetFromSheet = useCallback(
    (setId: string, update: Partial<Set>) => {
      if (state.selectedExercisePlanId && update.difficulty) {
        onSave(
          SetPlanActions(routine, state.selectedExercisePlanId).update(
            setId,
            { difficulty: update.difficulty }
          )
        );
      }
    },
    [routine, onSave, state.selectedExercisePlanId]
  );

  const handleReorder = useCallback(
    (exercises: { exerciseId: string; metaId: string }[]) => {
      const newPlan = exercises
        .map((ex) => routine.plan.find((plan) => plan.id === ex.exerciseId))
        .filter((plan): plan is NonNullable<typeof plan> => !!plan);
      onSave({ ...routine, plan: newPlan });
    },
    [routine, onSave]
  );

  const contextValue = useMemo<RoutineSheetsContextValue>(
    () => ({
      openEditName,
      openEditSet,
      openEditRest,
      openAddNote,
      openReorderExercises,
      openStartConfirmation,
      openDeleteConfirmation,
      muscleFilters,
      exerciseTypeFilters,
      onUpdateMuscleFilters: setMuscleFilters,
      onUpdateExerciseTypeFilters: setExerciseTypeFilters,
    }),
    [
      openEditName,
      openEditSet,
      openEditRest,
      openAddNote,
      openReorderExercises,
      openStartConfirmation,
      openDeleteConfirmation,
      muscleFilters,
      exerciseTypeFilters,
    ]
  );

  return (
    <RoutineSheetsContext.Provider value={contextValue}>
      {children}

      {shouldRenderSheets && (
        <>
      <EditRoutineName
        ref={editNameSheetRef}
        show={state.showEditName}
        hide={() => editNameSheetRef.current?.dismiss()}
        onHide={handleHideEditName}
        name={routine.name}
        mode={state.editNameMode}
        onSave={handleSaveName}
      />

      <EditSetSheet
        ref={editSetSheetRef}
        hide={() => editSetSheetRef.current?.dismiss()}
        onHide={() => setState({ ...initialState })}
        exercise={
          selectedExercisePlan
            ? exercisePlanToExercise(selectedExercisePlan)
            : undefined
        }
        setId={state.selectedSetId}
        focusField={state.selectedField}
        onUpdate={handleUpdateSetFromSheet}
      />

      {state.selectedExercisePlanId && (
        <EditRestDuration
          ref={editRestSheetRef}
          show={state.showEditRest}
          hide={() => editRestSheetRef.current?.close()}
          onHide={() => setState({ ...initialState })}
          duration={selectedExercisePlan?.rest ?? 60}
          onUpdateDuration={(rest) => {
            if (state.selectedExercisePlanId) {
              onSave(
                ExercisePlanActions(routine).update(
                  state.selectedExercisePlanId,
                  { rest }
                )
              );
            }
          }}
        />
      )}

      {state.selectedExercisePlanId && (
        <AddNoteSheet
          ref={addNoteSheetRef}
          show={state.showAddNote}
          hide={() => addNoteSheetRef.current?.close()}
          onHide={() => setState({ ...initialState })}
          note={selectedExercisePlan?.note || ""}
          onUpdate={(note) => {
            if (state.selectedExercisePlanId) {
              onSave(
                ExercisePlanActions(routine).update(
                  state.selectedExercisePlanId,
                  { note }
                )
              );
            }
          }}
        />
      )}

      <ReorderExercisesSheet
        ref={reorderSheetRef}
        exercises={routine.plan.map((plan) => ({
          exerciseId: plan.id,
          metaId: plan.metaId,
        }))}
        onReorder={handleReorder}
      />

      <RoutineStartConfirmation
        ref={startSheetRef}
        show={state.showStart}
        hide={() => startSheetRef.current?.close()}
        onHide={() => setState({ ...initialState })}
        onStart={onStart}
      />

      <RoutineDeleteConfirmation
        ref={deleteSheetRef}
        show={state.showDelete}
        hide={() => deleteSheetRef.current?.close()}
        onHide={() => setState({ ...initialState })}
        onDelete={onDelete}
      />
        </>
      )}
    </RoutineSheetsContext.Provider>
  );
}
