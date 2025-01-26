import { useThemeColoring, View, Text } from "@/components/Themed";
import { Exercise } from "@/interface";
import {
  EDITOR_EXERCISE_HEIGHT,
  EDITOR_EXERCISE_WITH_NOTE_HEIGHT,
  StyleUtils,
} from "@/util/styles";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef } from "react";
import { ScrollView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  interpolateColor,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { textTheme } from "@/constants/Themes";
import { Plus } from "lucide-react-native";

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
  addExercisesContainer: {
    ...StyleUtils.flexColumn(10),
    justifyContent: "center",
    paddingHorizontal: "3%",
  },
  addExercisesMessage: {
    ...StyleUtils.flexRow(),
    alignItems: "flex-end",
  },
  inlineEdit: {
    marginHorizontal: -15,
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

// todo: complete rest whenever a exercise is in the midst of being shuffled
export function ExerciseLevelEditor({
  currentExerciseId,
  exercises,
  getDescription,
  onRemove,
  onEdit,
}: ExerciseLevelEditorProps) {
  const iconColor = useThemeColoring("primaryAction");
  const scrollRef = useRef<ScrollView>(null);
  const { height } = useWindowDimensions();

  return (
    <ScrollView
      contentContainerStyle={exerciseLevelEditorStyles.scroll}
      style={{ height: height * 0.65 }}
      ref={scrollRef}
    >
      <View style={exerciseLevelEditorStyles.content}>
        {exercises.length > 0 ? (
          exercises.map((exercise, index) => (
            <Animated.View key={exercise.id} layout={LinearTransition}>
              <EditorExercise
                key={index}
                exercise={exercise}
                onClick={() => onEdit(exercise)}
                onTrash={() => onRemove(exercise.id)}
                animate={exercise.id === currentExerciseId}
                description={getDescription(exercise)}
              />
            </Animated.View>
          ))
        ) : (
          <View style={exerciseLevelEditorStyles.addExercisesContainer}>
            <View style={exerciseLevelEditorStyles.addExercisesMessage}>
              <Text>There are no exercises in this workout.</Text>
            </View>
            <View style={exerciseLevelEditorStyles.addExercisesMessage}>
              <Text>Add an exercise by clicking '</Text>
              <Plus size={textTheme.neutral.fontSize} color={iconColor} />
              <Text>'</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
