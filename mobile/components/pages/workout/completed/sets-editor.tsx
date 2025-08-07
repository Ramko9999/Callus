import { View, Text, useThemeColoring } from "@/components/Themed";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  GestureResponderEvent,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Plus, StickyNote } from "lucide-react-native";
import { BackButton, MoreButton } from "@/components/pages/common";
import { HeaderPage } from "@/components/util/header-page";
import { useCompletedWorkout } from "./context";
import { ExerciseActions, SetActions } from "@/api/model/workout";
import {
  Set,
  DifficultyType,
  Exercise,
} from "@/interface";
import { StyleUtils } from "@/util/styles";
import Animated, {
  useSharedValue,
  LinearTransition,
  LayoutAnimationConfig,
  LightSpeedInRight,
  LightSpeedOutLeft,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useRef, useCallback, useState } from "react";
import { getDurationDisplay } from "@/util/date";
import { Popover, PopoverItem, PopoverRef } from "@/components/util/popover";
import { AddNoteSheet } from "@/components/sheets/add-note";
import { EditSetSheet } from "@/components/sheets/edit-set";
import BottomSheet from "@gorhom/bottom-sheet";
import { useSound } from "@/components/sounds";
import * as Haptics from "expo-haptics";
import { SetStatus } from "@/interface";
import {
  SetRow,
  SetHeader,
  EditField,
} from "@/components/pages/workout/common";
import { ExerciseStoreSelectors, useExercisesStore } from "@/components/store";
import { getHistoricalExerciseDescription } from "@/util/workout/display";

type CompletedSetRowProps = {
  set: Set;
  index: number;
  difficultyType: DifficultyType;
  onUpdateSet: (setId: string, update: Partial<Set>) => void;
  onDelete: (setId: string) => void;
  onEdit: (setId: string, field: EditField) => void;
};

function CompletedSetRow({
  set,
  index,
  difficultyType,
  onUpdateSet,
  onDelete,
  onEdit,
}: CompletedSetRowProps) {
  const setAnimationSize = useSharedValue(1);
  const { play } = useSound();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: setAnimationSize.value }],
  }));

  const handleToggle = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (set.status === SetStatus.UNSTARTED) {
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
        status: SetStatus.UNSTARTED,
        restStartedAt: undefined,
        restEndedAt: undefined,
      });
    }
  };

  return (
    <SetRow
      set={set}
      index={index}
      useAltBackground={index % 2 === 1}
      difficultyType={difficultyType}
      containerAnimatedStyle={animatedStyle}
      onEdit={onEdit}
      onToggle={handleToggle}
      showSwipeActions={true}
      onDelete={onDelete}
    />
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

  const difficultyType = useExercisesStore(
    (state) =>
      ExerciseStoreSelectors.getExercise(exercise.metaId, state).difficultyType
  );

  const exerciseName = useExercisesStore(
    (state) => ExerciseStoreSelectors.getExercise(exercise.metaId, state).name
  );

  const handleAddSet = () => {
    if (workout && exerciseId) {
      onSave(ExerciseActions(workout, exerciseId).duplicateLastSet());
    }
  };

  const handleRemoveSet = (setId: string) => {
    if (workout && exercise?.sets.length === 1) {
      navigation.goBack();
    }
    if (workout) {
      onSave(SetActions(workout, setId).delete());
    }
  };

  const handleUpdateSet = (setId: string, update: Partial<Set>) => {
    if (workout) {
      onSave(SetActions(workout, setId).update(update));
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
        const updatedWorkout = ExerciseActions(workout, exerciseId).update({
          note: note.trim() === "" ? undefined : note,
        });
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
        const updatedWorkout = SetActions(workout, setId).update(update);
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
        title={exerciseName}
        subtitle={getHistoricalExerciseDescription({
          difficulties: exercise.sets.map((set) => set.difficulty),
          difficultyType,
        })}
        leftAction={<BackButton onClick={navigation.goBack} />}
        rightAction={
          <MoreButton
            ref={moreButtonRef}
            onClick={handleMorePress}
            progress={popoverProgress}
          />
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
                <CompletedSetRow
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
