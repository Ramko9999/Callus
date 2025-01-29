import {
  addExercise,
  duplicateLastSet,
  finish,
  finishAllRestingSets,
  getCurrentWorkoutActivity,
  hasUnstartedSets,
  removeExercise,
  removeSet,
  updateExercise,
  updateSet,
  updateWorkout,
  useWorkout,
  WorkoutActions,
  wrapUpSets,
} from "@/context/WorkoutContext";
import {
  Workout,
  ExerciseMeta,
  Exercise,
  WorkoutMetadata,
  Set,
  WorkoutActivityType,
  RestingActivity,
} from "@/interface";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Haptics from "expo-haptics";
import {
  PreviewableSheet,
  PreviewableSheetRef,
} from "@/components/util/popup/sheet/previewable";
import { useTabBar } from "@/components/util/tab-bar/context";
import { Preview } from "./player/preview";
import { InputsPadProvider } from "@/components/util/popup/inputs-pad/context";
import {
  ExerciseEditorContent,
  ExerciseEditorModals,
  SetEditorContent,
  SetEditorModals,
} from "./editor/core";
import { PlayerContent, PlayerModals } from "./player/core";
import { updateExerciseRest } from "@/util/workout/update";
import { View } from "@/components/Themed";
import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { PLACEHOLDER_WORKOUT } from "@/util/mock";
import { CongratsFinishingWorkout } from "./player/congrats";
import {
  ExerciseSearcherContent,
  ExerciseSearcherFiltersState,
  ExerciseSearcherModals,
} from "../common/exercise/add";

const REST_COMPLETING_THRESHOLD = 6000;

const livePlayerSheetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "6%",
    flex: 1,
  },
});

type LivePlayerSheetProps = {
  workout: Workout;
  actions: WorkoutActions;
  show: boolean;
  onSave: (workout: Workout) => void;
};

