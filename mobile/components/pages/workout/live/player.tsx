import React, {
  useRef,
  forwardRef,
  useState,
  useImperativeHandle,
} from "react";
import {
  StyleSheet,
  View as RNView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  SharedValue,
  LinearTransition,
  FadeInUp,
  FadeOutDown,
} from "react-native-reanimated";

import { View, Text, useThemeColoring } from "@/components/Themed";
import { HeaderPage } from "@/components/util/header-page";
import { StyleUtils } from "@/util/styles";
import {
  getCurrentWorkoutActivity,
  updateSet,
  wrapUpSets,
} from "@/context/WorkoutContext";
import { Set, Workout } from "@/interface";
import { EditField } from "@/components/pages/workout/common";
import { useNavigation } from "@react-navigation/native";
import { Flag, FilePenLine, Dumbbell } from "lucide-react-native";
import { CloseButton, MoreButton } from "@/components/pages/common";
import { Popover, PopoverItem, PopoverRef } from "@/components/util/popover";
import { getTimePeriodDisplay } from "@/util/date";
import { useRefresh } from "@/components/hooks/use-refresh";
import { DiscardSetsAndFinishConfirmation } from "@/components/sheets";
import { EditWorkout } from "@/components/sheets/edit-workout";
import { EditSetSheet } from "@/components/sheets/edit-set";
import { WorkoutApi } from "@/api/workout";

import { LiveProgress } from "@/components/workout/live";
import { SetCard, CompletionCard } from "./set-card";
import {
  useCurrentSet,
  useLiveWorkout,
} from "@/components/pages/workout/live/context";
import { SetActions, WorkoutActions, WorkoutQuery } from "@/api/model/workout";

const exerciseCardsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
  },
});

type ExerciseCardsProps = {
  workout: Workout;
  onEditSet?: (exerciseId: string, setId: string, field: EditField) => void;
  navigation: any;
};

