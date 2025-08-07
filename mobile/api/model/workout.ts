import {
  Exercise,
  ExerciseMeta,
  Routine,
  Set,
  SetStatus,
  Workout,
  WorkoutSummary,
  DifficultyType,
  BodyWeightDifficulty,
  WeightDifficulty,
  TimeDifficulty,
} from "@/interface";
import {
  generateExerciseId,
  getQuickstartWorkoutName,
  generateSetId,
  generateWorkoutId,
  createDefaultSet,
} from "./util";
import { ArrayUtils } from "@/util/misc";

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

function getCurrentSetAndExercise(workout: Workout) {
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
  return undefined;
}

export const WorkoutCreation = {
  createFromRoutine: createWorkoutFromRoutine,
  createFromQuickStart: createWorkoutFromQuickStart,
  createFromWorkout: createWorkoutFromWorkout,
};

function addExercises(workout: Workout, metas: ExerciseMeta[]) {
  const exercises: Exercise[] = metas.map((meta) => ({
    id: generateExerciseId(),
    metaId: meta.metaId,
    name: meta.name,
    sets: [createDefaultSet(meta.difficultyType, 60)],
    restDuration: 60,
  }));

  return {
    ...workout,
    exercises: [...workout.exercises, ...exercises],
  };
}

function reorderExercises(workout: Workout, exerciseOrder: string[]) {
  const currentSetId = getCurrentSetAndExercise(workout)?.set.id;
  const newExercises = exerciseOrder.map((id) => getExercise(workout, id));
  const nextCurrentSetId = getCurrentSetAndExercise({
    ...workout,
    exercises: newExercises,
  })?.set.id;
  const hasCurrentSetChanged = currentSetId !== nextCurrentSetId;

  const finalNewExercises = exerciseOrder.map((id) => {
    const exercise = getExercise(workout, id);
    exercise.sets = exercise.sets.map((set) => {
      if (set.status === SetStatus.RESTING && hasCurrentSetChanged) {
        return { ...set, status: SetStatus.FINISHED, restEndedAt: Date.now() };
      } else {
        return set;
      }
    });
    return exercise;
  });

  return {
    ...workout,
    exercises: finalNewExercises,
  };
}

function finishWorkout(workout: Workout) {
  const exercises = workout.exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets
      .filter((set) => set.status !== SetStatus.UNSTARTED)
      .map((set) => {
        if (set.status === SetStatus.RESTING) {
          return {
            ...set,
            status: SetStatus.FINISHED,
            restEndedAt: Date.now(),
          };
        }
        return set;
      }),
  }));

  const filteredExercises = exercises.filter(
    (exercise) => exercise.sets.length > 0
  );

  return {
    ...workout,
    exercises: filteredExercises,
    endedAt: Date.now(),
  };
}

function deleteExerciseByMetaId(workout: Workout, metaId: string) {
  return {
    ...workout,
    exercises: workout.exercises.filter((e) => e.metaId !== metaId),
  };
}

export const WorkoutActions = (workout: Workout) => ({
  addExercises: (metas: ExerciseMeta[]) => addExercises(workout, metas),
  reorderExercises: (exerciseOrder: string[]) =>
    reorderExercises(workout, exerciseOrder),
  finish: () => finishWorkout(workout),
  deleteByMetaId: (metaId: string) => deleteExerciseByMetaId(workout, metaId),
});

function updateExercise(
  workout: Workout,
  exerciseId: string,
  update: Partial<Exercise>
) {
  const exercise = workout.exercises.find((e) => e.id === exerciseId)!;
  const updatedExercise = { ...exercise, ...update };
  return {
    ...workout,
    exercises: workout.exercises.map((e) =>
      e.id === exerciseId ? updatedExercise : e
    ),
  };
}

function duplicateLastSet(workout: Workout, exerciseId: string) {
  const exercise = getExercise(workout, exerciseId);
  const { difficulty } = ArrayUtils.last(exercise.sets);
  const newSet: Set = {
    id: generateSetId(),
    status: SetStatus.UNSTARTED,
    difficulty: JSON.parse(JSON.stringify(difficulty)),
    restDuration: exercise.restDuration,
  };

  return ExerciseActions(workout, exerciseId).update({
    sets: [...exercise.sets, newSet],
  });
}

function getExercise(workout: Workout, exerciseId: string) {
  return workout.exercises.find((e) => e.id === exerciseId)!;
}

function deleteExercise(workout: Workout, exerciseId: string) {
  return {
    ...workout,
    exercises: workout.exercises.filter((e) => e.id !== exerciseId),
  };
}

