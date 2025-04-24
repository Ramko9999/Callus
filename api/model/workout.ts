import {
  Exercise,
  ExerciseMeta,
  Routine,
  Set,
  SetStatus,
  Workout,
} from "@/interface";
import {
  generateExerciseId,
  getQuickstartWorkoutName,
  generateSetId,
  generateWorkoutId,
} from "./util";
import { ID_TO_EXERCISE_META } from "../exercise";

function createWorkoutFromRoutine(
  routine: Routine,
  bodyweight: number
): Workout {
  const exercises: Exercise[] = routine.plan.map(
    ({ metaId, rest, sets: routineSets }) => {
      const sets: Set[] = routineSets.map((set) => ({
        ...set,
        id: generateSetId(),
        status: SetStatus.UNSTARTED,
        restDuration: rest,
      }));

      return {
        metaId,
        name: (ID_TO_EXERCISE_META.get(metaId) as ExerciseMeta).name,
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
    routineId: routine.id,
    bodyweight,
  };
}

function createWorkoutFromQuickStart(bodyweight: number) {
  return {
    name: getQuickstartWorkoutName(),
    exercises: [],
    startedAt: Date.now(),
    id: generateWorkoutId(),
    bodyweight,
  };
}

function createWorkoutFromWorkout(
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
      name: (ID_TO_EXERCISE_META.get(exercise.metaId) as ExerciseMeta).name,
      metaId: exercise.metaId,
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

export const WorkoutActions = {
  createFromRoutine: createWorkoutFromRoutine,
  createFromQuickStart: createWorkoutFromQuickStart,
  createFromWorkout: createWorkoutFromWorkout,
};