function LivePlayerSheet({
  workout,
  actions,
  show,
  onSave,
}: LivePlayerSheetProps) {
  const tabBarActions = useTabBar();
  const sheetRef = useRef<PreviewableSheetRef>(null);

  const [exerciseId, setExerciseId] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);

  const exercise = workout.exercises.find(({ id }) => id === exerciseId);

  const [isFinishing, setIsFinishing] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isEditingRest, setIsEditingRest] = useState(false);
  const [exerciseFiltersState, setExerciseFiltersState] =
    useState<ExerciseSearcherFiltersState>({ showFilters: false });

  const activity = getCurrentWorkoutActivity(workout);

  const onHideContent = () => {
    setExerciseId(undefined);
    setIsEditing(false);
    if (workout.endedAt != undefined) {
      actions.discardWorkout();
    }
    tabBarActions.open();
  };

  const onRemoveExercise = (exerciseId: string) => {
    onSave(removeExercise(exerciseId, workout));
  };

  const onAddExercises = (metas: ExerciseMeta[]) => {
    let updatedWorkout = JSON.parse(JSON.stringify(workout));
    metas.forEach((meta) => {
      updatedWorkout = addExercise(meta, updatedWorkout);
    });
    onSave(updatedWorkout);
  };

  const onReorderExercises = (exercises: Exercise[]) => {

    onSave({ ...workout, exercises: finishAllRestingSets(exercises) });
  };

  const onUpdateMeta = (meta: Partial<WorkoutMetadata>) => {
    onSave(updateWorkout({ ...meta }, workout));
  };

  const onAddSet = () => {
    onSave(duplicateLastSet(exerciseId as string, workout));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const onRemoveSet = (setId: string) => {
    onSave(removeSet(setId, workout));
  };

  const onUpdateSet = (setId: string, update: Partial<Set>) => {
    onSave(updateSet(setId, update, workout));
  };

  const onNote = (note?: string) => {
    onSave(updateExercise(exerciseId as string, { note }, workout));
  };

  const onFinish = () => {
    if (hasUnstartedSets(workout)) {
      setIsFinishing(true);
    } else {
      onSave(finish(wrapUpSets(workout)));
    }
  };

  const renderContent = () => {
    if (workout.endedAt != undefined) {
      return <CongratsFinishingWorkout workout={workout} />;
    }

    if (isAddingExercise) {
      return (
        <ExerciseSearcherContent
          muscleFilter={exerciseFiltersState.muscleFilter}
          exerciseTypeFilter={exerciseFiltersState.exerciseTypeFilter}
          onClose={() => {
            setIsAddingExercise(false);
            setExerciseFiltersState({ showFilters: false });
          }}
          onEditFilters={() =>
            setExerciseFiltersState((s) => ({ ...s, showFilters: true }))
          }
          onAdd={onAddExercises}
        />
      );
    }

    if (isEditing) {
      if (exerciseId != undefined) {
        return (
          <SetEditorContent
            onAdd={onAddSet}
            onEditRest={() => setIsEditingRest(true)}
            onRemove={onRemoveSet}
            onUpdate={onUpdateSet}
            onNote={onNote}
            close={() => setExerciseId(undefined)}
            exercise={exercise as Exercise}
            workout={workout}
          />
        );
      } else {
        return (
          <ExerciseEditorContent
            isReordering={isReordering}
            workout={workout}
            onClose={() => setIsEditing(false)}
            onStartReordering={() => setIsReordering(true)}
            onDoneReordering={() => setIsReordering(false)}
            onAdd={() => setIsAddingExercise(true)}
            onRemove={onRemoveExercise}
            onSelect={(exercise) => setExerciseId(exercise.id)}
            onReorder={onReorderExercises}
            onFinish={onFinish}
            onUpdateMeta={onUpdateMeta}
            onEditTimes={() => setIsEditingDates(true)}
          />
        );
      }
    } else {
      return (
        <PlayerContent
          activity={activity}
          workout={workout}
          onCompleteSet={actions.completeSet}
          onSkipRest={actions.completeRest}
          onUpdateRest={actions.updateRestDuration}
          onFinish={onFinish}
          onEdit={() => setIsEditing(true)}
          onClose={() => sheetRef.current?.hideContent()}
        />
      );
    }
  };

  const renderModals = () => {
    if (isAddingExercise) {
      return (
        <ExerciseSearcherModals
          exerciseSearcherFilters={{
            show: exerciseFiltersState.showFilters,
            hide: () =>
              setExerciseFiltersState((s) => ({ ...s, showFilters: false })),
          }}
          muscleFilter={exerciseFiltersState.muscleFilter}
          exerciseTypeFilter={exerciseFiltersState.exerciseTypeFilter}
          onUpdateExerciseTypeFilter={(exerciseTypeFilter) =>
            setExerciseFiltersState((s) => ({ ...s, exerciseTypeFilter }))
          }
          onUpdateMuscleFilter={(muscleFilter) =>
            setExerciseFiltersState((s) => ({ ...s, muscleFilter }))
          }
        />
      );
    }

    if (isEditing) {
      if (exerciseId) {
        return (
          <SetEditorModals
            exercise={exercise as Exercise}
            editRest={(duration) =>
              onSave(updateExerciseRest(exerciseId, duration, workout))
            }
            editingRest={{
              show: isEditingRest,
              hide: () => setIsEditingRest(false),
            }}
          />
        );
      } else {
        return (
          <ExerciseEditorModals
            workout={workout}
            finish={() => onSave(wrapUpSets(workout))}
            updateMeta={onUpdateMeta}
            adjustTimes={{
              show: isEditingDates,
              hide: () => setIsEditingDates(false),
            }}
            finishConfirmation={{
              show: isFinishing,
              hide: () => setIsFinishing(false),
            }}
          />
        );
      }
    } else {
      return (
        <PlayerModals
          finish={() => onSave(wrapUpSets(workout))}
          finishConfirmation={{
            show: isFinishing,
            hide: () => setIsFinishing(false),
          }}
        />
      );
    }
  };

  return (
    show && (
      <>
        <InputsPadProvider>
          <PreviewableSheet
            ref={sheetRef}
            onOpenContent={tabBarActions.close}
            onHideContent={onHideContent}
            renderPreview={() => (
              <Preview
                workout={workout}
                onClick={() => sheetRef.current?.openContent()}
              />
            )}
          >
            <View style={livePlayerSheetStyles.container}>
              {renderContent()}
            </View>
          </PreviewableSheet>
        </InputsPadProvider>
        {renderModals()}
      </>
    )
  );
}

type LiveIndicatorProps = {
  show: boolean;
};

function LiveIndicator({ show }: LiveIndicatorProps) {
  const [now, setNow] = useState(Date.now());
  const { isInWorkout, editor, soundPlayer, activity, actions } = useWorkout();
  const restEndingAudioAlertsRef = useRef<string>();

  // todo: i don't know how the below works correctly, it doesn't.
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

  return (
    <LivePlayerSheet
      show={show && isInWorkout}
      actions={actions}
      workout={editor.workout || PLACEHOLDER_WORKOUT}
      onSave={editor.actions.updateWorkout}
    />
  );
}

type LiveIndicatorProviderContext = {
  hide: () => void;
  show: () => void;
};

const context = createContext<LiveIndicatorProviderContext>({
  hide: () => {},
  show: () => {},
});

type LiveIndicatorProviderProps = {
  children: React.ReactNode;
};

// todo: smoothly close the indicator and open it in sync with the tab bar
export function LiveIndicatorProvider({
  children,
}: LiveIndicatorProviderProps) {
  const [show, setShow] = useState(true);
  return (
    <context.Provider
      value={{
        show: () => {
          setShow(true);
        },
        hide: () => setShow(false),
      }}
    >
      <>
        {children}
        {<LiveIndicator show={show} />}
      </>
    </context.Provider>
  );
}

export function useLiveIndicator() {
  return useContext(context);
}
