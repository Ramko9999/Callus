import { useThemeColoring, View, Text } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import { Exercise, SetStatus, Workout } from "@/interface";
import { getLongDateDisplay } from "@/util";
import { StyleUtils } from "@/util/styles";
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { WorkoutSummary } from "../view";

const iconActionStyles = StyleSheet.create({
  container: {
    height: 45,
    width: 45,
    borderRadius: 22,
    ...StyleUtils.flexRowCenterAll(),
  },
});

type IconActionProps = {
  onClick: () => void;
  style?: ViewStyle;
};

export function Trash({ onClick, style }: IconActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("dangerAction") },
          style,
        ]}
      >
        <FontAwesome
          name="trash"
          size={textTheme.large.fontSize}
          color={"white"}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Edit({ onClick, style }: IconActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="pencil"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Close({ onClick, style }: IconActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="close"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

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
  statusOuterRing: {
    ...StyleUtils.flexRowCenterAll(),
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
  },
  statusInnerRing: {
    ...StyleUtils.flexRowCenterAll(),
    width: 45,
    height: 45,
    borderRadius: 23,
    borderWidth: 1,
  },
});

function AddExerciseAction() {
  return (
    <View style={editorExerciseStyles.statusOuterRing}>
      <FontAwesome
        name="plus"
        size={textTheme.large.fontSize}
        color={useThemeColoring("lightText")}
      />
    </View>
  );
}

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
        <AddExerciseAction />
        <View style={addExerciseStyles.title}>
          <Text large>Add Exercise</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
