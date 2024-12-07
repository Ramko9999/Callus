import { WorkoutPlan } from "@/interface";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { View, Text, Icon } from "@/components/Themed";
import {
  PAUSE_LEG,
  PUSH,
  PULL,
  NORMAL_LEG,
  VOLUME_PULL,
  VOLUME_PUSH,
  FUNCTIONAL_LEG,
  NECK,
} from "@/constants/SampleWorkouts";
import { createWorkoutFromPlan, useWorkout } from "@/context/WorkoutContext";
import { useRouter } from "expo-router";
import { DynamicHeaderPage } from "@/components/util/dynamic-header-page";

const PLANS = [
  PUSH,
  PULL,
  NORMAL_LEG,
  PAUSE_LEG,
  VOLUME_PULL,
  VOLUME_PUSH,
  FUNCTIONAL_LEG,
  NECK,
];

const styles = StyleSheet.create({
  workoutViewTileContainer: {
    borderRadius: 2,
    borderWidth: 1,
    width: "80%",
    paddingTop: "2%",
  },
  workoutViewTile: {
    padding: 8,
  },
  workoutViewExerciseList: {
    marginTop: 5,
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  workoutViewTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  workoutPlans: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "2%",
  },
});

type WorkoutPlanProps = {
  workoutPlan: WorkoutPlan;
};

function WorkoutPlanTile({ workoutPlan }: WorkoutPlanProps) {
  const { actions, isInWorkout } = useWorkout();
  const router = useRouter();

  // todo: show alert or modal to show that you are presently in a workout
  return (
    <View style={styles.workoutViewTileContainer}>
      <TouchableOpacity
        onPress={() => {
          if (isInWorkout) {
            console.log("Cannot start as you are in workout...");
          } else {
            actions.startWorkout(createWorkoutFromPlan(workoutPlan));
          }
        }}
      >
        <View style={styles.workoutViewTile}>
          <View style={styles.workoutViewTitle}>
            <Text _type="small">{workoutPlan.name}</Text>
            <View _type="background">
              <Icon name="plus" />
            </View>
          </View>
          <View style={styles.workoutViewExerciseList}>
            {workoutPlan.exercises.map((exercise, index) => (
              <View key={index}>
                <Text _type="neutral">{exercise.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export function WorkoutPlans() {
  return (
    <DynamicHeaderPage title="Plans">
      <View _type="background" style={styles.workoutPlans}>
        {PLANS.map((plan, index) => (
          <WorkoutPlanTile key={index} workoutPlan={plan} />
        ))}
      </View>
    </DynamicHeaderPage>
  );
}
