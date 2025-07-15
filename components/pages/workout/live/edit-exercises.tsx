import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  useMemo,
} from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
  Keyboard,
  Platform,
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
import { HeaderPage } from "@/components/util/header-page";
import { Exercise, DifficultyType, SetStatus, Set, Workout } from "@/interface";
import { StyleUtils } from "@/util/styles";
import { tintColor } from "@/util/color";
import { useNavigation } from "@react-navigation/native";
import {
  Plus,
  ChevronLeft,
  MoreVertical,
  Trash2,
  Shuffle,
  Clock,
  Info,
  Minus,
  SkipForward,
  StickyNote,
} from "lucide-react-native";
import { getExerciseDemonstration } from "@/api/exercise";
import { NAME_TO_EXERCISE_META } from "@/api/exercise";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import { getTimePeriodDisplay } from "@/util/date";
import { Popover, PopoverItem, PopoverRef } from "@/components/util/popover";
import { ReorderExercisesSheet } from "@/components/sheets/reorder-exercises";
import { EditRestDuration } from "@/components/sheets/edit-rest-duration";
import { EditSetSheet } from "@/components/sheets/edit-set";
import { AddNoteSheet } from "@/components/sheets/add-note";
import BottomSheet from "@gorhom/bottom-sheet";
import { updateExerciseRest } from "@/util/workout/update";
import {
  updateSet,
  removeSet,
  duplicateLastSet,
  updateExercise,
  removeExercise,
} from "@/context/WorkoutContext";
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
import {
  useLiveExercise,
  useCurrentSet,
  useLiveWorkout,
  useLiveSet,
} from "./context";
import {
  ExerciseActions,
  SetActions,
  WorkoutActions,
  WorkoutQuery,
} from "@/api/model/workout";

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
  name: string;
  description: string;
  note?: string;
  onMorePress: (event: any, ref: React.RefObject<any>) => void;
  moreButtonRef: React.RefObject<any>;
  onNotePress: () => void;
};

