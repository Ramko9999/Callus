import {
  addExercise,
  areWorkoutsSame,
  duplicateLastSet,
  finishAllRestingSets,
  removeExercise,
  removeSet,
  reorderExercises,
  updateSet,
} from "@/context/WorkoutContext";
import { View, TextInput, Text, Action, Icon } from "../../Themed";
import {
  DifficultyType,
  Exercise,
  ExerciseMeta,
  Set,
  SetStatus,
  Workout,
} from "@/interface";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Modal,
  TouchableWithoutFeedback,
  Button,
} from "react-native";
import { ExerciseFinder } from "../exercise";
import { EXERCISE_REPOSITORY, NAME_TO_EXERCISE_META } from "@/constants";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DifficultyUpdate, SetStatusUpdate } from "./update";
import { DatetimePicker } from "./datetime-picker";
import { ExerciseShuffler } from "./exercise-shuffler";
import { useNavigation } from "expo-router";
import { useToast } from "react-native-toast-notifications";

const styles = StyleSheet.create({
  setTile: {
    display: "flex",
    paddingTop: "2%",
    paddingBottom: "2%",
    flexDirection: "row",
    gap: 20,
    borderStyle: "solid",
    borderBottomWidth: 1,
  },
  setTileMeta: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  setTileActions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: "2%",
    flexGrow: 1,
  },
  setTileAction: {
    padding: "4%",
  },
  setTileMetaValue: {
    display: "flex",
    flexDirection: "row",
    gap: 2,
  },
  exerciseTilesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "2%",
  },
  exerciseTile: {
    borderRadius: 10,
    padding: "2%",
  },
  exerciseTileActions: {
    display: "flex",
    flexDirection: "row",
    paddingTop: "2%",
    gap: 10,
  },
  exerciseTileNameContainer: {
    borderStyle: "solid",
    borderBottomWidth: 1,
    paddingBottom: "2%",
  },
  exerciseScrollView: {
    display: "flex",
    flexDirection: "column",
  },
  workoutNameInput: {
    textAlign: "center",
    padding: "2%",
  },
  editorActions: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  editorAction: {
    alignSelf: "center",
    paddingBottom: "4%",
  },
  modalBackground: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  workoutMetaEditor: {
    display: "flex",
    flexDirection: "column",
  },
});

type SetTileProps = {
  set: Set;
  difficultyType: DifficultyType;
  workout: Workout;
  onUpdateWorkout: (update: Partial<Workout>) => void;
};

