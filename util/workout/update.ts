import { updateExercise, updateSet } from "@/context/WorkoutContext";
import { Exercise, Workout } from "@/interface";

export function updateExerciseRest(
  exerciseId: string,
  restDuration: number,
  workout: Workout
): Workout {
  const exercise = workout.exercises.find(
    ({ id }) => id === exerciseId
  ) as Exercise;
  let updatedWorkout = updateExercise(
    exerciseId,
    { restDuration: restDuration },
    workout
  );
  for (const set of exercise.sets) {
    updatedWorkout = updateSet(set.id, { restDuration }, updatedWorkout);
  }

  return updatedWorkout;
}
