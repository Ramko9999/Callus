import { Exercise, ExerciseMeta, Workout } from "@/interface";
import { View, Text } from "@/components/Themed";
import { Dimensions, StyleSheet } from "react-native";
import {
  AddExercise,
  EditorExercise,
  EditorSet,
  EditorTitleMeta,
  SetTitleMeta,
} from "@/components/workout/new-editor/core";
import { StyleUtils } from "@/util/styles";
import { BottomSheet } from "@/components/bottom-sheet";
import { ScrollView } from "react-native-gesture-handler";
import { useState } from "react";
import { DifficultyUpdate } from "../editor/update";
import { NAME_TO_EXERCISE_META } from "@/constants";
import { Back, Close, Edit, Trash } from "./core/icons";
import { DifficultyInput } from "./core/inputs";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";

const historicalEditorActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
    paddingTop: "3%",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    paddingRight: "3%",
  },
});

type HistoricalEditorActionsProps = {
  onExit: () => void;
  onEditClick: () => void;
  onTrash: () => void;
};

function HistoricalEditorActions({
  onExit,
  onEditClick,
  onTrash,
}: HistoricalEditorActionsProps) {
  return (
    <View style={historicalEditorActionsStyles.container}>
      <Close onClick={onExit} />
      <View style={historicalEditorActionsStyles.rightActions}>
        <Edit onClick={onEditClick} />
        <Trash onClick={onTrash} />
      </View>
    </View>
  );
}

const historicalExerciseEditorActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    paddingTop: "3%",
  },
});

type HistoricalExerciseEditorActionsProps = {
  onBack: () => void;
};

function HistoricalExerciseEditorActions({
  onBack,
}: HistoricalExerciseEditorActionsProps) {
  return (
    <View style={historicalExerciseEditorActionsStyles.container}>
      <Back onClick={onBack} />
    </View>
  );
}

type HistoricalExercisesOverviewProps = {
  workout: Workout;
  onClickExercise: (exercise: Exercise) => void;
};

function HistoricalExercisesOverview({
  workout,
  onClickExercise,
}: HistoricalExercisesOverviewProps) {
  return (
    <>
      <EditorTitleMeta workout={workout} />
      {workout.exercises.map((exercise, index) => (
        <EditorExercise
          key={index}
          exercise={exercise}
          onClick={() => onClickExercise(exercise)}
        />
      ))}
      <AddExercise onClick={() => {}} />
    </>
  );
}

const historicalSetOverviewStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingLeft: "3%",
  },
});

type HistoricalSetOverviewProps = {
  exercise: Exercise;
};

function HistoricalSetOverview({ exercise }: HistoricalSetOverviewProps) {
  return (
    <View style={historicalSetOverviewStyles.container}>
      <SetTitleMeta exercise={exercise} />
      {exercise.sets.map((set, index) => (
        <EditorSet key={index} set={set} exercise={exercise} />
      ))}
    </View>
  );
}

const historicalEditorStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  content: {
    ...StyleUtils.flexColumn(10),
  },
});

type HistoricalEditorProps = {
  workout: Workout;
  hide: () => void;
  onSaveWorkout: (workout: Workout) => void;
};

function HistoricalEditor({
  workout,
  hide,
  onSaveWorkout,
}: HistoricalEditorProps) {
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise>();
  const isEditingExercise = exerciseToEdit != undefined;

  return (
    <View background style={historicalEditorStyles.container}>
      {isEditingExercise ? (
        <HistoricalExerciseEditorActions
          onBack={() => setExerciseToEdit(undefined)}
        />
      ) : (
        <HistoricalEditorActions
          onEditClick={() => {}}
          onExit={hide}
          onTrash={() => {}}
        />
      )}
      <View
        style={[
          historicalEditorStyles.content,
          { height: Dimensions.get("screen").height * 0.7 },
        ]}
      >
        <ScrollView>
          {isEditingExercise ? (
            <Animated.View entering={FadeInLeft}>
              <HistoricalSetOverview exercise={exerciseToEdit} />
            </Animated.View>
          ) : (
            <HistoricalExercisesOverview
              workout={workout}
              onClickExercise={(exercise) => setExerciseToEdit(exercise)}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}

type HistoricalEditorPopupProps = {
  show: boolean;
  hide: () => void;
  workout: Workout;
  onSaveWorkout: (workout: Workout) => void;
};

export function HistoricalEditorPopup({
  show,
  hide,
  workout,
  onSaveWorkout,
}: HistoricalEditorPopupProps) {
  return (
    <BottomSheet show={show} onBackdropPress={hide} hide={hide}>
      <HistoricalEditor
        workout={workout}
        onSaveWorkout={onSaveWorkout}
        hide={hide}
      />
    </BottomSheet>
  );
}
