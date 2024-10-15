import {
  addExercise,
  duplicateLastSet,
  removeExercise,
  removeSet,
  updateSet,
  useWorkout,
} from "@/context/WorkoutContext";
import { View, TextInput, Text, Action, Icon } from "../../Themed";
import { Exercise, ExerciseMeta, Set, Workout } from "@/interface";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { ExerciseFinder } from "../exercise";
import { EXERCISE_REPOSITORY } from "@/constants";
import { useState } from "react";

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
  addExerciseAction: {
    alignSelf: "center",
    paddingBottom: "4%",
  },
  exerciseFinderContainer: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
});

type SetTileProps = { set: Set };

function SetTile({ set }: SetTileProps) {
  const { editor } = useWorkout();
  const { weight, reps, id } = set;
  const { workout, actions } = editor;
  const onUpdateSet = (setPlanUpdate: Partial<Set>) => {
    actions.updateWorkout(updateSet(id, setPlanUpdate, workout as Workout));
  };
  const onUpdateWeight = (weight: string) => {
    const newWeight = weight.trim().length > 0 ? parseInt(weight) : 0;
    onUpdateSet({ weight: newWeight });
  };

  const onUpdateReps = (reps: string) => {
    const newReps = reps.trim().length > 0 ? parseInt(reps) : 0;
    onUpdateSet({ reps: newReps });
  };

  const onRemoveSet = () => {
    actions.updateWorkout(removeSet(id, workout as Workout));
  };

  return (
    <View style={styles.setTile}>
      {weight != undefined ? (
        <View style={styles.setTileMeta}>
          <Text _type="small">Weight</Text>
          <View style={styles.setTileMetaValue}>
            <TextInput
              _type="neutral"
              keyboardType="number-pad"
              value={weight?.toString()}
              onChangeText={onUpdateWeight}
            />
            <Text _type="neutral"> lbs</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.setTileMeta}>
        <Text _type="small">Reps</Text>
        <View style={styles.setTileMetaValue}>
          <TextInput
            _type="neutral"
            keyboardType="number-pad"
            value={reps?.toString()}
            onChangeText={onUpdateReps}
          />
          <Text _type="neutral"> reps</Text>
        </View>
      </View>
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

type ExerciseTileProps = { exercise: Exercise };

function ExerciseTile({ exercise }: ExerciseTileProps) {
  const { editor } = useWorkout();
  const { workout, actions } = editor;
  const { id, sets, name } = exercise;

  const onAddSet = () => {
    actions.updateWorkout(duplicateLastSet(id, workout as Workout));
  };

  const onRemoveExercise = () => {
    actions.updateWorkout(removeExercise(id, workout as Workout));
  };

  return (
    <View style={styles.exerciseTile}>
      <View style={styles.exerciseTileNameContainer}>
        <Text _type="emphasized">{name}</Text>
      </View>
      {sets.map((set, index) => {
        return <SetTile key={index} set={set} />;
      })}
      <View style={styles.exerciseTileActions}>
        <Action
          _action={{ name: "Add set", type: "neutral" }}
          onPress={onAddSet}
        />
        <Action
          _action={{ name: "Remove exercise", type: "danger" }}
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
        <View style={styles.exerciseFinderContainer}>
          <ExerciseFinder
            onSelect={(exerciseMeta) => onSelectExercise(exerciseMeta)}
            onCancel={onClose}
            allExercises={EXERCISE_REPOSITORY}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export function WorkoutEditor() {
  const [showExerciseFinder, setShowExerciseFinder] = useState(false);
  const { editor } = useWorkout();
  const { workout, actions } = editor;

  // todo: the below isn't UI correct, but moves the element above the keyboard at least.
  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100}>
      <ScrollView style={styles.exerciseScrollView}>
        <TextInput
          _type="large"
          style={styles.workoutNameInput}
          value={workout && workout.name}
          onChangeText={(text) => {
            actions.updateWorkout({
              ...(workout as Workout),
              name: text,
            });
          }}
          placeholder="Workout Name"
        />
        <View _type="background" style={styles.exerciseTilesContainer}>
          {workout?.exercises.map((exercise, index) => {
            return <ExerciseTile key={index} exercise={exercise} />;
          })}
        </View>
        <Action
          _action={{ name: "Add exercise", type: "neutral" }}
          style={styles.addExerciseAction}
          onPress={() => setShowExerciseFinder(true)}
        />
      </ScrollView>
      <ExerciseFinderModal
        shouldShow={showExerciseFinder}
        onClose={() => {
          setShowExerciseFinder(false);
        }}
        onSelectExercise={(exerciseMeta) => {
          actions.updateWorkout(addExercise(exerciseMeta, workout as Workout));
          setShowExerciseFinder(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}
