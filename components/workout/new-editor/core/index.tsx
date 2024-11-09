import { useThemeColoring, View, Text } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import { Exercise, ExerciseMeta, Set, SetStatus, Workout } from "@/interface";
import { getLongDateDisplay } from "@/util";
import { StyleUtils } from "@/util/styles";
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { WorkoutSummary } from "@/components/workout/view";
import { Add } from "./icons";
import { DifficultyInput, ToggleInput } from "./inputs";
import { NAME_TO_EXERCISE_META } from "@/constants";

const editorTitleMetaStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    paddingLeft: "3%",
  },
});

type EditorTitleMetaProps = {
  workout: Workout;
};
export function EditorTitleMeta({ workout }: EditorTitleMetaProps) {
  const { name, startedAt } = workout;

  return (
    <View style={editorTitleMetaStyles.container}>
      <Text extraLarge>{name}</Text>
      <Text neutral light>
        {getLongDateDisplay(startedAt, true)}
      </Text>
      <WorkoutSummary workout={workout} />
    </View>
  );
}

const setTitleMetaStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
  },
});

type SetTitleMetaProps = {
  exercise: Exercise;
};

export function SetTitleMeta({ exercise }: SetTitleMetaProps) {
  return (
    <View style={setTitleMetaStyles.container}>
      <Text extraLarge>{exercise.name}</Text>
    </View>
  );
}

const editorExerciseStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    paddingVertical: "3%",
    paddingLeft: "3%",
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

export function EditorExercise({ exercise, onClick }: EditorExerciseProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={editorExerciseStyles.container}>
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
      </View>
    </TouchableOpacity>
  );
}

const addExerciseStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    paddingVertical: "3%",
    paddingLeft: "2%",
  },
  title: {
    ...StyleUtils.flexRowCenterAll(),
  },
});

type AddExerciseProps = {
  onClick: () => void;
};

export function AddExercise({ onClick }: AddExerciseProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={addExerciseStyles.container}>
        <Add />
        <View style={addExerciseStyles.title}>
          <Text large>Add Exercise</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const editorSetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
  },
});

type EditorSetProps = {
  set: Set;
  exercise: Exercise;
};

export function EditorSet({ set, exercise }: EditorSetProps) {
  const { difficultyType } = NAME_TO_EXERCISE_META.get(
    exercise.name
  ) as ExerciseMeta;

  return (
    <View style={editorSetStyles.container}>
      <ToggleInput isOn={set.status === SetStatus.FINISHED} />
      <DifficultyInput
        id={set.id}
        difficulty={set.difficulty}
        type={difficultyType}
      />
    </View>
  );
}
