import { Workout, WorkoutPlan, Set, SetStatus, Exercise } from "@/interface";
import { generateRandomId } from "../misc";

function generateSetId() {
  return generateRandomId("st", 8);
}

function generateExerciseId() {
  return generateRandomId("ex", 8);
}

function generateWorkoutId() {
  return generateRandomId("wrk", 8);
}

export function createWorkoutFromWorkout(
  workout: Workout,
  bodyweight: number
): Workout {
  const exercises: Exercise[] = workout.exercises.map((exercise) => {
    const sets: Set[] = exercise.sets.map(({ difficulty }) => ({
      difficulty,
      restDuration: exercise.restDuration,
      id: generateSetId(),
      status: SetStatus.UNSTARTED,
    }));

    return {
      id: generateExerciseId(),
      name: exercise.name,
      sets,
      restDuration: exercise.restDuration,
    };
  });

  return {
    bodyweight,
    name: workout.name,
    exercises,
    startedAt: Date.now(),
    id: generateWorkoutId(),
    routineId: workout.routineId,
  };
}
