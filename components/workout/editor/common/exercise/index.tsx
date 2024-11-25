import { useThemeColoring, View, Text } from "@/components/Themed";
import { Exercise, SetStatus } from "@/interface";
import { EDITOR_EXERCISE_HEIGHT, StyleUtils } from "@/util/styles";
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
    height: EDITOR_EXERCISE_HEIGHT,
  },
  title: {
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
  animate?: boolean;
};

function getSubtitle(exercise: Exercise) {
  const totalSets = exercise.sets.length;
  const completedSets = exercise.sets.filter(
    ({ status }) => status === SetStatus.FINISHED
  ).length;
  const allSetsAreUnstarted = exercise.sets.every(
    ({ status }) => status === SetStatus.UNSTARTED
  );

  if (totalSets === completedSets) {
    return "All sets completed!";
  }

  if (allSetsAreUnstarted) {
    return `${totalSets} sets not yet started`;
  }

  return `${completedSets} of ${totalSets} sets completed`;
}

export function EditorExercise({
  exercise,
  onClick,
  onTrash,
  animate,
}: EditorExerciseProps) {
  const animationBackgroundColor = useSharedValue(0);
  const animationColor = useThemeColoring("highlightedAnimationColor");

  useEffect(() => {
    animationBackgroundColor.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animationBackgroundColor.value,
      [0, 1],
      ["transparent", animationColor]
    ),
  }));

  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={(_, drag) => (
        <SwipeableDelete
          drag={drag}
          onDelete={onTrash}
          dimension={EDITOR_EXERCISE_HEIGHT}
        />
      )}
    >
      <TouchableOpacity onPress={onClick}>
        <Animated.View
          style={[editorExerciseStyles.container, animate ? animatedStyle : {}]}
        >
          <View style={editorExerciseStyles.title}>
            <Text large>{exercise.name}</Text>
            <Text neutral light>
              {getSubtitle(exercise)}
            </Text>
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
