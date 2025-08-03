import {
  WorkoutActivity,
  Workout,
  SetStatus,
  Set,
  Exercise,
  WorkoutActivityType,
  WorkoutSummary,
  WorkoutMetadata,
  ExerciseMeta,
  DifficultyType,
  Difficulty,
  BodyWeightDifficulty,
  AssistedBodyWeightDifficulty,
  WeightDifficulty,
} from "@/interface";
import { createContext, useState, useContext } from "react";
import { generateRandomId } from "@/util/misc";
import { useDebounce } from "@/components/hooks/use-debounce";

function generateSetId() {
  return generateRandomId("st", 8);
}

function generateExerciseId() {
  return generateRandomId("ex", 8);
}

export function getCurrentSetAndExercise(workout: Workout) {
  const exerciseSets = workout.exercises.flatMap((exercise) =>
    exercise.sets.map((set) => ({ set, exercise }))
  );

  for (const { set, exercise } of exerciseSets) {
    if (
      set.status === SetStatus.UNSTARTED ||
      set.status === SetStatus.RESTING
    ) {
      return { set, exercise };
    }
  }
}

export function hasUnstartedSets(workout: Workout) {
  return (
    workout.exercises.filter(
      (exercise) =>
        exercise.sets.filter((set) => set.status === SetStatus.UNSTARTED)
          .length > 0
    ).length > 0
  );
}

export function wrapUpSets(workout: Workout): Workout {
  const exercises = workout.exercises.map((exercise) => {
    const sets = exercise.sets.flatMap((set) => {
      if (set.status !== SetStatus.UNSTARTED) {
        if (set.status === SetStatus.FINISHED) {
          return [set];
        }
        return [
          { ...set, status: SetStatus.FINISHED, restEndedAt: Date.now() },
        ];
      }
      return [];
    });

    return { ...exercise, sets };
  });

  return {
    ...workout,
    exercises: exercises.filter((exercise) => exercise.sets.length > 0),
    endedAt: Date.now(),
  };
}

// todo: adding a set at the end of the workout doesn't lead to the set being shown in the player
export function getCurrentWorkoutActivity(workout: Workout) {
  const exerciseSets = workout.exercises.flatMap((exercise) =>
    exercise.sets.map((set) => ({ set, exercise }))
  );
  for (const { set, exercise } of exerciseSets) {
    if (set.status === SetStatus.UNSTARTED) {
      return {
        type: WorkoutActivityType.EXERCISING,
        activityData: {
          set,
          exercise,
        },
      };
    } else if (set.status === SetStatus.RESTING) {
      return {
        type: WorkoutActivityType.RESTING,
        activityData: {
          set,
          exercise,
        },
      };
    }
  }
  return { type: WorkoutActivityType.FINISHED, activityData: {} };
}

export function finish(workout: Workout): Workout {
  return { ...workout, endedAt: Date.now() };
}

export function updateSet(
  setId: string,
  setUpdate: Partial<Set>,
  workout: Workout
): Workout {
  console.log(
    `[WORKOUT-CONTEXT] Updating set ${setId} for ${
      workout.id
    } with ${JSON.stringify(setUpdate)}`
  );
  const exercises = workout.exercises.map((ep) => {
    const sets = ep.sets.map((sp) => {
      if (sp.id == setId) {
        return { ...sp, ...setUpdate, id: setId };
      }
      return sp;
    });
    return { ...ep, sets };
  });

  return { ...workout, exercises };
}

export function removeSet(setId: string, workout: Workout): Workout {
  const exercises = workout.exercises.flatMap((ep) => {
    const sets = ep.sets.filter((sp) => sp.id !== setId);
    if (sets.length === 0) {
      return [];
    }
    return [{ ...ep, sets }];
  });
  return { ...workout, exercises };
}

export function duplicateLastSet(
  exerciseId: string,
  workout: Workout
): Workout {
  const exercises = workout.exercises.map((exercise) => {
    if (exercise.id === exerciseId) {
      const { difficulty } = exercise.sets[exercise.sets.length - 1];
      const setToAdd: Set = {
        status: SetStatus.UNSTARTED,
        difficulty,
        restDuration: exercise.restDuration,
        id: generateSetId(),
      };
      return { ...exercise, sets: [...exercise.sets, setToAdd] };
    }
    return exercise;
  });
  return { ...workout, exercises };
}

export function updateExercise(
  exerciseId: string,
  exerciseUpdate: Partial<Exercise>,
  workout: Workout
): Workout {
  const exercises = workout.exercises.map((ep) => {
    if (ep.id === exerciseId) {
      return { ...ep, ...exerciseUpdate, id: exerciseId };
    }
    return ep;
  });
  return { ...workout, exercises };
}