function updateRest(
  workout: Workout,
  exerciseId: string,
  restDuration: number
) {
  const exercise = getExercise(workout, exerciseId);
  const sets = exercise.sets.map((set) => {
    if (set.status !== SetStatus.FINISHED) {
      return {
        ...set,
        restDuration,
      };
    }
    return set;
  });

  return updateExercise(workout, exerciseId, { sets, restDuration });
}

export const ExerciseActions = (workout: Workout, exerciseId: string) => ({
  update: (update: Partial<Exercise>) =>
    updateExercise(workout, exerciseId, update),
  duplicateLastSet: () => duplicateLastSet(workout, exerciseId),
  delete: () => deleteExercise(workout, exerciseId),
  updateRest: (restDuration: number) =>
    updateRest(workout, exerciseId, restDuration),
});

function getSetAndExercise(workout: Workout, setId: string) {
  const exerciseSets = workout.exercises.flatMap((exercise) =>
    exercise.sets.map((set) => ({ exercise, set }))
  );
  for (const { set, exercise } of exerciseSets) {
    if (set.id === setId) {
      return { set, exercise };
    }
  }
}

function updateSet(workout: Workout, setId: string, update: Partial<Set>) {
  const { exercise, set } = getSetAndExercise(workout, setId)!;
  const updatedSet = { ...set, ...update };
  const updatedExercise = {
    ...exercise,
    sets: exercise.sets.map((s) => (s.id === setId ? updatedSet : s)),
  };
  return ExerciseActions(workout, exercise.id).update({
    sets: updatedExercise.sets,
  });
}

function finishSet(workout: Workout, setId: string) {
  const { set } = getSetAndExercise(workout, setId)!;
  if (set.status === SetStatus.UNSTARTED) {
    return updateSet(workout, setId, { status: SetStatus.FINISHED });
  }
  if (set.status === SetStatus.RESTING) {
    return updateSet(workout, setId, {
      status: SetStatus.FINISHED,
      restEndedAt: Date.now(),
    });
  }
}

function restSet(workout: Workout, setId: string) {
  return updateSet(workout, setId, {
    status: SetStatus.RESTING,
    restStartedAt: Date.now(),
  });
}

function deleteSet(workout: Workout, setId: string) {
  const { exercise } = getSetAndExercise(workout, setId)!;

  const sets = exercise.sets.filter((s) => s.id !== setId);

  if (sets.length === 0) {
    return deleteExercise(workout, exercise.id);
  }

  return ExerciseActions(workout, exercise.id).update({
    sets,
  });
}

function unstartSet(workout: Workout, setId: string) {
  return updateSet(workout, setId, {
    status: SetStatus.UNSTARTED,
    restStartedAt: undefined,
    restEndedAt: undefined,
  });
}

export const SetActions = (workout: Workout, setId: string) => ({
  delete: () => deleteSet(workout, setId),
  update: (update: Partial<Set>) => updateSet(workout, setId, update),
  finish: () => finishSet(workout, setId),
  rest: () => restSet(workout, setId),
  unstart: () => unstartSet(workout, setId),
});

function hasUnfinishedSets(workout: Workout) {
  return workout.exercises.some((exercise) =>
    exercise.sets.some((set) => set.status === SetStatus.UNSTARTED)
  );
}

function getNextUnstartedSet(workout: Workout, setId: string) {
  const exerciseSets = workout.exercises.flatMap((exercise) =>
    exercise.sets
      .filter((set) => set.status !== SetStatus.FINISHED)
      .map((set) => ({ exercise, set }))
  );
  const currentPairIndex = exerciseSets.findIndex(
    ({ set }) => set.id === setId
  );
  if (currentPairIndex > -1 && currentPairIndex < exerciseSets.length - 1) {
    return exerciseSets[currentPairIndex + 1];
  }
}

export function summarize(
  workout: Workout,
  metaIdToDifficultyType: Record<string, DifficultyType>
): WorkoutSummary {
  let totalReps: number = 0;
  let totalWeightLifted: number = 0;
  let totalHoldTime: number = 0;

  // todo: this does ignore time difficulty
  workout.exercises.forEach((ex) =>
    ex.sets.forEach((set) => {
      if (set.status !== SetStatus.UNSTARTED) {
        const difficultyType = metaIdToDifficultyType[ex.metaId];
        if (difficultyType === DifficultyType.BODYWEIGHT) {
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
        } else if (difficultyType === DifficultyType.TIME) {
          const { duration } = set.difficulty as TimeDifficulty;
          totalHoldTime += duration;
        }
      }
    })
  );

  let totalDuration = (workout.endedAt ?? Date.now()) - workout.startedAt;
  return { totalReps, totalWeightLifted, totalDuration, totalHoldTime };
}

export const WorkoutQuery = {
  getCurrentSetAndExercise,
  getExercise,
  hasUnfinishedSets,
  getNextUnstartedSet,
  summarize,
};
