import { View, Text, useThemeColoring } from "@/components/Themed";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  GestureResponderEvent,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ChevronLeft,
  Plus,
  Check,
  MoreHorizontal,
  StickyNote,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { HeaderPage } from "@/components/util/header-page";
import { useCompletedWorkout } from "./context";
import {
  duplicateLastSet,
  removeSet,
  updateSet,
  updateExercise,
} from "@/context/WorkoutContext";
import {
  Set,
  DifficultyType,
  SetStatus,
  WeightDifficulty,
  BodyWeightDifficulty,
  TimeDifficulty,
  Exercise,
} from "@/interface";
import { getDifficultyType } from "@/api/exercise";
import { StyleUtils } from "@/util/styles";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  interpolateColor,
  LinearTransition,
  LayoutAnimationConfig,
  LightSpeedInRight,
  LightSpeedOutLeft,
} from "react-native-reanimated";
import { useEffect, useRef, useCallback, useState } from "react";
import { getDurationDisplay } from "@/util/date";
import { tintColor } from "@/util/color";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import { Popover, PopoverItem, PopoverRef } from "@/components/util/popover";
import { AddNoteSheet } from "@/components/sheets/add-note";
import { EditSetSheet } from "@/components/sheets/edit-set";
import BottomSheet from "@gorhom/bottom-sheet";
import { useSound } from "@/components/sounds";

export type EditField = "weight" | "reps" | "time";

const setStatusInputStyles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
  check: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: 12,
    height: 25,
    width: 30,
  },
});

type SetStatusInputProps = {
  isActive: boolean;
  onToggle: (event: GestureResponderEvent) => void;
};

function SetStatusInput({ isActive, onToggle }: SetStatusInputProps) {
  const setColor = useSharedValue(isActive ? 1 : 0);
  const inactiveColor = useThemeColoring("lightText");
  const activeColor = useThemeColoring("primaryAction");

  useEffect(() => {
    setColor.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        setColor.value,
        [0, 1],
        [inactiveColor, activeColor]
      ),
    }),
    []
  );

  return (
    <TouchableOpacity onPress={onToggle} style={setStatusInputStyles.container}>
      <Animated.View style={[setStatusInputStyles.check, animatedStyle]}>
        <Check
          color={useThemeColoring("primaryText")}
          strokeWidth={3}
          size={16}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

function getSubtitle(exercise: any): string {
  if (!exercise || !exercise.sets || exercise.sets.length === 0) {
    return "0 sets";
  }

  const setCount = exercise.sets.length;
  const difficultyType = getDifficultyType(exercise.name);

  switch (difficultyType) {
    case DifficultyType.WEIGHT:
    case DifficultyType.WEIGHTED_BODYWEIGHT: {
      let totalWeight = 0;
      let totalReps = 0;

      exercise.sets.forEach((set: Set) => {
        const weightDiff = set.difficulty as WeightDifficulty;
        totalWeight += weightDiff.weight * weightDiff.reps;
        totalReps += weightDiff.reps;
      });

      return `${setCount} sets • ${Math.round(
        totalWeight
      )} lbs • ${totalReps} reps`;
    }
    case DifficultyType.BODYWEIGHT:
    case DifficultyType.ASSISTED_BODYWEIGHT: {
      let totalReps = 0;
      exercise.sets.forEach((set: Set) => {
        const bodyweightDiff = set.difficulty as BodyWeightDifficulty;
        totalReps += bodyweightDiff.reps;
      });
      return `${setCount} sets • ${totalReps} reps`;
    }
    case DifficultyType.TIME: {
      let totalDuration = 0;
      exercise.sets.forEach((set: Set) => {
        const timeDiff = set.difficulty as TimeDifficulty;
        totalDuration += timeDiff.duration;
      });
      return `${setCount} sets • ${getDurationDisplay(totalDuration)}`;
    }
    default:
      return `${setCount} sets`;
  }
}

function getSetRowValues(
  set: Set,
  index: number,
  difficultyType: DifficultyType
) {
  if (
    difficultyType === DifficultyType.WEIGHT ||
    difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT
  ) {
    const diff = set.difficulty as WeightDifficulty;
    return [
      index + 1,
      diff.weight,
      diff.reps,
      set.status !== SetStatus.UNSTARTED,
    ];
  } else if (
    difficultyType === DifficultyType.BODYWEIGHT ||
    difficultyType === DifficultyType.ASSISTED_BODYWEIGHT
  ) {
    const diff = set.difficulty as BodyWeightDifficulty;
    return [index + 1, diff.reps, set.status !== SetStatus.UNSTARTED];
  } else if (difficultyType === DifficultyType.TIME) {
    const diff = set.difficulty as TimeDifficulty;
    return [
      index + 1,
      getDurationDisplay(diff.duration),
      set.status !== SetStatus.UNSTARTED,
    ];
  }
  return [index + 1, set.status !== SetStatus.UNSTARTED];
}

const setRowStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    height: 48,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: "1.5%",
    paddingHorizontal: "2%",
  },
  setNumber: {
    ...StyleUtils.flexRowCenterAll(),
    flex: 1,
  },
  valueColumn: {
    ...StyleUtils.flexRowCenterAll(),
    paddingVertical: "2%",
    flex: 2,
  },
  checkmarkColumn: {
    ...StyleUtils.flexRowCenterAll(),
    flex: 1,
  },
});

