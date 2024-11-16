import { View } from "@/components/Themed";
import { Exercise, ExerciseMeta, Workout } from "@/interface";
import { WORKOUT_PLAYER_EDITOR_HEIGHT, StyleUtils } from "@/util/styles";
import {
  findNodeHandle,
  StyleSheet,
  UIManager,
  useWindowDimensions,
} from "react-native";
import { Add, Close, Done, Shuffle, Trash } from "../core/actions";
import { EditorExercise, WorkoutTitleMeta } from "../core";
import { useEffect, useRef, useState } from "react";
import { WorkoutDeleteConfirmation } from "./confirmations";
import { EXERCISE_REPOSITORY } from "@/constants";
import { ExerciseFinder } from "./exercises/finder";
import { ReorderableExercises } from "./exercises/reorder";
import { ScrollView } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

const exercisesEditorStyle = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
  },
  actions: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    paddingRight: "3%",
  },
  content: {
    ...StyleUtils.flexColumn(10),
    paddingLeft: "3%",
  },
  scroll: {
    paddingBottom: "5%",
  },
});

type ExercisesEditorProps = {
  onAdd: (meta: ExerciseMeta) => void;
  onRemove: (exercise: Exercise) => void;
  onReorder: (exercices: Exercise[]) => void;
  onEdit: (exercise: Exercise) => void;
  onEditMeta: () => void;
  hide: () => void;
  trash: () => void;
  workout: Workout;
};

type ScrollState = {
  top: number;
  height: number;
  offset: number;
};

const SCROLL_OFFSET = 80;

export function ExercisesEditor({
  hide,
  onEditMeta,
  onReorder,
  onEdit,
  onRemove,
  onAdd,
  trash,
  workout,
}: ExercisesEditorProps) {
  const [showWorkoutDeleteConfirmation, setShowWorkoutDeleteConfirmation] =
    useState(false);
  const [showExerciseFinder, setShowExerciseFinder] = useState(false);
  const [isReorderingExercises, setIsReorderingExercises] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [scrollState, setScrollState] = useState<ScrollState>();
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (scrollRef.current) {
      UIManager.measure(
        findNodeHandle(scrollRef.current) as number,
        (x, y, width, height, pageX, pageY) => {
          setScrollState({ height, top: pageY, offset: 0 });
        }
      );
    }
  }, []);

  // todo: the scrolling is kinda weird ngl, fix that
  const scrollByOffset = (offset: number) => {
    if (scrollRef.current && scrollState) {
      scrollRef.current.scrollTo({
        y: scrollState.offset + offset,
      });
    }
  };

  return (
    <View background style={exercisesEditorStyle.container}>
      <View style={exercisesEditorStyle.actions}>
        <Close onClick={hide} />
        <View style={exercisesEditorStyle.rightActions}>
          {isReorderingExercises ? (
            <Done
              onClick={() => {
                setIsReorderingExercises(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            />
          ) : (
            <Shuffle
              onClick={() => {
                setIsReorderingExercises(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            />
          )}
          <Add onClick={() => setShowExerciseFinder(true)} />
          <Trash onClick={() => setShowWorkoutDeleteConfirmation(true)} />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={exercisesEditorStyle.scroll}
        style={{ height: height * WORKOUT_PLAYER_EDITOR_HEIGHT }}
        ref={scrollRef}
        onScroll={(event) => {
          const offset = event.nativeEvent.contentOffset.y;
          setScrollState((state) => ({
            ...(state as ScrollState),
            offset,
          }));
        }}
      >
        <View style={exercisesEditorStyle.content}>
          <WorkoutTitleMeta workout={workout} />
          {isReorderingExercises ? (
            <ReorderableExercises
              scrollMeasurements={{
                top: (scrollState as ScrollState).top,
                height: (scrollState as ScrollState).height,
              }}
              scrollDown={() => scrollByOffset(SCROLL_OFFSET)}
              scrollUp={() => scrollByOffset(-1 * SCROLL_OFFSET)}
              exercises={workout.exercises}
              onReorder={onReorder}
              scrollRef={scrollRef}
            />
          ) : (
            workout.exercises.map((exercise, index) => (
              <EditorExercise
                key={index}
                exercise={exercise}
                onClick={() => onEdit(exercise)}
                onTrash={() => onRemove(exercise)}
              />
            ))
          )}
        </View>
      </ScrollView>
      <ExerciseFinder
        show={showExerciseFinder}
        hide={() => setShowExerciseFinder(false)}
        repository={EXERCISE_REPOSITORY}
        onSelect={(meta) => {
          onAdd(meta);
          setShowExerciseFinder(false);
        }}
      />
      <WorkoutDeleteConfirmation
        show={showWorkoutDeleteConfirmation}
        hide={() => setShowWorkoutDeleteConfirmation(false)}
        onDelete={() => {
          setShowWorkoutDeleteConfirmation(false);
          trash();
        }}
      />
    </View>
  );
}
