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

export function createWorkoutFromRoutine(routine: WorkoutPlan): Workout {
  const exercises: Exercise[] = routine.exercises.map(
    ({ name, rest, sets: routineSets }) => {
      const sets: Set[] = routineSets.map((set) => ({
        ...set,
        id: generateSetId(),
        status: SetStatus.UNSTARTED,
        restDuration: rest,
      }));

      return {
        name,
        restDuration: rest,
        sets,
        id: generateExerciseId(),
      };
    }
  );

  return {
    name: routine.name,
    exercises,
    startedAt: Date.now(),
    id: generateWorkoutId(),
    routineId: routine.name,
  };
}

export function createWorkoutFromWorkout(workout: Workout): Workout {
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
    name: workout.name,
    exercises,
    startedAt: Date.now(),
    id: generateWorkoutId(),
    routineId: workout.routineId,
  };
}
