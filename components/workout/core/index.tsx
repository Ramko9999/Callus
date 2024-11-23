import { useThemeColoring, View, Text, TextInput } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import {
  Difficulty,
  DifficultyType,
  Exercise,
  ExerciseMeta,
  Set,
  SetStatus,
  Workout,
  WorkoutMetadata,
} from "@/interface";
import { getLongDateDisplay } from "@/util/date";
import {
  EDITOR_EXERCISE_HEIGHT,
  EDITOR_SET_HEIGHT,
  StyleUtils,
} from "@/util/styles";
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";
import { WorkoutSummary } from "@/components/workout/view";
import { DifficultyInput, SetStatusInput } from "./inputs";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SwipeableDelete } from "./utils";
import { useEffect, useState } from "react";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const workoutTitleMetaStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    paddingLeft: "3%",
  },
});

type MetaEditor = {
  workout: Workout;
  onUpdateMeta: (meta: Partial<WorkoutMetadata>) => void;
  onDateClick: () => void;
};
export function MetaEditor({ workout, onUpdateMeta, onDateClick }: MetaEditor) {
  const { name, startedAt } = workout;

  const [workoutName, setWorkoutName] = useState(name);

  return (
    <View style={workoutTitleMetaStyles.container}>
      <TextInput
        extraLarge
        value={workoutName}
        onChangeText={(name) => {
          setWorkoutName(name);
        }}
        onEndEditing={() => {
          if (workoutName.trim().length > 0) {
            onUpdateMeta({ name: workoutName.trim() });
          } else {
            setWorkoutName(name);
          }
        }}
      />
      <TouchableOpacity onPress={onDateClick}>
        <Text neutral light>
          {getLongDateDisplay(startedAt, true)}
        </Text>
      </TouchableOpacity>
      <WorkoutSummary workout={workout} />
    </View>
  );
}
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

type ReorderableExerciseProps = {
  exercise: Exercise;
  onClickDown: () => void;
};

export function ReorderableExercise({
  exercise,
  onClickDown,
}: ReorderableExerciseProps) {
  return (
    <View background style={editorExerciseStyles.container}>
      <View style={editorExerciseStyles.title}>
        <Text large>{exercise.name}</Text>
        <Text neutral light>
          {getSubtitle(exercise)}
        </Text>
      </View>
      <View style={editorExerciseStyles.rightActions}>
        <TouchableOpacity onPressIn={onClickDown}>
          <FontAwesome
            name="reorder"
            color={useThemeColoring("lightText")}
            size={textTheme.large.fontSize}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ExercisePlaceholder() {
  return (
    <View
      style={[
        editorExerciseStyles.container,
        { backgroundColor: useThemeColoring("search") },
      ]}
    ></View>
  );
}

const editorSetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    height: EDITOR_SET_HEIGHT,
  },
});

type EditorSetProps = {
  set: Set;
  difficultyType: DifficultyType;
  onTrash: () => void;
  onUpdate: (update: Partial<Set>) => void;
  animate?: boolean;
};

export function EditorSet({
  set,
  difficultyType,
  onTrash,
  onUpdate,
  animate,
}: EditorSetProps) {
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
      renderRightActions={(_, drag) => (
        <SwipeableDelete
          drag={drag}
          onDelete={onTrash}
          dimension={EDITOR_SET_HEIGHT}
        />
      )}
      overshootRight={false}
    >
      <Animated.View
        style={[editorSetStyles.container, animate ? animatedStyle : {}]}
      >
        <SetStatusInput
          set={set}
          isOn={set.status === SetStatus.FINISHED}
          onToggle={() => {
            if (set.status === SetStatus.FINISHED) {
              onUpdate({
                status: SetStatus.UNSTARTED,
                restStartedAt: undefined,
                restEndedAt: undefined,
              });
            } else if (set.status === SetStatus.RESTING) {
              onUpdate({ status: SetStatus.FINISHED, restEndedAt: Date.now() });
            } else {
              onUpdate({ status: SetStatus.FINISHED });
            }
          }}
        />
        <DifficultyInput
          id={set.id}
          difficulty={set.difficulty}
          type={difficultyType}
          onUpdate={(difficulty: Difficulty) => onUpdate({ difficulty })}
        />
      </Animated.View>
    </Swipeable>
  );
}

const finderExerciseStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingVertical: "3%",
  },
  tags: {
    ...StyleUtils.flexRow(5),
    flexWrap: "wrap",
  },
  tag: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: "2%",
    paddingVertical: "1%",
  },
});

type FinderExerciseProps = {
  meta: ExerciseMeta;
  onClick: () => void;
};

export function FinderExercise({ meta, onClick }: FinderExerciseProps) {
  const { name, muscles } = meta;

  return (
    <TouchableOpacity onPress={onClick}>
      <View style={finderExerciseStyles.container}>
        <Text large>{name}</Text>
        <View style={finderExerciseStyles.tags}>
          {muscles.sort().map((muscle, index) => (
            <View key={index} background style={finderExerciseStyles.tag}>
              <Text neutral light>
                {muscle}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}
