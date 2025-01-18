import { Exercise, Routine, Set, SetStatus, Workout } from "@/interface";
import { generateExerciseId, generateSetId, generateWorkoutId } from "./util";

function createWorkoutFromRoutine(routine: Routine): Workout {
  const exercises: Exercise[] = routine.plan.map(
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
    routineId: routine.id,
  };
}

export const WorkoutActions = {
  createFromRoutine: createWorkoutFromRoutine,
};
