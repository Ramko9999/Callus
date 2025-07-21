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
import Sortable from "react-native-sortables";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { GripVertical } from "lucide-react-native";
import { Exercise } from "@/interface";
import { ExerciseStoreSelectors, useExercisesStore } from "../store";

const reorderingExerciseItemStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    paddingVertical: "4%",
    paddingHorizontal: "3%",
    marginLeft: "5%",
    width: "90%",
    marginVertical: "1%",
    borderRadius: 8,
  },
  dragHandle: {
    marginRight: "3%",
  },
  itemContainer: {
    position: "relative",
  },
  foreground: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
  },
});

type ReorderingExerciseItemProps = {
  exercise: Exercise;
  itemHeight: number;
};

const ReorderingExerciseItem = memo(
  ({ exercise, itemHeight }: ReorderingExerciseItemProps) => {
    const backgroundColor = useThemeColoring("appBackground");
    const primaryTextColor = useThemeColoring("primaryText");

    const exerciseName = useExercisesStore(
      (state) => ExerciseStoreSelectors.getExercise(exercise.metaId, state).name
    );

    return (
      <View style={reorderingExerciseItemStyles.itemContainer}>
        <TouchableOpacity
          style={[
            reorderingExerciseItemStyles.container,
            {
              backgroundColor,
              height: itemHeight,
            },
          ]}
          activeOpacity={1}
        >
          <View style={reorderingExerciseItemStyles.foreground}>
            <View style={reorderingExerciseItemStyles.dragHandle}>
              <GripVertical size={20} color={primaryTextColor} />
            </View>
            <Text>{exerciseName}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.exercise) ===
        JSON.stringify(nextProps.exercise) &&
      prevProps.itemHeight === nextProps.itemHeight
    );
  }
);

const reorderExercisesStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingBottom: "10%",
  },
  headerContainer: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3%",
    paddingHorizontal: "5%",
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
  scrollContainer: {
    marginBottom: "3%",
  },
  scrollContent: {
    flex: 1,
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
  const activeGripColor = useThemeColoring("primaryAction");
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();
  const { height } = useWindowDimensions();

  const itemHeight = height * 0.07;
  const originalOrderRef = useRef<string[]>([]);
  const [currentExercises, setCurrentExercises] = useState(exercises);

  useEffect(() => {
    if (show) {
      originalOrderRef.current = exercises.map((ex) => ex.id);
      setCurrentExercises(exercises);
    }
  }, [show, exercises]);

  const handleReorder = useCallback(({ data }: { data: Exercise[] }) => {
    setCurrentExercises(data);
  }, []);

  const handleSave = useCallback(() => {
    onReorder(currentExercises);
    hide();
  }, [currentExercises, onReorder, hide]);

  const handleBack = useCallback(() => {
    hide();
  }, [hide]);

  const currentOrder = currentExercises.map((ex) => ex.id);
  const hasOrderChanged =
    JSON.stringify(currentOrder) !== JSON.stringify(originalOrderRef.current);

  const renderItem = useCallback(
    ({ item }: { item: Exercise }) => (
      <ReorderingExerciseItem exercise={item} itemHeight={itemHeight} />
    ),
    [itemHeight]
  );

  const keyExtractor = useCallback((item: Exercise) => item.id, []);

  return (
    <PopupBottomSheet
      show={show}
      onHide={onHide}
      ref={ref}
      enablePanDownToClose={false}
    >
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
        <Animated.ScrollView
          ref={scrollableRef}
          style={[reorderExercisesStyles.scrollContainer, { height: "75%" }]}
          contentContainerStyle={reorderExercisesStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Sortable.Grid
            data={currentExercises}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            columns={1}
            onDragEnd={handleReorder}
            autoScrollEnabled={true}
            autoScrollSpeed={1}
            hapticsEnabled={false}
            activeItemScale={1.05}
            inactiveItemOpacity={0.7}
            activeItemShadowOpacity={0.2}
            dropAnimationDuration={300}
            activationAnimationDuration={200}
            enableActiveItemSnap={false}
            scrollableRef={scrollableRef}
          />
        </Animated.ScrollView>
        <View style={reorderExercisesStyles.buttonContainer}>
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
      </View>
    </PopupBottomSheet>
  );
});