export function removeExercise(exerciseId: string, workout: Workout): Workout {
  const exercises = workout.exercises.filter((ep) => ep.id !== exerciseId);
  return { ...workout, exercises };
}

function createDefaultSet(type: DifficultyType, restDuration: number): Set {
  let difficulty: Difficulty;
  if (type === DifficultyType.ASSISTED_BODYWEIGHT) {
    difficulty = { assistanceWeight: 0, reps: 0 };
  } else if (type === DifficultyType.TIME) {
    difficulty = { duration: 60 };
  } else if (type === DifficultyType.WEIGHT) {
    difficulty = { reps: 0, weight: 0 };
  } else if (type === DifficultyType.WEIGHTED_BODYWEIGHT) {
    difficulty = { reps: 0, weight: 0 };
  } else {
    difficulty = { reps: 0 };
  }

  return {
    id: generateSetId(),
    status: SetStatus.UNSTARTED,
    restDuration,
    difficulty: difficulty,
  };
}

export function addExercise(
  exerciseMeta: ExerciseMeta,
  workout: Workout
): Workout {
  const restDuration = 60;
  const newExercise: Exercise = {
    ...exerciseMeta,
    id: generateExerciseId(),
    sets: [createDefaultSet(exerciseMeta.difficultyType, restDuration)],
    restDuration,
  };
  const exercises: Exercise[] = [...workout.exercises, newExercise];
  return { ...workout, exercises };
}

export function updateWorkout(
  workoutUpdate: Partial<Workout>,
  workout: Workout
): Workout {
  return { ...workout, ...workoutUpdate };
}

export function getWorkoutSummary(
  workout: Workout,
  metaIdToDifficultyType: Record<string, DifficultyType>
): WorkoutSummary {
  let totalReps: number = 0;
  let totalWeightLifted: number = 0;
  workout.exercises.forEach((ex) =>
    ex.sets.forEach((set) => {
      if (set.status !== SetStatus.UNSTARTED) {
        const difficultyType = metaIdToDifficultyType[ex.metaId];

        if (difficultyType === DifficultyType.ASSISTED_BODYWEIGHT) {
          const { reps, assistanceWeight } =
            set.difficulty as AssistedBodyWeightDifficulty;
          totalReps += reps;
          totalWeightLifted += (workout.bodyweight - assistanceWeight) * reps;
        } else if (difficultyType === DifficultyType.BODYWEIGHT) {
          const { reps } = set.difficulty as BodyWeightDifficulty;
          totalReps += reps;
          totalWeightLifted += workout.bodyweight * reps;
        } else if (difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) {
          const { reps, weight } = set.difficulty as WeightDifficulty;
          totalReps += reps;
          totalWeightLifted += (workout.bodyweight + weight) * reps;
        } else if (difficultyType === DifficultyType.WEIGHT) {
          const { reps, weight } = set.difficulty as WeightDifficulty;
          totalReps += reps;
          totalWeightLifted += weight * reps;
        }
        // todo: use the duration during which work is done for time difficulty
      }
    })
  );

  let totalDuration = (workout.endedAt ?? Date.now()) - workout.startedAt;
  return { totalReps, totalWeightLifted, totalDuration };
}

export function finishAllRestingSets(exercises: Exercise[]): Exercise[] {
  return exercises.map((exercise) => {
    const sets = exercise.sets.map((set) => {
      if (set.status === SetStatus.RESTING) {
        return { ...set, status: SetStatus.FINISHED, restEndedAt: Date.now() };
      }
      return { ...set };
    });

    return { ...exercise, sets };
  });
}

export function areWorkoutsSame(a: Workout, b: Workout): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export type WorkoutActions = {
  startWorkout: (_: Workout) => void;
  completeSet: (_: string) => void;
  updateRestDuration: (_: string, u: number) => void;
  completeRest: (setId: string) => void;
  discardWorkout: () => void;
  resumeInProgressWorkout: (_: Workout) => void;
};

type WorkoutEditorActions = {
  updateWorkout: (_: Partial<Workout>) => void;
  stopCurrentWorkout: () => void;
};

type WorkoutEditor = {
  workout?: Workout;
  actions: WorkoutEditorActions;
};

type WorkoutContext = {
  isInWorkout: boolean;
  metadata?: WorkoutMetadata;
  activity?: WorkoutActivity;
  actions: WorkoutActions;
  editor: WorkoutEditor;
};

const context = createContext<WorkoutContext>({
  isInWorkout: false,
  actions: {
    startWorkout: () => {},
    completeSet: () => {},
    completeRest: () => {},
    discardWorkout: () => {},
    resumeInProgressWorkout: () => {},
    updateRestDuration: () => {},
  },
  editor: {
    actions: {
      updateWorkout: (_: Partial<Workout>) => {},
      stopCurrentWorkout: () => {},
    },
  },
});

export function useWorkout() {
  return useContext(context);
}