function ExercisesCards({
  workout,
  onEditSet,
  navigation,
}: ExerciseCardsProps) {
  const { saveWorkout } = useLiveWorkout();
  const currentPair = useCurrentSet();

  const handleCompleteSet = (setId: string) => {
    saveWorkout((workout) => SetActions(workout!, setId).rest());
  };

  const handleSkipRest = (setId: string) => {
    saveWorkout((workout) => SetActions(workout!, setId).finish());
  };

  const nextPair = WorkoutQuery.getNextUnstartedSet(
    workout!,
    currentPair?.set.id ?? ""
  );

  const nextNextPair = WorkoutQuery.getNextUnstartedSet(
    workout!,
    nextPair?.set?.id ?? ""
  );

  // Check if all exercises are finished
  const allExercisesFinished = !nextPair && !nextNextPair;

  return (
    <Animated.View
      style={exerciseCardsStyles.container}
      layout={LinearTransition.springify().damping(20).stiffness(150)}
    >
      {/* Current Exercise Card */}
      {currentPair && (
        <Animated.View
          key={`${currentPair.set.id}`}
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(300)}
          layout={LinearTransition.springify().damping(20).stiffness(150)}
          style={exerciseCardsStyles.container}
        >
          <SetCard
            onSkipRest={() => handleSkipRest(currentPair.set.id)}
            exercise={currentPair.exercise}
            set={currentPair.set}
            onCompleteSet={handleCompleteSet}
            onUpdateWorkout={saveWorkout}
            workout={workout}
            onEditSet={onEditSet}
          />
        </Animated.View>
      )}

      {/* Next Exercise Card */}
      {nextPair && (
        <Animated.View
          key={`${nextPair.set.id}`}
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(300)}
          layout={LinearTransition.springify().damping(20).stiffness(150)}
          style={exerciseCardsStyles.container}
        >
          <SetCard
            onSkipRest={() => {}}
            exercise={nextPair.exercise}
            set={nextPair.set}
            onCompleteSet={() => {}} // No action for next card
            onUpdateWorkout={saveWorkout}
            workout={workout}
            onEditSet={onEditSet}
          />
        </Animated.View>
      )}

      {/* Next Next Exercise Card */}
      {nextNextPair && (
        <Animated.View
          key={`${nextNextPair.set.id}`}
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(300)}
          layout={LinearTransition.springify().damping(20).stiffness(150)}
          style={exerciseCardsStyles.container}
        >
          <SetCard
            onSkipRest={() => {}}
            exercise={nextNextPair.exercise}
            set={nextNextPair.set}
            onCompleteSet={() => {}} // No action for next next card
            onUpdateWorkout={saveWorkout}
            workout={workout}
            onEditSet={onEditSet}
          />
        </Animated.View>
      )}

      {/* Completion Card - Shows when all exercises are finished */}
      {allExercisesFinished && (
        <Animated.View
          key="completion-card"
          entering={FadeInUp.duration(300)}
          layout={LinearTransition.springify().damping(20).stiffness(150)}
          style={exerciseCardsStyles.container}
        >
          <CompletionCard
            workout={workout}
            onAddExercises={() => {
              // Navigate to add exercises
              (navigation as any).navigate("editExercises");
            }}
            onFinishWorkout={() => {
              saveWorkout((workout) => WorkoutActions(workout!).finish());
              WorkoutApi.saveWorkout(workout!).then(() => {
                navigation.goBack();
                // @ts-ignore
                navigation.navigate("completedWorkoutSheet", {
                  id: workout.id,
                });
                saveWorkout(undefined);
              });
            }}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

export function Player() {
  const navigation = useNavigation();
  const { workout, saveWorkout } = useLiveWorkout();
  const popoverRef = useRef<PopoverRef>(null);
  const moreButtonRef = useRef<RNView>(null);
  const sheetsRef = useRef<PlayerSheetsRef>(null);
  const popoverProgress = useSharedValue(0);
  const primaryTextColor = useThemeColoring("primaryText");
  const primaryActionColor = useThemeColoring("primaryAction");

  useRefresh({ period: 1000 });

  const handleClose = () => {
    navigation.goBack();
  };

  const handleMore = () => {
    if (moreButtonRef.current) {
      moreButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        popoverRef.current?.open(pageX + width + 5, pageY + 20);
      });
    }
  };

  const handleEditWorkout = () => {
    popoverRef.current?.close();
    sheetsRef.current?.openEdit();
  };

  const handleAttemptToFinishWorkout = () => {
    popoverRef.current?.close();
    const hasUnfinishedSets = WorkoutQuery.hasUnfinishedSets(workout!);
    if (hasUnfinishedSets) {
      sheetsRef.current?.openFinish();
    } else {
      handleFinishWorkout();
    }
  };

  const handleFinishWorkout = () => {
    const finishedWorkout = WorkoutActions(workout!).finish();
    WorkoutApi.saveWorkout(finishedWorkout).then(() => {
      navigation.goBack();
      // @ts-ignore
      navigation.navigate("completedWorkoutSheet", {
        id: workout!.id,
      });
      saveWorkout(undefined);
    });
  };

  const handleEditExercises = () => {
    popoverRef.current?.close();
    (navigation as any).navigate("editExercises");
  };

  const handleUpdateWorkout = (update: Partial<Workout>) => {
    saveWorkout((workout) =>
      workout !== undefined ? { ...workout, ...update } : workout
    );
  };

  const handleEditSet = (
    exerciseId: string,
    setId: string,
    field?: EditField
  ) => {
    sheetsRef.current?.openEditSet(exerciseId, setId, field);
  };

  return (
    <>
      <HeaderPage
        title={workout?.name ?? ""}
        subtitle={
          workout?.startedAt
            ? getTimePeriodDisplay(Date.now() - workout!.startedAt)
            : ""
        }
        leftAction={<CloseButton onClick={handleClose} />}
        rightAction={
          <MoreButton
            ref={moreButtonRef}
            onClick={handleMore}
            progress={popoverProgress}
          />
        }
      >
        {workout && <LiveProgress workout={workout} />}

        {workout && (
          <ExercisesCards
            workout={workout!}
            onEditSet={handleEditSet}
            navigation={navigation}
          />
        )}
      </HeaderPage>
      <Popover ref={popoverRef} progress={popoverProgress}>
        <PopoverItem
          label="Edit Name & Time"
          icon={<FilePenLine size={20} color={primaryTextColor} />}
          onClick={handleEditWorkout}
        />
        <PopoverItem
          label="Edit Exercises"
          icon={<Dumbbell size={20} color={primaryTextColor} />}
          onClick={handleEditExercises}
        />
        <PopoverItem
          label={
            <Text neutral style={{ color: primaryActionColor }}>
              Finish Workout
            </Text>
          }
          icon={<Flag size={20} color={primaryActionColor} />}
          onClick={handleAttemptToFinishWorkout}
        />
      </Popover>
      <PlayerSheets
        ref={sheetsRef}
        workout={workout}
        onUpdateWorkout={handleUpdateWorkout}
        onFinishWorkout={handleFinishWorkout}
      />
    </>
  );
}

