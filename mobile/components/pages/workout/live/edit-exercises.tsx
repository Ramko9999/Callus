import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  GestureResponderEvent,
  Platform,
  View as RNView,
} from "react-native";
import Animated, {
  LinearTransition,
  LightSpeedOutLeft,
  LightSpeedInRight,
  LayoutAnimationConfig,
  FadeInDown,
  FadeOutDown,
} from "react-native-reanimated";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { Exercise, DifficultyType, SetStatus, Set, Workout } from "@/interface";
import { StyleUtils } from "@/util/styles";
import { tintColor } from "@/util/color";
import { useNavigation } from "@react-navigation/native";
import {
  Plus,
  MoreVertical,
  Trash2,
  Shuffle,
  Clock,
  Info,
  Minus,
  SkipForward,
  StickyNote,
} from "lucide-react-native";
import { Popover, PopoverItem, PopoverRef } from "@/components/util/popover";
import { getDurationDisplay } from "@/util/date";
import { useSound } from "@/components/sounds";
import * as Haptics from "expo-haptics";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRefresh } from "@/components/hooks/use-refresh";
import {
  SetRow,
  SetHeader,
  EditField,
} from "@/components/pages/workout/common";
import { useLiveExercise, useCurrentSet, useLiveWorkout } from "./context";
import { useLiveWorkoutSheets } from "./sheets";
import {
  ExerciseActions,
  SetActions,
  WorkoutActions,
  WorkoutQuery,
} from "@/api/model/workout";
import { ExerciseImage } from "@/components/exercise/image";
import { ExerciseStoreSelectors, useExercisesStore } from "@/components/store";
import {
  getHistoricalExerciseDescription,
  getInProgressExerciseDescription,
} from "@/util/workout/display";
import { ReorderExercisesSheet } from "@/components/sheets/reorder-exercises";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

const exerciseCardHeaderStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  topHeader: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    marginBottom: "3%",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: "3%",
  },
  info: {
    ...StyleUtils.flexColumn(),
    justifyContent: "space-between",
    flex: 1,
  },
  name: {
    fontWeight: "600",
  },
  actions: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
  },
  notesContainer: {
    ...StyleUtils.flexColumn(),
    marginBottom: "3%",
  },
});

type ExerciseCardHeaderProps = {
  metaId: string;
  name: string;
  description: string;
  note?: string;
  onMorePress: (event: any, ref: React.RefObject<any>) => void;
  moreButtonRef: React.RefObject<any>;
  onNotePress: () => void;
  onOpenExercise: (metaIdToDifficultyType: string) => void;
};

