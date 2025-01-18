import { useThemeColoring, View, Text } from "@/components/Themed";
import { Exercise } from "@/interface";
import {
  EDITOR_EXERCISE_HEIGHT,
  EDITOR_EXERCISE_WITH_NOTE_HEIGHT,
  StyleUtils,
} from "@/util/styles";
import {
  findNodeHandle,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { textTheme } from "@/constants/Themes";
import { ReorderableExercises } from "./reorder";

const editorExerciseStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    paddingLeft: "3%",
    paddingVertical: "3%",
  },
  title: {
    width: "90%",
    ...StyleUtils.flexColumn(5),
  },
  rightActions: {
    ...StyleUtils.flexRowCenterAll(),
    justifyContent: "flex-end",
    marginLeft: "auto",
    paddingRight: "3%",
  },
});

type EditorExerciseProps = {
  exercise: Exercise;
  onClick: () => void;
  onTrash: () => void;
  description?: string;
  animate?: boolean;
};

export function EditorExercise({
  exercise,
  onClick,
  onTrash,
  animate,
  description,
}: EditorExerciseProps) {
  const animationBackgroundColor = useSharedValue(0);
  const animationColor = useThemeColoring("highlightedAnimationColor");

  useEffect(() => {
    if (animate) {
      animationBackgroundColor.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1
      );
    } else {
      animationBackgroundColor.value = 0;
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animationBackgroundColor.value,
      [0, 1],
      ["transparent", animationColor]
    ),
  }));

  const editorExerciseHeight = exercise.note
    ? EDITOR_EXERCISE_WITH_NOTE_HEIGHT
    : EDITOR_EXERCISE_HEIGHT;

  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={(_, drag) => (
        <SwipeableDelete
          drag={drag}
          onDelete={onTrash}
          dimension={editorExerciseHeight}
        />
      )}
    >
      <TouchableOpacity onPress={onClick}>
        <Animated.View
          style={[
            editorExerciseStyles.container,
            animatedStyle,
            { height: editorExerciseHeight },
          ]}
        >
          <View style={editorExerciseStyles.title}>
            <Text large>{exercise.name}</Text>
            <Text neutral light>
              {description}
            </Text>
            {exercise.note && (
              <Text neutral light italic numberOfLines={1}>
                {exercise.note}
              </Text>
            )}
          </View>
          <View style={editorExerciseStyles.rightActions}>
            <FontAwesome
              name="angle-right"
              color={useThemeColoring("lightText")}
              size={textTheme.large.fontSize}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Swipeable>
  );
}

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
  getDescription: (exercise: Exercise) => string;
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

// todo: complete rest whenever a exercise is in the midst of being shuffled
export function ExerciseLevelEditor({
  isReordering,
  currentExerciseId,
  exercises,
  getDescription,
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
              description={getDescription(exercise)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