type SetRowProps = {
  set: Set;
  index: number;
  difficultyType: DifficultyType;
  onUpdateSet: (setId: string, update: Partial<Set>) => void;
  onDelete: (setId: string) => void;
  onEdit?: (setId: string, field: EditField) => void;
};

function SetRow({
  set,
  index,
  difficultyType,
  onUpdateSet,
  onDelete,
  onEdit,
}: SetRowProps) {
  const appBackgroundColor = useThemeColoring("appBackground");
  const rowTint = tintColor(useThemeColoring("appBackground"), 0.05);
  const values = getSetRowValues(set, index, difficultyType);
  const isAlt = index % 2 === 1;
  const rowBg = isAlt ? rowTint : appBackgroundColor;
  const setAnimationSize = useSharedValue(1);
  const { play } = useSound();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: setAnimationSize.value }],
  }));

  const handleToggle = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (set.status === SetStatus.FINISHED) {
      onUpdateSet(set.id, {
        status: SetStatus.UNSTARTED,
        restStartedAt: undefined,
        restEndedAt: undefined,
      });
    } else if (set.status === SetStatus.RESTING) {
      onUpdateSet(set.id, {
        status: SetStatus.FINISHED,
        restEndedAt: Date.now(),
      });
      setAnimationSize.value = withSequence(
        withTiming(1.05, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      play("positive_ring");
    } else {
      onUpdateSet(set.id, {
        status: SetStatus.FINISHED,
      });
      setAnimationSize.value = withSequence(
        withTiming(1.05, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      play("positive_ring");
    }
  };

  const handleDelete = () => {
    onDelete(set.id);
  };

  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={(_, drag) => (
        <SwipeableDelete drag={drag} onDelete={handleDelete} dimension={48} />
      )}
    >
      <Animated.View
        style={[
          setRowStyles.container,
          { backgroundColor: rowBg },
          animatedStyle,
        ]}
      >
        <View style={setRowStyles.setNumber}>
          <Text>{values[0]}</Text>
        </View>
        {difficultyType === DifficultyType.WEIGHT ||
        difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT ? (
          <TouchableOpacity
            style={setRowStyles.valueColumn}
            onPress={() => onEdit?.(set.id, "weight")}
          >
            <Text>{values[1]}</Text>
          </TouchableOpacity>
        ) : null}
        {difficultyType === DifficultyType.WEIGHT ||
        difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT ? (
          <TouchableOpacity
            style={setRowStyles.valueColumn}
            onPress={() => onEdit?.(set.id, "reps")}
          >
            <Text>{values[2]}</Text>
          </TouchableOpacity>
        ) : null}
        {(difficultyType === DifficultyType.BODYWEIGHT ||
          difficultyType === DifficultyType.ASSISTED_BODYWEIGHT) && (
          <TouchableOpacity
            style={setRowStyles.valueColumn}
            onPress={() => onEdit?.(set.id, "reps")}
          >
            <Text>{values[1]}</Text>
          </TouchableOpacity>
        )}
        {difficultyType === DifficultyType.TIME && (
          <TouchableOpacity
            style={setRowStyles.valueColumn}
            onPress={() => onEdit?.(set.id, "time")}
          >
            <Text>{values[1]}</Text>
          </TouchableOpacity>
        )}
        <View style={setRowStyles.checkmarkColumn}>
          <SetStatusInput
            isActive={values[values.length - 1] as boolean}
            onToggle={handleToggle}
          />
        </View>
      </Animated.View>
    </Swipeable>
  );
}

const setHeaderStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    marginBottom: "2%",
    marginTop: "2%",
    paddingHorizontal: "2%",
  },
  column: {
    ...StyleUtils.flexRowCenterAll(),
    flex: 1,
  },
  wideColumn: {
    ...StyleUtils.flexRowCenterAll(),
    flex: 2,
  },
});