function ExerciseCardHeader({
  name,
  description,
  note,
  onMorePress,
  moreButtonRef,
  onNotePress,
}: ExerciseCardHeaderProps) {
  const demonstration = getExerciseDemonstration(name);
  const primaryActionColor = useThemeColoring("primaryAction");

  return (
    <View style={exerciseCardHeaderStyles.container}>
      <View style={exerciseCardHeaderStyles.topHeader}>
        {demonstration && (
          <Image
            source={demonstration}
            style={exerciseCardHeaderStyles.image}
            resizeMode="contain"
          />
        )}
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
  onEditSet: (setId: string, field: EditField) => void;
};

const ExerciseCard = memo(
  function ExerciseCard({
    exerciseId,
    onMorePress,
    onNotePress,
    onEditSet,
  }: ExerciseCardProps) {
    const exercise = useLiveExercise(exerciseId);
    const currentSet = useCurrentSet();

    const moreButtonRef = useRef<any>(null);

    const { saveWorkout } = useLiveWorkout();

    const primaryActionColor = useThemeColoring("primaryAction");
    const borderColor = tintColor(useThemeColoring("appBackground"), 0.1);
    const exerciseMeta = NAME_TO_EXERCISE_META.get(exercise.name);
    const difficultyType =
      exerciseMeta?.difficultyType || DifficultyType.WEIGHT;

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

    return (
      <Animated.View
        style={editExercisesStyles.exerciseCard}
        layout={LinearTransition}
      >
        <ExerciseCardHeader
          name={exercise.name}
          description={getHistoricalExerciseDescription(exercise)}
          note={exercise.note}
          onMorePress={handleMorePress}
          moreButtonRef={moreButtonRef}
          onNotePress={handleNotePress}
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

type LiveElapsedProps = {
  workout?: Workout;
};

function LiveElapsed({ workout }: LiveElapsedProps) {
  useRefresh({ period: 1000 });
  return (
    <Text light>
      {workout?.startedAt
        ? getTimePeriodDisplay(Date.now() - workout.startedAt)
        : ""}
    </Text>
  );
}

export function EditExercises() {
  const navigation = useNavigation();
  const { workout, saveWorkout } = useLiveWorkout();

  // Popover state
  const popoverRef = useRef<PopoverRef>(null);
  const popoverProgress = useSharedValue(0);
  const [popoverExerciseId, setPopoverExerciseId] = useState<string | null>(
    null
  );
  const [isArtificallyLoading, setIsArtificallyLoading] = useState(true);
  const sheetsRef = useRef<EditExercisesSheetsRef>(null);

  // Edit set sheet state
  const [showEditSetSheet, setShowEditSetSheet] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string | undefined>();
  const [selectedField, setSelectedField] = useState<EditField | undefined>();

  const currentSet = useCurrentSet();

  // For now, we'll remove the activity-dependent features
  const isResting = currentSet?.set.status === SetStatus.RESTING;

  useEffect(() => {
    setTimeout(() => {
      setIsArtificallyLoading(false);
    }, 200);
  }, []);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleEditSet = useCallback((setId: string, field: EditField) => {
    setSelectedSetId(setId);
    setSelectedField(field);
    setShowEditSetSheet(true);
  }, []);

  const handleHideEditSetSheet = () => {
    setShowEditSetSheet(false);
    setSelectedSetId(undefined);
    setSelectedField(undefined);
  };

  const handleUpdateSetFromSheet = (setId: string, update: Partial<Set>) => {
    saveWorkout((workout) => SetActions(workout!, setId).update(update));
  };

  // Popover trigger handler
  const handleMorePress = useCallback(
    (exerciseId: string, ref: React.RefObject<any>) => {
      setPopoverExerciseId(exerciseId);
      if (ref.current) {
        ref.current.measure(
          (x: any, y: any, width: any, height: any, pageX: any, pageY: any) => {
            popoverRef.current?.open(pageX + width + 5, pageY + 20);
          }
        );
      }
    },
    []
  );

  const handleRemoveExercise = () => {
    saveWorkout((workout) =>
      ExerciseActions(workout!, popoverExerciseId!).delete()
    );
    popoverRef.current?.close();
    setPopoverExerciseId(null);
  };

  // Sheet handlers
  const handleOpenReorderExercises = () => {
    popoverRef.current?.close();
    setTimeout(() => {
      sheetsRef.current?.openReorderExercises();
    }, 200);
    setPopoverExerciseId(null);
  };

  const handleOpenEditRest = () => {
    popoverRef.current?.close();
    setTimeout(() => {
      sheetsRef.current?.openEditRest();
    }, 200);
  };

  const handleOpenAddNote = useCallback((exerciseId: string) => {
    setPopoverExerciseId(exerciseId);
    setTimeout(() => {
      sheetsRef.current?.openAddNote();
    }, 200);
  }, []);

  const handleOpenAddNoteFromPopover = () => {
    popoverRef.current?.close();
    setTimeout(() => {
      sheetsRef.current?.openAddNote();
    }, 200);
  };

  const handleUpdateNote = useCallback(
    (note: string) => {
      saveWorkout((workout) =>
        ExerciseActions(workout!, popoverExerciseId!).update({
          note: note.trim() === "" ? undefined : note,
        })
      );
    },
    [saveWorkout, popoverExerciseId]
  );

  const handleViewExercise = () => {
    popoverRef.current?.close();
    setPopoverExerciseId(null);

    if (popoverExerciseId) {
      // @ts-ignore
      navigation.navigate("exerciseInsightSheet", {
        name: WorkoutQuery.getExercise(workout!, popoverExerciseId).name,
      });
    }
  };

  // For rest duration, use the currently selected exercise (from popoverExerciseId)
  const currentExercise =
    workout?.exercises.find((ex: Exercise) => ex.id === popoverExerciseId) ||
    workout?.exercises[0];
  const restDuration = currentExercise?.restDuration || 60;

  const handleReorder = (newExercises: Exercise[]) => {
    saveWorkout((workout) =>
      WorkoutActions(workout!).reorderExercises(
        newExercises.map(({ id }) => id)
      )
    );
  };

  const handleUpdateRest = (duration: number) => {
    saveWorkout((workout) =>
      ExerciseActions(workout!, popoverExerciseId!).updateRest(duration)
    );
  };

  const handleAddExercise = () => {
    navigation.navigate("addExercises" as never);
  };

  const handleUpdateRestDuration = (setId: string, duration: number) => {
    if (workout) {
      const updatedWorkout = updateSet(
        setId,
        { restDuration: duration },
        workout
      );
      saveWorkout(updatedWorkout);
    }
  };

  const handleSkipRest = (setId: string) => {
    saveWorkout((workout) => SetActions(workout!, setId).finish());
  };

  return (
    <View style={editExercisesStyles.container}>
      <HeaderPage
        title={workout!.name}
        subtitle={<LiveElapsed workout={workout} />}
        leftAction={
          <TouchableOpacity onPress={handleClose}>
            <ChevronLeft color={useThemeColoring("primaryAction")} />
          </TouchableOpacity>
        }
        rightAction={
          <TouchableOpacity onPress={handleAddExercise}>
            <Plus size={20} color={useThemeColoring("primaryAction")} />
          </TouchableOpacity>
        }
      >
        <ScrollView
          style={editExercisesStyles.scrollContainer}
          contentContainerStyle={{ paddingBottom: "30%" }}
          showsVerticalScrollIndicator={false}
        >
          {workout!.exercises.map((exercise: Exercise) => (
            <ExerciseCard
              key={exercise.id}
              exerciseId={exercise.id}
              onMorePress={handleMorePress}
              onNotePress={handleOpenAddNote}
              onEditSet={handleEditSet}
            />
          ))}
        </ScrollView>
      </HeaderPage>
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
      {!isArtificallyLoading && (
        <EditExercisesSheets
          clearExerciseFocus={() => setPopoverExerciseId(null)}
          ref={sheetsRef}
          exercises={workout?.exercises || []}
          restDuration={restDuration}
          onReorder={handleReorder}
          onUpdateRest={handleUpdateRest}
          showEditSetSheet={showEditSetSheet}
          selectedSetId={selectedSetId}
          selectedField={selectedField}
          onHideEditSetSheet={handleHideEditSetSheet}
          onUpdateSetFromSheet={handleUpdateSetFromSheet}
          currentExerciseNote={currentExercise?.note}
          onUpdateNote={handleUpdateNote}
        />
      )}
      <Popover ref={popoverRef} progress={popoverProgress}>
        <PopoverItem
          label="View Exercise"
          icon={<Info size={20} color={useThemeColoring("primaryText")} />}
          onClick={handleViewExercise}
        />
        <PopoverItem
          label="Edit Note"
          icon={
            <StickyNote size={20} color={useThemeColoring("primaryText")} />
          }
          onClick={handleOpenAddNoteFromPopover}
        />
        <PopoverItem
          label="Reorder Exercises"
          icon={<Shuffle size={20} color={useThemeColoring("primaryText")} />}
          onClick={handleOpenReorderExercises}
        />
        <PopoverItem
          label="Edit Rest"
          icon={<Clock size={20} color={useThemeColoring("primaryText")} />}
          onClick={handleOpenEditRest}
        />
        <PopoverItem
          label={
            <Text style={{ color: useThemeColoring("dangerAction") }}>
              Remove Exercise
            </Text>
          }
          icon={<Trash2 size={20} color={useThemeColoring("dangerAction")} />}
          onClick={handleRemoveExercise}
        />
      </Popover>
    </View>
  );
}

type EditExercisesSheetsProps = {
  exercises: Exercise[];
  restDuration: number;
  onReorder: (newExercises: Exercise[]) => void;
  onUpdateRest: (duration: number) => void;
  clearExerciseFocus: () => void;
  showEditSetSheet: boolean;
  selectedSetId?: string;
  selectedField?: EditField;
  onHideEditSetSheet: () => void;
  onUpdateSetFromSheet: (setId: string, update: Partial<Set>) => void;
  currentExerciseNote?: string;
  onUpdateNote: (note: string) => void;
};

type EditExercisesSheetsRef = {
  openReorderExercises: () => void;
  openEditRest: () => void;
  openAddNote: () => void;
};

const EditExercisesSheets = React.forwardRef<
  EditExercisesSheetsRef,
  EditExercisesSheetsProps
>(
  (
    {
      exercises,
      restDuration,
      onReorder,
      onUpdateRest,
      clearExerciseFocus,
      showEditSetSheet,
      selectedSetId,
      selectedField,
      onHideEditSetSheet,
      onUpdateSetFromSheet,
      currentExerciseNote,
      onUpdateNote,
    },
    ref
  ) => {
    const [showReorder, setShowReorder] = useState(false);
    const [showEditRest, setShowEditRest] = useState(false);
    const [showAddNoteSheet, setShowAddNoteSheet] = useState(false);
    const reorderSheetRef = useRef<BottomSheet>(null);
    const editRestSheetRef = useRef<BottomSheet>(null);
    const editSetSheetRef = useRef<BottomSheet>(null);
    const addNoteSheetRef = useRef<BottomSheet>(null);

    const openReorderExercises = () => setShowReorder(true);
    const openEditRest = () => setShowEditRest(true);
    const openAddNote = () => setShowAddNoteSheet(true);

    React.useImperativeHandle(ref, () => ({
      openReorderExercises,
      openEditRest,
      openAddNote,
    }));

    const onHideEditRest = () => {
      setShowEditRest(false);
      clearExerciseFocus();
    };

    const onHideAddNote = () => {
      Keyboard.dismiss();
      setShowAddNoteSheet(false);
      clearExerciseFocus();
    };

    // Find the exercise that contains the selected set
    const selectedExercise = exercises.find((ex) =>
      ex.sets.some((set) => set.id === selectedSetId)
    );

    return (
      <>
        <ReorderExercisesSheet
          ref={reorderSheetRef}
          show={showReorder}
          hide={() => reorderSheetRef.current?.close()}
          onHide={() => setShowReorder(false)}
          exercises={exercises}
          onReorder={onReorder}
        />
        <EditRestDuration
          ref={editRestSheetRef}
          show={showEditRest}
          hide={() => editRestSheetRef.current?.close()}
          onHide={onHideEditRest}
          duration={restDuration}
          onUpdateDuration={onUpdateRest}
        />
        {selectedExercise && (
          <EditSetSheet
            ref={editSetSheetRef}
            show={showEditSetSheet}
            hide={() => editSetSheetRef.current?.close()}
            onHide={onHideEditSetSheet}
            exercise={selectedExercise}
            setId={selectedSetId}
            focusField={selectedField}
            onUpdate={onUpdateSetFromSheet}
          />
        )}
        <AddNoteSheet
          ref={addNoteSheetRef}
          show={showAddNoteSheet}
          hide={() => addNoteSheetRef.current?.close()}
          onHide={onHideAddNote}
          note={currentExerciseNote ?? ""}
          onUpdate={onUpdateNote}
        />
      </>
    );
  }
);
