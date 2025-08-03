import { Exercise, ExercisePlan } from "@/interface";
import {
  EDITOR_EXERCISE_HEIGHT,
  EDITOR_EXERCISE_WITH_NOTE_HEIGHT,
  StyleUtils,
} from "@/util/styles";
import { memo } from "react";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import {
  getHistoricalExerciseDescription
} from "@/util/workout/display";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import { TouchableOpacity, StyleSheet } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { FontAwesome } from "@expo/vector-icons";
import { textTheme } from "@/constants/Themes";
import { ExerciseStoreSelectors, useExercisesStore } from "@/components/store";

export function getExerciseHeight(exercise: Exercise) {
  return exercise.note != undefined
    ? EDITOR_EXERCISE_WITH_NOTE_HEIGHT
    : EDITOR_EXERCISE_HEIGHT;
}

function areExercisePropsSame(
  prevProps: ExerciseProps,
  nextProps: ExerciseProps
) {
  return (
    JSON.stringify(prevProps.exercise) === JSON.stringify(nextProps.exercise) &&
    Object.is(prevProps.onClick, nextProps.onClick) &&
    Object.is(prevProps.onLongClick, nextProps.onLongClick) &&
    Object.is(prevProps.onTrash, nextProps.onTrash) &&
    prevProps.isDragging === nextProps.isDragging
  );
}

export type ExerciseProps = {
  exercise: Exercise | ExercisePlan;
  onClick: (exerciseId: string) => void;
  onLongClick: () => void;
  onTrash: (exerciseId: string) => void;
  isDragging?: boolean;
};

const exerciseStyles = StyleSheet.create({
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
  pressed: {
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
  },
});

export const RoutineExercise = memo(
  ({ exercise, onClick, onLongClick, onTrash }: ExerciseProps) => {
    const exercisePlan = exercise as ExercisePlan;
    const exerciseName = useExercisesStore(
      (state) =>
        ExerciseStoreSelectors.getExercise(exercisePlan.metaId, state).name
    );
    const difficultyType = useExercisesStore(
      (state) =>
        ExerciseStoreSelectors.getExercise(exercisePlan.metaId, state)
          .difficultyType
    );

    return (
      <Swipeable
        overshootRight={false}
        renderRightActions={(_, drag) => (
          <SwipeableDelete
            drag={drag}
            onDelete={() => onTrash(exercisePlan.id)}
            dimension={EDITOR_EXERCISE_HEIGHT}
          />
        )}
      >
        <TouchableOpacity
          onPress={() => onClick(exercisePlan.id)}
          onLongPress={onLongClick}
          style={[exerciseStyles.container, { height: EDITOR_EXERCISE_HEIGHT }]}
        >
          <View style={exerciseStyles.title}>
            <Text large>{exerciseName}</Text>
            <Text neutral light>
              {getHistoricalExerciseDescription({
                difficulties: exercise.sets.map((set) => set.difficulty),
                difficultyType,
              })}
            </Text>
          </View>
          <View style={exerciseStyles.rightActions}>
            <FontAwesome
              name="angle-right"
              color={useThemeColoring("lightText")}
              size={textTheme.large.fontSize}
            />
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  },
  areExercisePropsSame
);
