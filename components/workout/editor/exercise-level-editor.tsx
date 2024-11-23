import { View } from "@/components/Themed";
import { Exercise, WorkoutActivity, WorkoutActivityType } from "@/interface";
import { StyleUtils } from "@/util/styles";
import {
  findNodeHandle,
  StyleSheet,
  UIManager,
  useWindowDimensions,
} from "react-native";
import { EditorExercise } from "@/components/workout/core";
import { useEffect, useRef, useState } from "react";
import { ReorderableExercises } from "@/components/workout/editor/util/reorder";
import { ScrollView } from "react-native-gesture-handler";

const exerciseLevelEditorStyles = StyleSheet.create({
  scroll: {
    paddingBottom: "5%",
  },
  content: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
  },
});

type ExerciseLevelEditorProps = {
  isReordering: boolean;
  currentExerciseId?: string;
  exercises: Exercise[];
  onRemove: (exerciseId: string) => void;
  onReorder: (exercises: Exercise[]) => void;
  onEdit: (exercise: Exercise) => void;
};

type ScrollState = {
  top: number;
  height: number;
  offset: number;
};

const SCROLL_OFFSET = 80;

export function ExerciseLevelEditor({
  isReordering,
  currentExerciseId,
  exercises,
  onRemove,
  onReorder,
  onEdit,
}: ExerciseLevelEditorProps) {
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
    <ScrollView
      contentContainerStyle={exerciseLevelEditorStyles.scroll}
      style={{ height: height * 0.65 }}
      ref={scrollRef}
      onScroll={(event) => {
        const offset = event.nativeEvent.contentOffset.y;
        setScrollState((state) => ({
          ...(state as ScrollState),
          offset,
        }));
      }}
    >
      <View style={exerciseLevelEditorStyles.content}>
        {isReordering ? (
          <ReorderableExercises
            scrollMeasurements={{
              top: (scrollState as ScrollState).top,
              height: (scrollState as ScrollState).height,
            }}
            scrollDown={() => scrollByOffset(SCROLL_OFFSET)}
            scrollUp={() => scrollByOffset(-1 * SCROLL_OFFSET)}
            exercises={exercises}
            onReorder={onReorder}
            scrollRef={scrollRef}
          />
        ) : (
          exercises.map((exercise, index) => (
            <EditorExercise
              key={index}
              exercise={exercise}
              onClick={() => onEdit(exercise)}
              onTrash={() => onRemove(exercise.id)}
              animate={exercise.id === currentExerciseId}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
