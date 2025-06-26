import React, {
  forwardRef,
  useCallback,
  useState,
  useRef,
  useEffect,
  memo,
} from "react";
import { View, Text, useThemeColoring } from "@/components/Themed";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { commonSheetStyles, SheetProps, SheetX } from "./common";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { Reorderable } from "@/components/util/reorderable";
import Animated, {
  LinearTransition,
  useSharedValue,
} from "react-native-reanimated";
import { GripVertical } from "lucide-react-native";
import { Exercise } from "@/interface";
import * as Haptics from "expo-haptics";

const reorderingExerciseItemStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    paddingVertical: "4%",
    paddingHorizontal: "3%",
    marginVertical: "1%",
    borderRadius: 8,
  },
  dragHandle: {
    marginRight: "3%",
  },
});

type ReorderingExerciseItemProps = {
  exercise: Exercise;
  itemHeight: number;
  onPressIn: () => void;
  onPressOut: () => void;
};

const ReorderingExerciseItem = memo(
  ({ exercise, itemHeight, onPressIn, onPressOut }: ReorderingExerciseItemProps) => {
    const backgroundColor = useThemeColoring("appBackground");
    const inactiveGripColor = useThemeColoring("lightText");

    return (
      <TouchableOpacity
        style={[
          reorderingExerciseItemStyles.container,
          { backgroundColor, height: itemHeight },
        ]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={reorderingExerciseItemStyles.dragHandle}>
          <GripVertical size={20} color={inactiveGripColor} />
        </View>
        <Text>{exercise.name}</Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.exercise) ===
        JSON.stringify(nextProps.exercise) &&
      prevProps.itemHeight === nextProps.itemHeight &&
      prevProps.onPressIn === nextProps.onPressIn
    );
  }
);

const reorderExercisesStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "5%",
    paddingBottom: "10%",
  },
  headerContainer: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3%",
  },
  item: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    paddingVertical: "4%",
    paddingHorizontal: "3%",
    marginVertical: "1%",
    borderRadius: 8,
  },
  buttonContainer: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingHorizontal: "5%",
    width: "100%",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

type ReorderExercisesSheetProps = SheetProps & {
  exercises: Exercise[];
  onReorder: (newExercises: Exercise[]) => void;
};

export const ReorderExercisesSheet = forwardRef<
  BottomSheet,
  ReorderExercisesSheetProps
>(({ show, hide, onHide, exercises, onReorder }, ref) => {
  const backgroundColor = useThemeColoring("appBackground");
  const hasActivatedReordering = useSharedValue(false);
  const activeGripColor = useThemeColoring("primaryAction");
  const { width, height } = useWindowDimensions();

  const itemHeight = height * 0.07;
  const originalOrderRef = useRef<string[]>([]);
  const [currentExercises, setCurrentExercises] = useState(exercises);
  
  const holdTimerRef = useRef<number>(null);

  useEffect(() => {
    if (show) {
      originalOrderRef.current = exercises.map((ex) => ex.id);
      setCurrentExercises(exercises);
    }
  }, [show, exercises]);

  const handleReorder = useCallback((newExercises: Exercise[]) => {
    setCurrentExercises(newExercises);
  }, []);

  const handleSave = useCallback(() => {
    onReorder(currentExercises);
    hide();
  }, [currentExercises, onReorder, hide]);

  const handleBack = useCallback(() => {
    hide();
  }, [hide]);

  const handlePressIn = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    holdTimerRef.current = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      hasActivatedReordering.value = true;
    }, 500);
  }, []);

  const handlePressOut = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
  }, []);

  const currentOrder = currentExercises.map((ex) => ex.id);
  const hasOrderChanged =
    JSON.stringify(currentOrder) !== JSON.stringify(originalOrderRef.current);

  const renderExerciseItem = useCallback(
    (exercise: Exercise) => {
      return (
        <Animated.View key={exercise.id} layout={LinearTransition}>
          <ReorderingExerciseItem
            exercise={exercise}
            itemHeight={itemHeight}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
        </Animated.View>
      );
    },
    [itemHeight]
  );

  const renderPlaceholder = useCallback(
    (exercise: Exercise) => {
      return (
        <View
          key={exercise.id}
          background
          style={[
            reorderingExerciseItemStyles.container,
            { height: itemHeight },
          ]}
        />
      );
    },
    [itemHeight]
  );

  const renderInDragItem = useCallback(
    (exercise: Exercise) => {
      return (
        <View
          style={[
            reorderingExerciseItemStyles.container,
            { backgroundColor, width: width * 0.9, height: itemHeight },
          ]}
        >
          <View style={reorderingExerciseItemStyles.dragHandle}>
            <GripVertical size={20} color={activeGripColor} />
          </View>
          <Text style={{ color: activeGripColor }}>{exercise.name}</Text>
        </View>
      );
    },
    [backgroundColor, itemHeight]
  );

  const getItemHeight = useCallback(() => {
    return itemHeight;
  }, [itemHeight]);

  return (
    <PopupBottomSheet show={show} onHide={onHide} ref={ref}>
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          Reorder Exercises
        </Text>
        <TouchableOpacity onPress={handleBack}>
          <SheetX />
        </TouchableOpacity>
      </View>
      <View style={reorderExercisesStyles.container}>
        <View style={reorderExercisesStyles.headerContainer}>
          <Text light>Hold and drag the exercises to reorder</Text>
        </View>

        <Reorderable
          items={currentExercises}
          scrollStyle={{ height: height * 0.6 }}
          hasActivatedReordering={hasActivatedReordering}
          getItemHeight={getItemHeight}
          renderItem={renderExerciseItem}
          renderPlaceholder={renderPlaceholder}
          renderInDragItem={renderInDragItem}
          onReorder={handleReorder}
        />

        <TouchableOpacity
          style={[
            commonSheetStyles.sheetButton,
            {
              backgroundColor: activeGripColor,
            },
            !hasOrderChanged && reorderExercisesStyles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={!hasOrderChanged}
        >
          <Text neutral emphasized>
            Update
          </Text>
        </TouchableOpacity>
      </View>
    </PopupBottomSheet>
  );
});