function ExerciseCardHeader({
  metaId,
  name,
  description,
  note,
  onMorePress,
  moreButtonRef,
  onNotePress,
  onOpenExercise,
}: ExerciseCardHeaderProps) {
  const primaryActionColor = useThemeColoring("primaryAction");

  return (
    <View style={exerciseCardHeaderStyles.container}>
      <View style={exerciseCardHeaderStyles.topHeader}>
        <TouchableOpacity onPress={() => onOpenExercise(metaId)}>
          <ExerciseImage
            metaId={metaId}
            imageStyle={exerciseCardHeaderStyles.image}
            fallbackSize={50}
            fallbackColor={primaryActionColor}
          />
        </TouchableOpacity>
        <View style={exerciseCardHeaderStyles.info}>
          <Text header style={exerciseCardHeaderStyles.name}>
            {name}
          </Text>
          <Text light>{description}</Text>
        </View>
        <View style={exerciseCardHeaderStyles.actions}>
          <TouchableOpacity
            ref={moreButtonRef}
            onPress={(e) => onMorePress(e, moreButtonRef)}
          >
            <MoreVertical size={24} color={primaryActionColor} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={exerciseCardHeaderStyles.notesContainer}
        onPress={onNotePress}
      >
        <Text light sneutral>
          {note || "Add notes here..."}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

type EditSetRowProps = {
  set: Set;
  index: number;
  difficultyType: DifficultyType;
  onEdit: (setId: string, field: EditField) => void;
  showSwipeActions?: boolean;
  isCurrent: boolean;
  isBefore: boolean;
  isAfter: boolean;
  currentSetStatus?: SetStatus;
  currentSetId?: string;
  saveWorkout: React.Dispatch<React.SetStateAction<Workout | undefined>>;
};

const EditSetRow = memo(
  function EditSetRow({
    set,
    index,
    difficultyType,
    onEdit,
    showSwipeActions = true,
    isCurrent,
    isBefore,
    isAfter,
    currentSetStatus,
    currentSetId,
    saveWorkout,
  }: EditSetRowProps) {
    const primaryActionColor = useThemeColoring("primaryAction");
    const animationProgress = useSharedValue(
      set.status === SetStatus.UNSTARTED ? 0 : 1
    );
    const { play } = useSound();

    const animatedStyle = useAnimatedStyle(() => {
      // Scale up to halfway point, then scale back down
      const scaleValue =
        animationProgress.value <= 0.5
          ? 1 + animationProgress.value * 2 * 0.05 // Scale up from 0 to 0.5 -> 1 to 1.05
          : 1 + (1 - animationProgress.value) * 2 * 0.05; // Scale down from 0.5 to 1 -> 1.05 to 1

      return {
        transform: [{ scale: scaleValue }],
      };
    });

    useEffect(() => {
      if (set.status === SetStatus.UNSTARTED) {
        animationProgress.value = 0;
      } else {
        animationProgress.value = withTiming(1);
      }
    }, [set.status]);

    const moveToFinished = (setId: string) => {
      saveWorkout((workout) =>
        workout ? SetActions(workout, setId).finish() : workout
      );
    };

    const moveToResting = (setId: string) => {
      saveWorkout((workout) =>
        workout ? SetActions(workout, setId).rest() : workout
      );
    };

    const moveToUnstarted = (setId: string) => {
      saveWorkout((workout) =>
        workout ? SetActions(workout, setId).unstart() : workout
      );
    };

    const overlayAnimatedStyle = useAnimatedStyle(() => ({
      opacity: animationProgress.value * 0.2,
      backgroundColor: primaryActionColor,
    }));

    const handleToggle = (event: GestureResponderEvent) => {
      event.stopPropagation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (!currentSetStatus && set.status === SetStatus.FINISHED) {
        moveToUnstarted(set.id);
        return;
      }

      if (isCurrent) {
        if (set.status === SetStatus.UNSTARTED) {
          moveToResting(set.id);
          play("positive_ring");
        } else {
          moveToUnstarted(set.id);
        }
        return;
      }

      // Future set scenarios
      if (isAfter) {
        if (set.status === SetStatus.UNSTARTED) {
          moveToFinished(set.id);
          play("positive_ring");
        } else {
          moveToUnstarted(set.id);
        }
      }

      if (isBefore) {
        if (
          set.status === SetStatus.FINISHED &&
          currentSetStatus === SetStatus.RESTING &&
          currentSetId
        ) {
          moveToFinished(currentSetId);
        }
        moveToUnstarted(set.id);
      }
    };

    const handleDelete = () => {
      saveWorkout((workout) =>
        workout ? SetActions(workout, set.id).delete() : workout
      );
    };

    return (
      <SetRow
        set={set}
        index={index}
        useAltBackground={index % 2 === 1}
        difficultyType={difficultyType}
        containerAnimatedStyle={animatedStyle}
        overlayAnimatedStyle={overlayAnimatedStyle}
        onEdit={onEdit}
        onToggle={handleToggle}
        showSwipeActions={showSwipeActions}
        onDelete={handleDelete}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.set.id === nextProps.set.id &&
    prevProps.index === nextProps.index &&
    prevProps.difficultyType === nextProps.difficultyType &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.showSwipeActions === nextProps.showSwipeActions &&
    prevProps.isCurrent === nextProps.isCurrent &&
    prevProps.isBefore === nextProps.isBefore &&
    prevProps.isAfter === nextProps.isAfter &&
    prevProps.currentSetStatus === nextProps.currentSetStatus &&
    prevProps.currentSetId === nextProps.currentSetId &&
    JSON.stringify(prevProps.set) === JSON.stringify(nextProps.set) &&
    prevProps.saveWorkout === nextProps.saveWorkout
);

const restIndicatorStyles = StyleSheet.create({
  container: {
    position: "absolute",
    left: "3%",
    right: "3%",
    borderRadius: 12,
    padding: "3%",
  },
  content: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    ...StyleUtils.flexColumn(4),
    flex: 1,
  },
  timeText: {
    fontSize: 24,
    fontWeight: "700",
  },
  rightSection: {
    ...StyleUtils.flexRow(12),
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    ...StyleUtils.flexRow(8),
    alignItems: "center",
  },
  action: {
    ...StyleUtils.flexRowCenterAll(),
    height: 32,
    width: 32,
    borderRadius: "50%",
    marginRight: "2%",
  },
});

type RestIndicatorProps = {
  restingSet: Set;
  onUpdateRestDuration: (setId: string, duration: number) => void;
  onSkipRest: (setId: string) => void;
};

function RestIndicator({
  restingSet,
  onUpdateRestDuration,
  onSkipRest,
}: RestIndicatorProps) {
  useRefresh({ period: 1000 });
  const insets = useSafeAreaInsets();

  const remainingMs = Math.max(
    restingSet.restDuration * 1000 + restingSet.restStartedAt! - Date.now(),
    0
  );

  const lightTextColor = useThemeColoring("lightText");
  const primaryViewBackground = useThemeColoring("primaryViewBackground");
  const actionButtonColor = tintColor(useThemeColoring("appBackground"), 0.15);

  const handleDecrease = () => {
    const newDuration = Math.max(0, restingSet.restDuration - 15);
    onUpdateRestDuration(restingSet.id, newDuration);
  };

  const handleIncrease = () => {
    const newDuration = restingSet.restDuration + 15;
    onUpdateRestDuration(restingSet.id, newDuration);
  };

  const handleSkip = () => {
    onSkipRest(restingSet.id);
  };

  const bottomPadding =
    Platform.OS === "ios" ? insets.bottom : insets.bottom + 20;

  return (
    <View
      style={[
        restIndicatorStyles.container,
        { backgroundColor: primaryViewBackground, bottom: bottomPadding },
      ]}
    >
      <View style={restIndicatorStyles.content}>
        <View style={restIndicatorStyles.leftSection}>
          <Text style={restIndicatorStyles.timeText}>
            {getDurationDisplay(Math.floor(remainingMs / 1000))}
          </Text>
          <Text sneutral light>
            Resting
          </Text>
        </View>

        <View style={restIndicatorStyles.rightSection}>
          <View style={restIndicatorStyles.actions}>
            <TouchableOpacity
              style={[
                restIndicatorStyles.action,
                { backgroundColor: actionButtonColor },
              ]}
              onPress={handleDecrease}
            >
              <Minus size={18} color={lightTextColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                restIndicatorStyles.action,
                { backgroundColor: actionButtonColor },
              ]}
              onPress={handleIncrease}
            >
              <Plus size={18} color={lightTextColor} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              restIndicatorStyles.action,
              { backgroundColor: actionButtonColor },
            ]}
            onPress={handleSkip}
          >
            <SkipForward size={18} color={lightTextColor} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const editExercisesStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: "3%",
  },
  exerciseCard: {
    borderRadius: 12,
    marginBottom: "4%",
    padding: "2%",
  },
  setsContainer: {
    marginBottom: "3%",
  },
  addSetButton: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "3%",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addSetText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: "2%",
  },
});

