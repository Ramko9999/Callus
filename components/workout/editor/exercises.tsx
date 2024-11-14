import { TextInput, useThemeColoring, View } from "@/components/Themed";
import { Exercise, ExerciseMeta, Workout } from "@/interface";
import {
  WORKOUT_PLAYER_EDITOR_HEIGHT,
  StyleUtils,
  EDITOR_EXERCISE_HEIGHT,
} from "@/util/styles";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Add, Back, Close, Edit, Search, Trash } from "../core/actions";
import { EditorExercise, FinderExercise, WorkoutTitleMeta } from "../core";
import { ScrollView } from "react-native";
import { useCallback, useState } from "react";
import { WorkoutDeleteConfirmation } from "./confirmations";
import { BottomSheet } from "@/components/bottom-sheet";
import { EXERCISE_REPOSITORY } from "@/constants";

const exerciseFinderStyle = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
  },
  actions: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  content: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "3%",
  },
  input: {
    ...StyleUtils.flexRow(5),
    borderWidth: 1,
    borderRadius: 25,
    alignSelf: "center",
    width: "90%",
  },
  scroll: {
    paddingBottom: "5%",
  },
  results: {
    ...StyleUtils.flexColumn(5),
  },
});

type ExerciseFinderProps = {
  repository: ExerciseMeta[];
  show: boolean;
  hide: () => void;
  onSelect: (exerciseMeta: ExerciseMeta) => void;
};

export function ExerciseFinder({
  show,
  repository,
  hide,
  onSelect,
}: ExerciseFinderProps) {
  const [search, setSearch] = useState("");
  const { height } = useWindowDimensions();

  return (
    <BottomSheet show={show} onBackdropPress={hide} hide={hide}>
      <View background style={exerciseFinderStyle.container}>
        <View style={exerciseFinderStyle.actions}>
          <Back onClick={hide} />
        </View>
        <View
          style={[
            exerciseFinderStyle.content,
            { height: height * WORKOUT_PLAYER_EDITOR_HEIGHT },
          ]}
        >
          <View
            style={[
              exerciseFinderStyle.input,
              { borderColor: useThemeColoring("lightText") },
            ]}
          >
            <Search />
            <TextInput
              action
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={useThemeColoring("lightText")}
              placeholder="Search exercise"
            />
          </View>
          <ScrollView contentContainerStyle={exerciseFinderStyle.scroll}>
            <View style={exerciseFinderStyle.results}>
              {repository
                .filter((meta) => meta.name.includes(search))
                .map((meta, index) => (
                  <FinderExercise
                    key={index}
                    meta={meta}
                    onClick={() => onSelect(meta)}
                  />
                ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </BottomSheet>
  );
}

const exercisesEditorStyle = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
  },
  actions: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    paddingRight: "3%",
  },
  content: {
    ...StyleUtils.flexColumn(10),
    paddingLeft: "3%",
  },
  scroll: {
    paddingBottom: "5%",
  },
});

type ExercisesEditorProps = {
  onAdd: (meta: ExerciseMeta) => void;
  onRemove: (exercise: Exercise) => void;
  onShuffle: () => void;
  onEdit: (exercise: Exercise) => void;
  onEditMeta: () => void;
  hide: () => void;
  trash: () => void;
  workout: Workout;
};

export function ExercisesEditor({
  hide,
  onEditMeta,
  onEdit,
  onRemove,
  onAdd,
  trash,
  workout,
}: ExercisesEditorProps) {
  const [showWorkoutDeleteConfirmation, setShowWorkoutDeleteConfirmation] =
    useState(false);

  const [showExerciseFinder, setShowExerciseFinder] = useState(false);

  const { height } = useWindowDimensions();
  return (
    <View background style={exercisesEditorStyle.container}>
      <View style={exercisesEditorStyle.actions}>
        <Close onClick={hide} />
        <View style={exercisesEditorStyle.rightActions}>
          <Edit onClick={onEditMeta} />
          <Add onClick={() => setShowExerciseFinder(true)} />
          <Trash onClick={() => setShowWorkoutDeleteConfirmation(true)} />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={exercisesEditorStyle.scroll}
        style={{ height: height * WORKOUT_PLAYER_EDITOR_HEIGHT }}
      >
        <View style={exercisesEditorStyle.content}>
          <WorkoutTitleMeta workout={workout} />
          {workout.exercises.map((exercise, index) => (
            <EditorExercise
              key={index}
              exercise={exercise}
              onClick={() => onEdit(exercise)}
              onTrash={() => onRemove(exercise)}
            />
          ))}
        </View>
      </ScrollView>
      <ExerciseFinder
        show={showExerciseFinder}
        hide={() => setShowExerciseFinder(false)}
        repository={EXERCISE_REPOSITORY}
        onSelect={(meta) => {
          onAdd(meta);
          setShowExerciseFinder(false);
        }}
      />
      <WorkoutDeleteConfirmation
        show={showWorkoutDeleteConfirmation}
        hide={() => setShowWorkoutDeleteConfirmation(false)}
        onDelete={() => {
          setShowWorkoutDeleteConfirmation(false);
          trash();
        }}
      />
    </View>
  );
}
