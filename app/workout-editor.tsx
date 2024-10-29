import { WorkoutEditor } from "@/components/workout/editor";
import { useWorkout } from "@/context/WorkoutContext";
import { Workout } from "@/interface";
import { useRouter } from "expo-router";

export default function () {
  const { editor } = useWorkout();
  const { workout, actions } = editor;
  const router = useRouter();

  return (
    <WorkoutEditor
      workout={workout as Workout}
      onSaveWorkout={(workout) => {
        // todo: // fix the routing here...
        actions.updateWorkout(workout);
        actions.stopCurrentWorkout();
        router.back();
      }}
    />
  );
}
