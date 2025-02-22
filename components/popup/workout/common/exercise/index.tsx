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
import { useEffect } from "react";
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
import { Reorderable } from "@/components/util/reorderable";
import React from "react";
import * as Haptics from "expo-haptics";

const editorExerciseStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    paddingLeft: "3%",
    paddingVertical: "3%",
  },
  title: {
    ...StyleUtils.flexColumn(5),
    width: "90%",
  },
  rightActions: {
    ...StyleUtils.flexRowCenterAll(20),
    justifyContent: "flex-end",
    marginLeft: "auto",
    paddingRight: "3%",
  },
});

type EditorExerciseProps = {
  exercise: Exercise;
  onClick: () => void;
  onLongClick: () => void;
  onTrash: () => void;
  description?: string;
  animate?: boolean;
};

export function EditorExercise({
  exercise,
  onClick,
  onLongClick,
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
      <TouchableOpacity onPress={onClick} onLongPress={onLongClick}>
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
  content: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
    paddingBottom: "5%",
  },
  addExercisesContainer: {
    ...StyleUtils.flexColumn(10),
    justifyContent: "center",
    paddingHorizontal: "3%",
    paddingTop: "3%",
  },
  addExercisesMessage: {
    ...StyleUtils.flexRow(),
    alignItems: "flex-end",
  },
  inlineEdit: {
    marginHorizontal: -15,
  },
  placeholder: {
    width: "100%",
  },
  draggingItem: {
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
  },
});

type ExerciseLevelEditorProps = {
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
  onReorder,
  onEdit,
}: ExerciseLevelEditorProps) {
  const hasActivatedReordering = useSharedValue(false);

  const iconColor = useThemeColoring("primaryAction");
  const dragBgColor = useThemeColoring("primaryViewBackground");
  const dragBorderColor = useThemeColoring("calendarDayBackground");
  const { height } = useWindowDimensions();

  return (
    <>
      {exercises.length > 0 ? (
        <Reorderable
          items={exercises}
          hasActivatedReordering={hasActivatedReordering}
          contentStyle={exerciseLevelEditorStyles.content}
          scrollStyle={{ height: height * 0.65 }}
          dragItemStyle={{
            backgroundColor: dragBgColor,
            borderColor: dragBorderColor,
            ...exerciseLevelEditorStyles.draggingItem,
          }}
          getItemHeight={(exercise) =>
            exercise.note != undefined
              ? EDITOR_EXERCISE_WITH_NOTE_HEIGHT
              : EDITOR_EXERCISE_HEIGHT
          }
          renderItem={(exercise) => (
            <Animated.View key={exercise.id} layout={LinearTransition}>
              <EditorExercise
                exercise={exercise}
                onClick={() => onEdit(exercise)}
                onLongClick={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  hasActivatedReordering.value = true;
                }}
                onTrash={() => onRemove(exercise.id)}
                animate={exercise.id === currentExerciseId}
                description={getDescription(exercise)}
              />
            </Animated.View>
          )}
          renderPlaceholder={(exercise) => (
            <View
              key={exercise.id}
              style={[
                exerciseLevelEditorStyles.placeholder,
                {
                  height:
                    exercise.note != undefined
                      ? EDITOR_EXERCISE_WITH_NOTE_HEIGHT
                      : EDITOR_EXERCISE_HEIGHT,
                },
              ]}
            />
          )}
          renderInDragItem={(exercise) => (
            <EditorExercise
              exercise={exercise}
              description={getDescription(exercise)}
              onClick={() => {}}
              onLongClick={() => {}}
              onTrash={() => {}}
            />
          )}
          onReorder={onReorder}
        />
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
    </>
  );
}
