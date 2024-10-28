import { WorkoutApi } from "@/api/workout";
import { WorkoutEditor } from "@/components/workout/editor";
import { Workout } from "@/interface";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function () {
  const { serializedWorkout } = useLocalSearchParams();
  const router = useRouter();
  const workout: Workout = JSON.parse(serializedWorkout as string);

  return (
    <WorkoutEditor
      workout={workout}
      onSaveWorkout={(updated) => {
        WorkoutApi.saveWorkout(updated).then(() => {
          router.back();
        });
      }}
    />
  );
}
