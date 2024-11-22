import { usePathname, useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";
import { StyleSheet, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { NewWorkoutViewTile } from "@/components/workout/view";
import {
  truncTime,
  addDays,
  removeDays,
  getLongDateDisplay,
} from "@/util/date";
import { WorkoutApi } from "@/api/workout";
import { Workout } from "@/interface";
import { WorkoutIndicator } from "../workout/player/indicator";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { EditorPopup } from "../workout/editor/editor";

const styles = StyleSheet.create({
  homeView: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  expansiveCenterAlignedView: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  workoutItineraryView: {
    flexDirection: "row",
    justifyContent: "center",
  },
  headerTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  headerView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    justifyContent: "center",
  },
  headerAction: {
    padding: "8%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  workoutView: {
    display: "flex",
    flexDirection: "column",
    height: "80%",
    alignItems: "center",
  },
  workoutViewTiles: {
    display: "flex",
    flexDirection: "column",
    margin: 20,
    width: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    gap: 20,
  },
  workoutViewPlan: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
    width: "100%",
    backgroundColor: "transparent",
  },
  header: {
    height: "15%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    paddingLeft: "5%",
  },
});

function WorkoutItineraryLoading() {
  return (
    <View _type="background" style={styles.expansiveCenterAlignedView}>
      <Text _type="neutral">Loading workouts...</Text>
    </View>
  );
}

type CompletedWorkoutsProps = {
  workouts: Workout[];
  onClickWorkout: (_: Workout) => void;
};

function CompletedWorkouts({
  workouts,
  onClickWorkout,
}: CompletedWorkoutsProps) {
  const router = useRouter();

  const isRestDay = workouts.length === 0;

  const onEditCompletedWorkout = (workout: Workout) => {
    router.push({
      pathname: "/offline-workout-tracker",
      params: {
        serializedWorkout: JSON.stringify(workout),
      },
    });
  };

  return isRestDay ? (
    <View _type="background" style={styles.expansiveCenterAlignedView}>
      <Text _type="neutral">It's a rest day. Take it easy :)</Text>
    </View>
  ) : (
    <ScrollView>
      <View _type="background" style={styles.workoutView}>
        <View style={styles.workoutViewTiles}>
          {workouts.map((workout, index) => (
            <NewWorkoutViewTile
              key={index}
              workout={workout}
              onClick={() => onClickWorkout(workout)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const TRANSLATION_THRESHOLD = 20;
const VELOCITY_TRHESHOLD = 100;

export default function Home() {
  const pathname = usePathname();
  const [workoutDate, setWorkoutDate] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(true);
  const [completedWorkouts, setCompletedWorkouts] = useState<Workout[]>([]);
  const [workoutToUpdate, setWorkoutToUpdate] = useState<Workout>();

  const loadWorkouts = async () => {
    setLoading(true);
    WorkoutApi.getWorkouts(truncTime(workoutDate))
      .then(setCompletedWorkouts)
      .finally(() => setLoading(false));
  };

  const panGesture = Gesture.Pan()
    .onEnd(({ translationX, velocityX }) => {
      const isPanRightRight = translationX > 0;
      if (isPanRightRight) {
        if (
          translationX > TRANSLATION_THRESHOLD &&
          velocityX > VELOCITY_TRHESHOLD
        ) {
          setWorkoutDate((d) => removeDays(d, 1));
        }
      } else {
        if (
          translationX < -1 * TRANSLATION_THRESHOLD &&
          velocityX < -1 * VELOCITY_TRHESHOLD
        ) {
          setWorkoutDate((d) => addDays(d, 1));
        }
      }
    })
    .runOnJS(true);

  useEffect(() => {
    loadWorkouts();
  }, [workoutDate, pathname]);

  return loading ? (
    <WorkoutItineraryLoading />
  ) : (
    <>
      <GestureDetector gesture={panGesture}>
        <View _type="background" style={styles.homeView}>
          <View _type="background" style={styles.header}>
            <Text extraLarge emphasized>
              {getLongDateDisplay(workoutDate)}
            </Text>
          </View>

          <CompletedWorkouts
            workouts={completedWorkouts}
            onClickWorkout={(workout: Workout) => setWorkoutToUpdate(workout)}
          />
        </View>
      </GestureDetector>
      <WorkoutIndicator />
      <EditorPopup
        show={workoutToUpdate != undefined}
        hide={() => {
          setWorkoutToUpdate(undefined);
          loadWorkouts();
        }}
        onSaveWorkout={(workout) => {
          WorkoutApi.saveWorkout(workout).then(() =>
            setWorkoutToUpdate(workout)
          );
        }}
        onDeleteWorkout={(workoutId) =>
          WorkoutApi.deleteWorkout(workoutId).then(() => {
            setWorkoutToUpdate(undefined);
            loadWorkouts();
          })
        }
        workout={workoutToUpdate as Workout}
      />
    </>
  );
}
