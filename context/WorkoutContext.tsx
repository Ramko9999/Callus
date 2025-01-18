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
import { createContext, useState, useContext, useEffect } from "react";
import { generateRandomId, timeout } from "@/util/misc";
import { WorkoutApi } from "@/api/workout";
import { Audio } from "expo-av";
import { BW } from "@/constants";
import { NAME_TO_EXERCISE_META } from "@/api/exercise";

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

export function getWorkoutSummary(workout: Workout): WorkoutSummary {
  let totalReps: number = 0;
  let totalWeightLifted: number = 0;
  workout.exercises.forEach((ex) =>
    ex.sets.forEach((set) => {
      if (set.status !== SetStatus.UNSTARTED) {
        const difficultyType = (
          NAME_TO_EXERCISE_META.get(ex.name) as ExerciseMeta
        ).difficultyType;
        if (difficultyType === DifficultyType.ASSISTED_BODYWEIGHT) {
          const { reps, assistanceWeight } =
            set.difficulty as AssistedBodyWeightDifficulty;
          totalReps += reps;
          totalWeightLifted += (BW - assistanceWeight) * reps;
        } else if (difficultyType === DifficultyType.BODYWEIGHT) {
          const { reps } = set.difficulty as BodyWeightDifficulty;
          totalReps += reps;
          totalWeightLifted += BW * reps;
        } else if (difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) {
          const { reps, weight } = set.difficulty as WeightDifficulty;
          totalReps += reps;
          totalWeightLifted += (BW + weight) * reps;
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

export function reorderExercises(
  workout: Workout,
  exerciseOrder: string[]
): Workout {
  const exercisesToOrder = new Map(
    exerciseOrder.map((exercise, index) => [exercise, index])
  );
  const workoutExercises = workout.exercises.sort(
    (a, b) =>
      (exercisesToOrder.get(a.name) as number) -
      (exercisesToOrder.get(b.name) as number)
  );
  return { ...workout, exercises: workoutExercises };
}

export function finishAllRestingSets(workout: Workout): Workout {
  const exercises = workout.exercises.map((exercise) => {
    const sets = exercise.sets.map((set) => {
      if (set.status === SetStatus.RESTING) {
        return { ...set, status: SetStatus.FINISHED, restEndedAt: Date.now() };
      }
      return { ...set };
    });

    return { ...exercise, sets };
  });
  return { ...workout, exercises };
}

export function areWorkoutsSame(a: Workout, b: Workout): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function getRemainingRest(set: Set): number {
  return Math.floor(
    ((set.restStartedAt as number) + set.restDuration * 1000 - Date.now()) /
      1000
  );
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

type WorkoutSounds = {
  shortBeep: Audio.Sound;
  longBeep: Audio.Sound;
};

type WorkoutSoundPlayer = {
  playRestCompleting: () => Promise<void>;
};

type WorkoutContext = {
  isInWorkout: boolean;
  metadata?: WorkoutMetadata;
  activity?: WorkoutActivity;
  actions: WorkoutActions;
  editor: WorkoutEditor;
  soundPlayer: WorkoutSoundPlayer;
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
  soundPlayer: {
    playRestCompleting: async () => {},
  },
});

type Props = {
  children: React.ReactNode;
};

// todo: consider debouncing workout updates
export function WorkoutProvider({ children }: Props) {
  const [workout, setWorkout] = useState<Workout>();
  const [sounds, setSounds] = useState<WorkoutSounds>();

  const startWorkout = (workout: Workout) => {
    const activity = getCurrentWorkoutActivity(workout);
    if (activity.type !== WorkoutActivityType.FINISHED) {
      workout = updateSet(
        (activity.activityData.set as Set).id,
        { startedAt: Date.now() },
        workout as Workout
      );
    }
    WorkoutApi.saveWorkout(workout).then(() => {
      setWorkout(workout);
    });
  };

  const completeSet = (setId: string) => {
    const newWorkout = updateSet(
      setId,
      { status: SetStatus.RESTING, restStartedAt: Date.now() },
      workout as Workout
    );
    WorkoutApi.saveWorkout(newWorkout).then(() => {
      setWorkout(newWorkout);
    });
  };

  const completeRest = (setId: string) => {
    let newWorkout = updateSet(
      setId,
      { status: SetStatus.FINISHED, restEndedAt: Date.now() },
      workout as Workout
    );
    const activity = getCurrentWorkoutActivity(newWorkout);
    if (activity.type !== WorkoutActivityType.FINISHED) {
      newWorkout = updateSet(
        (activity.activityData.set as Set).id,
        { startedAt: Date.now() },
        newWorkout as Workout
      );
    }
    WorkoutApi.saveWorkout(newWorkout).then(() => {
      setWorkout(newWorkout);
    });
  };

  const updateWorkout = (update: Partial<Workout>) => {
    const newWorkout = { ...(workout as Workout), ...update };
    WorkoutApi.saveWorkout(newWorkout).then(() => {
      setWorkout(newWorkout);
    });
  };

  const discardWorkout = () => {
    setWorkout(undefined);
  };

  const updateRestDuration = (setId: string, updatedRestDuration: number) => {
    let newWorkout = updateSet(
      setId,
      { restDuration: updatedRestDuration },
      workout as Workout
    );
    WorkoutApi.saveWorkout(newWorkout).then(() => {
      setWorkout(newWorkout);
    });
  };

  const resumeInProgressWorkout = (workout: Workout) => {
    setWorkout(workout);
  };

  useEffect(() => {
    Promise.all([
      Audio.Sound.createAsync(require("@/assets/audio/short-beep.mp3")),
      Audio.Sound.createAsync(require("@/assets/audio/long-beep.mp3")),
    ]).then(([{ sound: shortBeep }, { sound: longBeep }]) => {
      setSounds({ shortBeep, longBeep });
    });
  }, []);

  return (
    <context.Provider
      value={{
        actions: {
          startWorkout,
          completeRest,
          completeSet,
          discardWorkout,
          resumeInProgressWorkout,
          updateRestDuration,
        },
        activity: workout && getCurrentWorkoutActivity(workout),
        metadata: workout && {
          startedAt: workout.startedAt,
          name: workout.name,
        },
        isInWorkout: workout != undefined,
        editor: {
          workout: workout,
          actions: { updateWorkout, stopCurrentWorkout: discardWorkout },
        },
        soundPlayer: {
          // todo: move to sound api
          playRestCompleting: async () => {
            await sounds?.shortBeep.replayAsync();
            await timeout(1500);
            await sounds?.shortBeep.replayAsync();
            await timeout(1500);
            await sounds?.shortBeep.replayAsync();
            await timeout(1500);
            await sounds?.longBeep.replayAsync();
          },
        },
      }}
    >
      {children}
    </context.Provider>
  );
}

export function useWorkout() {
  return useContext(context);
}
