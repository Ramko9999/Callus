import {
  duplicateLastSet,
  removeExercise,
  removeSet,
  updateSet,
  useWorkoutActivity,
} from "@/context/WorkoutActivityContext";
import { View, TextInput, Text } from "../../Themed";
import { ExercisePlan, SetPlan, WorkoutActivityPlan } from "@/interface";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const styles = StyleSheet.create({
  setTile: {
    display: "flex",
    paddingTop: "2%",
    paddingBottom: "2%",
    flexDirection: "row",
    gap: 20,
    borderColor: "#3F4147",
    borderStyle: "solid",
    borderBottomWidth: 1,
    backgroundColor: "#27272F",
  },
  setTileMeta: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    backgroundColor: "#27272F",
  },
  setTileActions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#27272F",
    paddingRight: "2%",
    flexGrow: 1,
  },
  setTileAction: {
    padding: "4%",
    backgroundColor: "#27272F"
  },
  setTileMetaValue: {
    display: "flex",
    flexDirection: "row",
    gap: 2,
    backgroundColor: "#27272F",
  },
  setTileMetaValueText: {
    fontSize: 16,
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
    backgroundColor: "#27272F",
  },
  exerciseTileActions: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#27272F",
    paddingTop: "2%",
    gap: 10,
  },
  exerciseTileAction: {
    fontSize: 16,
    color: "lightblue",
  },
  exerciseTileActionDanger: {
    fontSize: 16,
    color: "#D1242F",
  },
  exerciseTileNameContainer: {
    borderColor: "#3F4147",
    borderStyle: "solid",
    borderBottomWidth: 1,
    backgroundColor: "#27272F",
    paddingBottom: "2%",
  },
  exerciseTileName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  workoutNameInput: {
    fontSize: 24,
    textAlign: "center",
    padding: "2%",
  },
});

type SetTileProps = { set: SetPlan };

function SetTile({ set }: SetTileProps) {
  const { editor } = useWorkoutActivity();
  const { weight, reps, id } = set;
  const { workoutPlan, actions } = editor;
  const onUpdateSet = (setPlanUpdate: Partial<SetPlan>) => {
    actions.updateWorkoutPlan(
      updateSet(id, setPlanUpdate, workoutPlan as WorkoutActivityPlan)
    );
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
    actions.updateWorkoutPlan(removeSet(id, workoutPlan as WorkoutActivityPlan));
  };

  return (
    <View style={styles.setTile}>
      {weight != undefined ? (
      <View style={styles.setTileMeta}>
        <Text>Weight</Text>
        <View style={styles.setTileMetaValue}>
          <TextInput
            keyboardType="number-pad"
            style={styles.setTileMetaValueText}
            value={weight?.toString()}
            onChangeText={onUpdateWeight}
          />
          <Text style={styles.setTileMetaValueText}> lbs</Text>
        </View>
      </View>): null}
      <View style={styles.setTileMeta}>
        <Text>Reps</Text>
        <View style={styles.setTileMetaValue}>
          <TextInput
            keyboardType="number-pad"
            style={styles.setTileMetaValueText}
            value={reps?.toString()}
            onChangeText={onUpdateReps}
          />
          <Text style={styles.setTileMetaValueText}> reps</Text>
        </View>
      </View>
      <View style={styles.setTileActions}>
        <TouchableOpacity onPress={onRemoveSet}>
          <View style={styles.setTileAction}>
          <FontAwesome name={"minus"} color={"white"} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type ExerciseTileProps = { exercise: ExercisePlan };

function ExerciseTile({ exercise }: ExerciseTileProps) {
  const {editor} = useWorkoutActivity();
  const {workoutPlan, actions} = editor;
  const {id, sets, name} = exercise;

  const onAddSet = () => {
    actions.updateWorkoutPlan(duplicateLastSet(id, workoutPlan as WorkoutActivityPlan))
  }

  const onRemoveExercise = () => {
    actions.updateWorkoutPlan(removeExercise(id, workoutPlan as WorkoutActivityPlan))
  }

  return (
    <View style={styles.exerciseTile}>
      <View style={styles.exerciseTileNameContainer}>
        <Text style={styles.exerciseTileName}>{name}</Text>
      </View>
      {sets.map((set, index) => {
        return <SetTile key={index} set={set} />;
      })}
      <View style={styles.exerciseTileActions}>
        <TouchableOpacity onPress={onAddSet}>
          <Text style={styles.exerciseTileAction}>Add set</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRemoveExercise}>
          <Text style={styles.exerciseTileActionDanger}>Remove exercise</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function WorkoutEditor() {
  const { editor } = useWorkoutActivity();
  const { workoutPlan, actions } = editor;

  return (
    <ScrollView>
        <TextInput
          style={styles.workoutNameInput}
          value={workoutPlan && workoutPlan.name}
          onChangeText={(text) => {actions.updateWorkoutPlan({...workoutPlan as WorkoutActivityPlan, name: text})}}
          placeholder="Workout Name"
        />
      <View style={styles.exerciseTilesContainer}>
        {workoutPlan?.exercises.map((exercise, index) => {
          return <ExerciseTile key={index} exercise={exercise} />;
        })}
      </View>
    </ScrollView>
  );
}
