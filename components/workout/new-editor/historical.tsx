import { Workout } from "@/interface";
import { View } from "@/components/Themed";
import { Dimensions, ScrollView, StyleSheet } from "react-native";
import {
  AddExercise,
  Close,
  Edit,
  EditorExercise,
  EditorTitleMeta,
  Trash,
} from "./common";
import { StyleUtils } from "@/util/styles";
import { BottomSheet } from "@/components/bottom-sheet";

const historicalEditorActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingTop: "3%",
  },
  allActions: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
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
      <View style={historicalEditorActionsStyles.allActions}>
        <Close onClick={onExit} />
        <View style={historicalEditorActionsStyles.rightActions}>
          <Edit onClick={onEditClick} />
          <Trash onClick={onTrash} />
        </View>
      </View>
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
  return (
    <View style={historicalEditorStyles.container}>
      <HistoricalEditorActions
        onEditClick={() => {}}
        onExit={hide}
        onTrash={() => {}}
      />
      <View
        style={[
          historicalEditorStyles.content,
          { height: Dimensions.get("screen").height * 0.7 },
        ]}
      >
        <ScrollView>
          <EditorTitleMeta workout={workout} />
          {workout.exercises.map((exercise, index) => (
            <EditorExercise
              key={index}
              exercise={exercise}
              onClick={() => {}}
            />
          ))}
          <AddExercise onClick={() => {}} />
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
