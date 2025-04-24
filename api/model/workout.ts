import { Exercise, ExerciseMeta, Routine, Set, SetStatus, Workout } from "@/interface";
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

export const WorkoutActions = {
  createFromRoutine: createWorkoutFromRoutine,
  createFromQuickStart: createWorkoutFromQuickStart,
};