type ExerciseCardProps = {
  exerciseId: string;
  onMorePress: (exerciseId: string, ref: React.RefObject<any>) => void;
  onNotePress: (exerciseId: string) => void;
  onExerciseDescriptionPress: (exerciseMetaId: string) => void;
  onEditSet: (setId: string, field: EditField) => void;
};

const ExerciseCard = memo(
  function ExerciseCard({
    exerciseId,
    onMorePress,
    onNotePress,
    onExerciseDescriptionPress,
    onEditSet,
  }: ExerciseCardProps) {
    const exercise = useLiveExercise(exerciseId);
    const currentSet = useCurrentSet();
    const difficultyType = useExercisesStore(
      (state) =>
        ExerciseStoreSelectors.getExercise(exercise.metaId, state)
          .difficultyType
    );
    const exerciseName = useExercisesStore(
      (state) => ExerciseStoreSelectors.getExercise(exercise.metaId, state).name
    );

    const moreButtonRef = useRef<any>(null);

    const { saveWorkout } = useLiveWorkout();

    const primaryActionColor = useThemeColoring("primaryAction");
    const borderColor = tintColor(useThemeColoring("appBackground"), 0.1);

    const handleAddSet = useCallback(() => {
      saveWorkout((workout) =>
        ExerciseActions(workout!, exerciseId).duplicateLastSet()
      );
    }, [saveWorkout]);

    const handleEditSet = useCallback(
      (setId: string, field: EditField) => {
        onEditSet(setId, field);
      },
      [onEditSet]
    );

    const handleNotePress = useCallback(() => {
      onNotePress(exercise.id);
    }, [onNotePress, exercise.id]);

    const handleMorePress = useCallback(() => {
      onMorePress(exercise.id, moreButtonRef);
    }, [onMorePress, exercise.id]);

    const handleOpenExerciseDescription = useCallback(() => {
      onExerciseDescriptionPress(exercise.metaId);
    }, [onExerciseDescriptionPress, exercise.metaId]);

    return (
      <Animated.View
        style={editExercisesStyles.exerciseCard}
        layout={LinearTransition}
      >
        <ExerciseCardHeader
          metaId={exercise.metaId}
          name={exerciseName}
          description={getInProgressExerciseDescription(
            exercise,
            difficultyType
          )}
          note={exercise.note}
          onMorePress={handleMorePress}
          moreButtonRef={moreButtonRef}
          onNotePress={handleNotePress}
          onOpenExercise={handleOpenExerciseDescription}
        />
        <View style={editExercisesStyles.setsContainer}>
          <SetHeader difficultyType={difficultyType} />
          <LayoutAnimationConfig skipEntering>
            {exercise.sets.map((set: Set, index: number) => {
              const isCurrent = currentSet?.set.id === set.id;
              const isBefore = currentSet
                ? exercise.sets.indexOf(set) <
                  exercise.sets.indexOf(currentSet.set)
                : false;
              const isAfter = currentSet
                ? exercise.sets.indexOf(set) >
                  exercise.sets.indexOf(currentSet.set)
                : false;

              return (
                <Animated.View
                  key={set.id}
                  layout={LinearTransition}
                  exiting={LightSpeedOutLeft}
                  entering={LightSpeedInRight}
                >
                  <EditSetRow
                    set={set}
                    index={index}
                    difficultyType={difficultyType}
                    onEdit={handleEditSet}
                    showSwipeActions={true}
                    isCurrent={isCurrent}
                    isBefore={isBefore}
                    isAfter={isAfter}
                    currentSetStatus={currentSet?.set.status}
                    currentSetId={currentSet?.set.id}
                    saveWorkout={saveWorkout}
                  />
                </Animated.View>
              );
            })}
            <Animated.View key="add-set-button" layout={LinearTransition}>
              <TouchableOpacity
                style={[
                  editExercisesStyles.addSetButton,
                  { borderColor: borderColor },
                ]}
                onPress={handleAddSet}
              >
                <Plus size={16} color={primaryActionColor} />
                <Text
                  style={[
                    editExercisesStyles.addSetText,
                    { color: primaryActionColor },
                  ]}
                >
                  Add Set
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </LayoutAnimationConfig>
        </View>
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    const result =
      prevProps.exerciseId === nextProps.exerciseId &&
      prevProps.onMorePress === nextProps.onMorePress &&
      prevProps.onNotePress === nextProps.onNotePress &&
      prevProps.onEditSet === nextProps.onEditSet;

    return result;
  }
);

export function EditExercises() {
  const navigation = useNavigation();
  const { workout, saveWorkout } = useLiveWorkout();
  const { openEditSet, openEditRest, openAddNote } = useLiveWorkoutSheets();

  const [shouldRender, setShouldRender] = useState(false);

  // Popover state
  const popoverRef = useRef<PopoverRef>(null);
  const containerRef = useRef<RNView>(null);
  const containerYRef = useRef<number | undefined>(undefined);
  const reorderExercisesSheetRef = useRef<BottomSheetModal>(null);
  const popoverProgress = useSharedValue(0);
  const [popoverExerciseId, setPopoverExerciseId] = useState<string | null>(
    null
  );

  const currentSet = useCurrentSet();

  const dangerActionColor = useThemeColoring("dangerAction");
  const neutralTextColor = useThemeColoring("primaryText");

  useEffect(() => {
    setTimeout(() => {
      setShouldRender(true);
    }, 100);
  }, []);

  const isResting = currentSet?.set.status === SetStatus.RESTING;

  const handleEditSet = useCallback(
    (setId: string, field: EditField) => {
      // We need to find the exercise that contains this set
      const exercise = workout?.exercises.find((ex) =>
        ex.sets.some((set) => set.id === setId)
      );
      if (exercise) {
        openEditSet(exercise.id, setId, field);
      }
    },
    [openEditSet, workout]
  );

  const handleMorePress = useCallback(
    (exerciseId: string, ref: React.RefObject<any>) => {
      setPopoverExerciseId(exerciseId);
      if (ref.current && containerYRef.current !== undefined) {
        ref.current.measure(
          (x: any, y: any, width: any, height: any, pageX: any, pageY: any) => {
            popoverRef.current?.open(
              pageX + width + 5,
              pageY + 20 - (containerYRef.current as number)
            );
          }
        );
      }
    },
    []
  );

  const handleRemoveExercise = () => {
    if (popoverExerciseId) {
      saveWorkout((workout) =>
        ExerciseActions(workout!, popoverExerciseId).delete()
      );
      popoverRef.current?.close();
      setPopoverExerciseId(null);
    }
  };

  const handleViewExercise = () => {
    popoverRef.current?.close();
    if (popoverExerciseId) {
      const exercise = WorkoutQuery.getExercise(workout!, popoverExerciseId);
      // @ts-ignore
      navigation.navigate("exerciseInsightSheet", {
        id: exercise.metaId,
      });
    }
    setPopoverExerciseId(null);
  };

  const handleOpenReorderExercises = () => {
    popoverRef.current?.close();
    reorderExercisesSheetRef.current?.present();
  };

  const handleOpenEditRest = () => {
    popoverRef.current?.close();
    if (popoverExerciseId) {
      openEditRest(popoverExerciseId);
    }
  };

  const handleOpenAddNoteFromPopover = () => {
    popoverRef.current?.close();
    if (popoverExerciseId) {
      openAddNote(popoverExerciseId);
    }
  };

  const handleLayout = useCallback(() => {
    containerRef.current?.measure(
      (x: any, y: any, width: any, height: any, pageX: any, pageY: any) => {
        containerYRef.current = pageY;
      }
    );
  }, []);

  const handleUpdateRestDuration = (setId: string, duration: number) => {
    saveWorkout((workout) => {
      if (workout) {
        return SetActions(workout!, setId).update({ restDuration: duration });
      }
    });
  };

  const handleSkipRest = (setId: string) => {
    saveWorkout((workout) => SetActions(workout!, setId).finish());
  };

  const handleReorder = (
    exercises: { exerciseId: string; metaId: string }[]
  ) => {
    saveWorkout((workout) => {
      if (workout) {
        return WorkoutActions(workout).reorderExercises(
          exercises.map((ex) => ex.exerciseId)
        );
      }
    });
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <View
      ref={containerRef}
      style={editExercisesStyles.container}
      onLayout={handleLayout}
    >
      <ScrollView
        style={editExercisesStyles.scrollContainer}
        contentContainerStyle={{ paddingBottom: "30%" }}
        showsVerticalScrollIndicator={false}
      >
        {workout?.exercises.map((exercise: Exercise) => (
          <ExerciseCard
            key={exercise.id}
            exerciseId={exercise.id}
            onMorePress={handleMorePress}
            onNotePress={openAddNote}
            onEditSet={handleEditSet}
            onExerciseDescriptionPress={(metaId) => {
              // @ts-ignore
              navigation.navigate("exerciseInsightSheet", {
                id: metaId,
              });
            }}
          />
        ))}
      </ScrollView>
      {isResting && currentSet?.set && (
        <Animated.View
          key="rest-indicator"
          entering={FadeInDown.springify().damping(15).stiffness(150)}
          exiting={FadeOutDown.springify().damping(15).stiffness(150)}
        >
          <RestIndicator
            restingSet={currentSet?.set}
            onUpdateRestDuration={handleUpdateRestDuration}
            onSkipRest={handleSkipRest}
          />
        </Animated.View>
      )}
      <ReorderExercisesSheet
        ref={reorderExercisesSheetRef}
        exercises={
          workout?.exercises.map((ex) => ({
            exerciseId: ex.id,
            metaId: ex.metaId,
          })) || []
        }
        onReorder={handleReorder}
      />
      <Popover ref={popoverRef} progress={popoverProgress}>
        <PopoverItem
          label="View Exercise"
          icon={<Info size={20} color={neutralTextColor} />}
          onClick={handleViewExercise}
        />
        <PopoverItem
          label="Edit Note"
          icon={<StickyNote size={20} color={neutralTextColor} />}
          onClick={handleOpenAddNoteFromPopover}
        />
        <PopoverItem
          label="Reorder Exercises"
          icon={<Shuffle size={20} color={neutralTextColor} />}
          onClick={handleOpenReorderExercises}
        />
        <PopoverItem
          label="Edit Rest"
          icon={<Clock size={20} color={neutralTextColor} />}
          onClick={handleOpenEditRest}
        />
        <PopoverItem
          label={
            <Text style={{ color: dangerActionColor }}>Remove Exercise</Text>
          }
          icon={<Trash2 size={20} color={dangerActionColor} />}
          onClick={handleRemoveExercise}
        />
      </Popover>
    </View>
  );
}