function SetTile({
  set,
  difficultyType,
  workout,
  onUpdateWorkout,
}: SetTileProps) {
  const { id, difficulty, status } = set;
  const onUpdateSet = (setPlanUpdate: Partial<Set>) => {
    onUpdateWorkout(updateSet(id, setPlanUpdate, workout as Workout));
  };

  const onRemoveSet = () => {
    onUpdateWorkout(removeSet(id, workout as Workout));
  };

  return (
    <View style={styles.setTile}>
      <SetStatusUpdate
        status={status}
        onToggle={() => {
          if (status === SetStatus.UNSTARTED) {
            onUpdateWorkout(
              updateSet(id, { status: SetStatus.FINISHED }, workout as Workout)
            );
          } else if (status === SetStatus.RESTING) {
            onUpdateWorkout(
              updateSet(
                id,
                { status: SetStatus.FINISHED, restEndedAt: Date.now() },
                workout as Workout
              )
            );
          } else {
            onUpdateWorkout(
              updateSet(
                id,
                {
                  status: SetStatus.UNSTARTED,
                  restStartedAt: undefined,
                  restEndedAt: undefined,
                },
                workout as Workout
              )
            );
          }
        }}
      />
      <DifficultyUpdate
        type={difficultyType}
        difficulty={difficulty}
        onUpdateDifficulty={(difficulty) => onUpdateSet({ difficulty })}
      />
      <View style={styles.setTileActions}>
        <TouchableOpacity onPress={onRemoveSet}>
          <View style={styles.setTileAction}>
            <Icon name={"minus"} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type ExerciseTileProps = {
  exercise: Exercise;
  workout: Workout;
  onUpdateWorkout: (update: Partial<Workout>) => void;
};

function ExerciseTile({
  exercise,
  onUpdateWorkout,
  workout,
}: ExerciseTileProps) {
  const { id, sets, name } = exercise;

  const onAddSet = () => {
    onUpdateWorkout(duplicateLastSet(id, workout));
  };

  const onRemoveExercise = () => {
    onUpdateWorkout(removeExercise(id, workout));
  };

  return (
    <View style={styles.exerciseTile}>
      <View style={styles.exerciseTileNameContainer}>
        <Text _type="emphasized">{name}</Text>
      </View>
      {sets.map((set, index) => {
        return (
          <SetTile
            key={index}
            set={set}
            difficultyType={
              (NAME_TO_EXERCISE_META.get(name) as ExerciseMeta).difficultyType
            }
            workout={workout}
            onUpdateWorkout={onUpdateWorkout}
          />
        );
      })}
      <View style={styles.exerciseTileActions}>
        <Action _action={{ name: "Add", type: "neutral" }} onPress={onAddSet} />
        <Action
          _action={{ name: "Remove", type: "danger" }}
          onPress={onRemoveExercise}
        />
      </View>
    </View>
  );
}

type ExerciseFinderModalProps = {
  shouldShow: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseMeta: ExerciseMeta) => void;
};

function ExerciseFinderModal({
  shouldShow,
  onClose,
  onSelectExercise,
}: ExerciseFinderModalProps) {
  return (
    <Modal
      transparent={true}
      onRequestClose={onClose}
      visible={shouldShow}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback
            onPress={(event) => {
              event.stopPropagation();
            }}
          >
            <ExerciseFinder
              onSelect={(exerciseMeta) => onSelectExercise(exerciseMeta)}
              onCancel={onClose}
              allExercises={EXERCISE_REPOSITORY}
            />
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

type ExerciseShufflerModalProps = {
  shouldShow: boolean;
  onClose: () => void;
  exerciseOrder: string[];
  onShuffle: (newExerciseOrder: string[]) => void;
};

function ExerciseShufflerModal({
  shouldShow,
  onClose,
  exerciseOrder,
  onShuffle,
}: ExerciseShufflerModalProps) {
  return (
    <Modal
      transparent={true}
      onRequestClose={onClose}
      visible={shouldShow}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback
            onPress={(event) => event.stopPropagation()}
          >
            <ExerciseShuffler
              onShuffle={onShuffle}
              exerciseOrder={exerciseOrder}
            />
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

type WorkoutMetaEditorProps = {
  name: string;
  startedAt: number;
  endedAt?: number;
  onUpdate: (update: Partial<Workout>) => void;
};
function WorkoutMetaEditor({
  name,
  startedAt,
  endedAt,
  onUpdate,
}: WorkoutMetaEditorProps) {
  // todo: rethink how to store the workouts since changing start times may require writing and reading across partitions
  // todo: fix the datepicker on android as it is broken totally
  return (
    <View style={styles.workoutMetaEditor}>
      <TextInput
        _type="neutral"
        style={styles.workoutNameInput}
        value={name}
        onChangeText={(text) => {
          onUpdate({ name: text });
        }}
        placeholder="Workout Name"
      />

      <DatetimePicker
        value={startedAt}
        onUpdate={(startedAt) => onUpdate({ startedAt })}
      />
      <DatetimePicker
        value={endedAt || Date.now()}
        onUpdate={(endedAt) => onUpdate({ endedAt })}
      />
    </View>
  );
}

type WorkoutEditorProps = {
  workout: Workout;
  onSaveWorkout: (updated: Workout) => void;
};

export function WorkoutEditor({ workout, onSaveWorkout }: WorkoutEditorProps) {
  const initialWorkout = useRef(workout);
  const [updatedWorkout, setUpdatedWorkout] = useState<Workout>(workout);
  const navigation = useNavigation();
  const toast = useToast();

  useEffect(() => {
    navigation.setOptions({
      title: "Edit",
      headerRight: () => (
        <Button
          title="Save"
          onPress={() => {
            const unstartedSets = updatedWorkout.exercises
              .flatMap(({ sets }) => sets)
              .filter(({ status }) => status === SetStatus.UNSTARTED);
            if (updatedWorkout.endedAt && unstartedSets.length > 0) {
              console.log("Failed to save");
              toast.show(
                `Failed to save: there are ${unstartedSets.length} sets unstarted`,
                { type: "danger" }
              );
            } else {
              onSaveWorkout(finishAllRestingSets(updatedWorkout));
            }
          }}
          disabled={areWorkoutsSame(initialWorkout.current, updatedWorkout)}
        />
      ),
    });
  }, [updatedWorkout, navigation]);

  const onUpdateWorkout = useCallback(
    (update: Partial<Workout>) => {
      setUpdatedWorkout((_updatedWorkout) => ({
        ..._updatedWorkout,
        ...update,
      }));
    },
    [setUpdatedWorkout]
  );

  const [showExerciseFinder, setShowExerciseFinder] = useState(false);
  const [showExerciseShuffler, setShowExerciseShuffler] = useState(false);
  const { name, startedAt, endedAt } = updatedWorkout;

  // todo: fix the weird padding introduced by keyboard avoiding view
  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100}>
      <ScrollView style={styles.exerciseScrollView}>
        <WorkoutMetaEditor
          name={name}
          startedAt={startedAt}
          endedAt={endedAt}
          onUpdate={onUpdateWorkout}
        />
        <View _type="background" style={styles.exerciseTilesContainer}>
          {updatedWorkout?.exercises.map((exercise, index) => {
            return (
              <ExerciseTile
                key={index}
                exercise={exercise}
                onUpdateWorkout={onUpdateWorkout}
                workout={updatedWorkout}
              />
            );
          })}
        </View>
        <View _type="background" style={styles.editorActions}>
          <Action
            _action={{ name: "Add", type: "neutral" }}
            style={styles.editorAction}
            onPress={() => setShowExerciseFinder(true)}
          />
          <Action
            _action={{ name: "Reorder", type: "neutral" }}
            style={styles.editorAction}
            onPress={() => setShowExerciseShuffler(true)}
          />
        </View>
      </ScrollView>
      <ExerciseFinderModal
        shouldShow={showExerciseFinder}
        onClose={() => {
          setShowExerciseFinder(false);
        }}
        onSelectExercise={(exerciseMeta) => {
          onUpdateWorkout(addExercise(exerciseMeta, updatedWorkout as Workout));
          setShowExerciseFinder(false);
        }}
      />
      <ExerciseShufflerModal
        shouldShow={showExerciseShuffler}
        onClose={() => setShowExerciseShuffler(false)}
        exerciseOrder={updatedWorkout.exercises.map(({ name }) => name)}
        onShuffle={(newExerciseOrder) =>
          onUpdateWorkout(reorderExercises(updatedWorkout, newExerciseOrder))
        }
      />
    </KeyboardAvoidingView>
  );
}
