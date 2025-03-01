import { useThemeColoring } from "@/components/Themed";
import { Reorderable } from "@/components/util/reorderable";
import { textTheme } from "@/constants/Themes";
import { Exercise, ExercisePlan } from "@/interface";
import { StyleUtils } from "@/util/styles";
import { Plus } from "lucide-react-native";
import { useWindowDimensions, StyleSheet } from "react-native";
import { View, Text } from "@/components/Themed";
import Animated, {
  useSharedValue,
  LinearTransition,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ExerciseProps, getExerciseHeight } from "./item";

const exerciseEditorStyles = StyleSheet.create({
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

type ExerciseEditorProps = {
  exercises: (Exercise | ExercisePlan)[];
  onRemove: (exerciseId: string) => void;
  onReorder: (exercises: (Exercise | ExercisePlan)[]) => void;
  onEdit: (exerciseId: string) => void;
  renderExercise: (props: ExerciseProps) => React.ReactNode;
};

export function ExerciseEditor({
  exercises,
  onRemove,
  onReorder,
  onEdit,
  renderExercise,
}: ExerciseEditorProps) {
  const hasActivatedReordering = useSharedValue(false);

  const iconColor = useThemeColoring("primaryAction");
  const dragBgColor = useThemeColoring("primaryViewBackground");
  const dragBorderColor = useThemeColoring("calendarDayBackground");
  const { height } = useWindowDimensions();

  const onLongClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    hasActivatedReordering.value = true;
  };

  return (
    <>
      {exercises.length > 0 ? (
        <Reorderable
          items={exercises}
          hasActivatedReordering={hasActivatedReordering}
          contentStyle={exerciseEditorStyles.content}
          scrollStyle={{ height: height * 0.65 }} // todo: investigate
          dragItemStyle={{
            backgroundColor: dragBgColor,
            borderColor: dragBorderColor,
            ...exerciseEditorStyles.draggingItem,
          }}
          getItemHeight={(exercise) => getExerciseHeight(exercise as Exercise)}
          renderItem={(exercise) => (
            <Animated.View key={exercise.id} layout={LinearTransition}>
              {renderExercise({
                exercise,
                onClick: onEdit,
                onLongClick,
                onTrash: onRemove,
              })}
            </Animated.View>
          )}
          renderPlaceholder={(exercise) => (
            <View
              key={exercise.id}
              style={[
                exerciseEditorStyles.placeholder,
                {
                  height: getExerciseHeight(exercise as Exercise),
                },
              ]}
            />
          )}
          renderInDragItem={(exercise) =>
            renderExercise({
              exercise,
              onClick: () => {},
              onLongClick: () => {},
              onTrash: () => {},
              isDragging: true,
            })
          }
          onReorder={onReorder}
        />
      ) : (
        <View style={exerciseEditorStyles.addExercisesContainer}>
          <View style={exerciseEditorStyles.addExercisesMessage}>
            <Text>There are no exercises in this workout.</Text>
          </View>
          <View style={exerciseEditorStyles.addExercisesMessage}>
            <Text>Add an exercise by clicking '</Text>
            <Plus size={textTheme.neutral.fontSize} color={iconColor} />
            <Text>'</Text>
          </View>
        </View>
      )}
    </>
  );
}