type PlayerSheetsProps = {
  workout?: Workout;
  onUpdateWorkout: (update: Partial<Workout>) => void;
  onFinishWorkout: () => void;
};

type PlayerSheetsRef = {
  openEdit: () => void;
  openFinish: () => void;
  openEditSet: (exerciseId: string, setId: string, field?: EditField) => void;
};

const PlayerSheets = forwardRef<PlayerSheetsRef, PlayerSheetsProps>(
  ({ workout, onUpdateWorkout, onFinishWorkout }, ref) => {
    const [isEditingWorkout, setIsEditingWorkout] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [showEditSetSheet, setShowEditSetSheet] = useState(false);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>();
    const [selectedSetId, setSelectedSetId] = useState<string>();
    const [selectedField, setSelectedField] = useState<EditField>();

    const openEdit = () => {
      setIsEditingWorkout(true);
    };

    const openFinish = () => {
      setIsFinishing(true);
    };

    const openEditSet = (
      exerciseId: string,
      setId: string,
      field?: EditField
    ) => {
      setSelectedExerciseId(exerciseId);
      setSelectedSetId(setId);
      setSelectedField(field);
      setShowEditSetSheet(true);
    };

    useImperativeHandle(ref, () => ({
      openEdit,
      openFinish,
      openEditSet,
    }));

    const handleWorkoutUpdate = async (update: Partial<Workout>) => {
      if (workout) {
        onUpdateWorkout(update);
      }
    };

    const handleFinishConfirm = () => {
      setIsFinishing(false);
      onFinishWorkout();
    };

    const handleHideEditSetSheet = () => {
      setShowEditSetSheet(false);
      setSelectedExerciseId(undefined);
      setSelectedSetId(undefined);
      setSelectedField(undefined);
    };

    const handleUpdateSetFromSheet = (setId: string, update: Partial<Set>) => {
      if (workout) {
        const updatedWorkout = updateSet(setId, update, workout);
        onUpdateWorkout(updatedWorkout);
      }
    };

    const editNameSheetRef = useRef<any>(null);
    const discardAndFinishSheetRef = useRef<any>(null);
    const editSetSheetRef = useRef<any>(null);

    // Find the selected exercise
    const selectedExercise = selectedExerciseId
      ? workout?.exercises.find((ex) => ex.id === selectedExerciseId)
      : undefined;

    return (
      <>
        {workout && (
          <>
            <EditWorkout
              ref={editNameSheetRef}
              show={isEditingWorkout}
              hide={() => editNameSheetRef.current?.close()}
              onHide={() => setIsEditingWorkout(false)}
              workout={workout}
              onUpdate={handleWorkoutUpdate}
              disableEndDateEdit={true}
            />
            <DiscardSetsAndFinishConfirmation
              ref={discardAndFinishSheetRef}
              show={isFinishing}
              hide={() => discardAndFinishSheetRef.current?.close()}
              onHide={() => setIsFinishing(false)}
              onDiscard={handleFinishConfirm}
            />
            {selectedExercise && (
              <EditSetSheet
                ref={editSetSheetRef}
                show={showEditSetSheet}
                hide={() => editSetSheetRef.current?.close()}
                onHide={handleHideEditSetSheet}
                exercise={selectedExercise}
                setId={selectedSetId}
                focusField={selectedField}
                onUpdate={handleUpdateSetFromSheet}
              />
            )}
          </>
        )}
      </>
    );
  }
);