type SetHeaderProps = {
  difficultyType: DifficultyType;
};

function SetHeader({ difficultyType }: SetHeaderProps) {
  return (
    <View style={setHeaderStyles.container}>
      <View style={setHeaderStyles.column}>
        <Text light>SET</Text>
      </View>
      {(difficultyType === DifficultyType.WEIGHT ||
        difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) && (
        <View style={setHeaderStyles.wideColumn}>
          <Text light>LBS</Text>
        </View>
      )}
      {(difficultyType === DifficultyType.WEIGHT ||
        difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) && (
        <View style={setHeaderStyles.wideColumn}>
          <Text light>REPS</Text>
        </View>
      )}
      {(difficultyType === DifficultyType.BODYWEIGHT ||
        difficultyType === DifficultyType.ASSISTED_BODYWEIGHT) && (
        <View style={setHeaderStyles.wideColumn}>
          <Text light>REPS</Text>
        </View>
      )}
      {difficultyType === DifficultyType.TIME && (
        <View style={setHeaderStyles.wideColumn}>
          <Text light>TIME</Text>
        </View>
      )}
      <View style={setHeaderStyles.column}>
        <Check
          color={useThemeColoring("lightText")}
          strokeWidth={2}
          size={20}
        />
      </View>
    </View>
  );
}

// SetNote styles
const setNoteStyles = StyleSheet.create({
  container: {
    paddingHorizontal: "3%",
    paddingVertical: "2%",
    marginBottom: "2%",
  },
});

type SetNoteProps = {
  note?: string;
  onPress?: () => void;
};

function SetNote({ note, onPress }: SetNoteProps) {
  return (
    <TouchableOpacity onPress={onPress} style={setNoteStyles.container}>
      <Text light>{note ? `Note: ${note}` : "Add note here..."}</Text>
    </TouchableOpacity>
  );
}

const setsEditorStyles = StyleSheet.create({
  container: {
    paddingHorizontal: "3%",
  },
  scrollContentContainer: {
    paddingBottom: "30%",
  },
  addSetButton: {
    ...StyleUtils.flexRowCenterAll(),
    paddingVertical: "4%",
    marginTop: "2%",
  },
});

