import { View, Text, useThemeColoring } from "@/components/Themed";
import { Reorderable } from "@/components/util/reorderable";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import { textTheme } from "@/constants/Themes";
import { ExercisePlan } from "@/interface";
import { EDITOR_EXERCISE_HEIGHT, StyleUtils } from "@/util/styles";
import { FontAwesome } from "@expo/vector-icons";
import { Plus } from "lucide-react-native";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  LinearTransition,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import React from "react";

// todo: try to reuse
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
  exercise: ExercisePlan;
  onClick: () => void;
  onLongClick: () => void;
  onTrash: () => void;
  description?: string;
};

export function EditorExercise({
  exercise,
  onClick,
  onLongClick,
  onTrash,
  description,
}: EditorExerciseProps) {
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
      <TouchableOpacity
        style={[
          editorExerciseStyles.container,
          { height: EDITOR_EXERCISE_HEIGHT },
        ]}
        onPress={onClick}
        onLongPress={onLongClick}
      >
        <View style={editorExerciseStyles.title}>
          <Text large>{exercise.name}</Text>
          <Text neutral light>
            {description}
          </Text>
        </View>
        <View style={editorExerciseStyles.rightActions}>
          <FontAwesome
            name="angle-right"
            color={useThemeColoring("lightText")}
            size={textTheme.large.fontSize}
          />
        </View>
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
  isReordering: boolean;
  exercises: ExercisePlan[];
  getDescription: (exercise: ExercisePlan) => string;
  onRemove: (exercisePlanId: string) => void;
  onReorder: (exercises: ExercisePlan[]) => void;
  onEdit: (exercisePlanId: string) => void;
};

// todo: scroll height doesn't need to be 0.65 * whatever. Use flex
export function ExerciseLevelEditor({
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
          getItemHeight={(exercise) => EDITOR_EXERCISE_HEIGHT}
          renderItem={(exercise) => (
            <Animated.View key={exercise.id} layout={LinearTransition}>
              <EditorExercise
                exercise={exercise}
                onClick={() => onEdit(exercise.id)}
                onLongClick={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  hasActivatedReordering.value = true;
                }}
                onTrash={() => onRemove(exercise.id)}
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
                  height: EDITOR_EXERCISE_HEIGHT,
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
