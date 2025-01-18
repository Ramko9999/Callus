import { View, Text, useThemeColoring } from "@/components/Themed";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import { textTheme } from "@/constants/Themes";
import { ExercisePlan } from "@/interface";
import { EDITOR_EXERCISE_HEIGHT, StyleUtils } from "@/util/styles";
import { FontAwesome } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

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
  onTrash: () => void;
  description?: string;
};

export function EditorExercise({
  exercise,
  onClick,
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
  exercises: ExercisePlan[];
  getDescription: (exercise: ExercisePlan) => string;
  onRemove: (exercisePlanIndex: number) => void;
  onReorder: (exercises: ExercisePlan[]) => void;
  onEdit: (exercisePlanIndex: number) => void;
};

// todo: scroll height doesn't need to be 0.65 * whatever. Use flex
// todo: make a modal to encapsulate reordering the exercises
export function ExerciseLevelEditor({
  isReordering,
  exercises,
  getDescription,
  onRemove,
  onReorder,
  onEdit,
}: ExerciseLevelEditorProps) {
  const { height } = useWindowDimensions();
  return (
    <ScrollView
      contentContainerStyle={exerciseLevelEditorStyles.scroll}
      style={{ height: height * 0.65 }}
    >
      <View style={exerciseLevelEditorStyles.content}>
        {exercises.map((exercise, index) => (
          <EditorExercise
            key={index}
            exercise={exercise}
            onClick={() => onEdit(index)}
            onTrash={() => onRemove(index)}
            description={getDescription(exercise)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