export function SetsEditor() {
  const navigation = useNavigation();
  const route = useRoute();
  const { workout, onSave } = useCompletedWorkout();
  const popoverRef = useRef<PopoverRef>(null);
  const moreButtonRef = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollContentHeightRef = useRef<number | undefined>(undefined);
  const addNoteSheetRef = useRef<BottomSheet>(null);
  const editSetSheetRef = useRef<BottomSheet>(null);
  const popoverProgress = useSharedValue(0);
  const [showAddNoteSheet, setShowAddNoteSheet] = useState(false);
  const [showEditSetSheet, setShowEditSetSheet] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string | undefined>();
  const [selectedField, setSelectedField] = useState<EditField | undefined>();

  const exerciseId = (route.params as any)?.exerciseId as string;
  const exercise = workout?.exercises.find(
    ({ id }) => exerciseId === id
  ) as Exercise;
  const difficultyType = exercise
    ? getDifficultyType(exercise.name)
    : DifficultyType.BODYWEIGHT;

  const handleAddSet = () => {
    if (workout && exerciseId) {
      onSave(duplicateLastSet(exerciseId, workout));
    }
  };

  const handleRemoveSet = (setId: string) => {
    if (workout && exercise?.sets.length === 1) {
      navigation.goBack();
    }
    if (workout) {
      onSave(removeSet(setId, workout));
    }
  };

  const handleUpdateSet = (setId: string, update: Partial<Set>) => {
    if (workout) {
      onSave(updateSet(setId, update, workout));
    }
  };

  const handleMorePress = () => {
    if (moreButtonRef.current) {
      moreButtonRef.current.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number
        ) => {
          popoverRef.current?.open(pageX + width + 5, pageY + 20);
        }
      );
    }
  };

  const handleAddSetFromPopover = () => {
    popoverRef.current?.close();
    handleAddSet();
  };

  const handleEditNote = () => {
    popoverRef.current?.close();
    setShowAddNoteSheet(true);
  };

  const handleUpdateNote = useCallback(
    (note: string) => {
      if (workout && exerciseId) {
        const updatedWorkout = updateExercise(
          exerciseId,
          { note: note.trim() === "" ? undefined : note },
          workout
        );
        onSave(updatedWorkout);
      }
    },
    [workout, exerciseId, onSave]
  );

  const handleHideAddNoteSheet = useCallback(() => {
    Keyboard.dismiss();
    setShowAddNoteSheet(false);
  }, []);

  const handleEditSet = useCallback((setId: string, field: EditField) => {
    setSelectedSetId(setId);
    setSelectedField(field);
    setShowEditSetSheet(true);
  }, []);

  const handleHideEditSetSheet = useCallback(() => {
    setShowEditSetSheet(false);
    setSelectedSetId(undefined);
    setSelectedField(undefined);
    Keyboard.dismiss();
  }, []);

  const handleUpdateSetFromSheet = useCallback(
    (setId: string, update: Partial<Set>) => {
      if (workout) {
        const updatedWorkout = updateSet(setId, update, workout);
        onSave(updatedWorkout);
      }
    },
    [workout, onSave]
  );

  // todo: don't auto scroll down if the content height decreases
  const handleScrollContentChange = useCallback(
    (width: number, height: number) => {
      if (scrollContentHeightRef.current != undefined) {
        if (scrollContentHeightRef.current <= height) {
          scrollContentHeightRef.current = height;
          scrollRef.current?.scrollToEnd({ animated: true });
        }
      } else {
        scrollContentHeightRef.current = height;
      }
    },
    []
  );

  return (
    <View style={{ height: "100%" }}>
      <HeaderPage
        title={exercise?.name ?? "Exercise"}
        subtitle={getSubtitle(exercise)}
        leftAction={
          <TouchableOpacity onPress={navigation.goBack}>
            <ChevronLeft color={useThemeColoring("primaryAction")} />
          </TouchableOpacity>
        }
        rightAction={
          <TouchableOpacity ref={moreButtonRef} onPress={handleMorePress}>
            <MoreHorizontal color={useThemeColoring("primaryAction")} />
          </TouchableOpacity>
        }
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          style={setsEditorStyles.container}
          contentContainerStyle={setsEditorStyles.scrollContentContainer}
          onContentSizeChange={handleScrollContentChange}
        >
          <SetNote note={exercise?.note} onPress={handleEditNote} />
          <SetHeader difficultyType={difficultyType} />
          <LayoutAnimationConfig skipEntering>
            {exercise?.sets?.map((set, idx) => (
              <Animated.View
                key={set.id}
                layout={LinearTransition}
                exiting={LightSpeedOutLeft}
                entering={LightSpeedInRight}
              >
                <SetRow
                  set={set}
                  index={idx}
                  difficultyType={difficultyType}
                  onUpdateSet={handleUpdateSet}
                  onDelete={handleRemoveSet}
                  onEdit={handleEditSet}
                />
              </Animated.View>
            ))}
            <Animated.View key="add-set-button" layout={LinearTransition}>
              <TouchableOpacity
                onPress={handleAddSet}
                style={setsEditorStyles.addSetButton}
              >
                <Text style={{ color: useThemeColoring("primaryAction") }}>
                  Add Set
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </LayoutAnimationConfig>
        </ScrollView>
      </HeaderPage>

      <Popover ref={popoverRef} progress={popoverProgress}>
        <PopoverItem
          label="Add Set"
          icon={<Plus size={20} color={useThemeColoring("primaryText")} />}
          onClick={handleAddSetFromPopover}
        />
        <PopoverItem
          label="Edit Note"
          icon={
            <StickyNote size={20} color={useThemeColoring("primaryText")} />
          }
          onClick={handleEditNote}
        />
      </Popover>

      <AddNoteSheet
        ref={addNoteSheetRef}
        show={showAddNoteSheet}
        hide={() => addNoteSheetRef.current?.close()}
        onHide={handleHideAddNoteSheet}
        note={exercise?.note ?? ""}
        onUpdate={handleUpdateNote}
      />

      <EditSetSheet
        ref={editSetSheetRef}
        show={showEditSetSheet}
        hide={() => editSetSheetRef.current?.close()}
        onHide={handleHideEditSetSheet}
        exercise={exercise}
        setId={selectedSetId}
        focusField={selectedField}
        onUpdate={handleUpdateSetFromSheet}
      />
    </View>
  );
}
