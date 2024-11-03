import {
  WorkoutActivity,
  WorkoutPlan,
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
import { generateRandomId } from "@/util";
import { WorkoutApi } from "@/api/workout";
import { Audio } from "expo-av";
import { BW, NAME_TO_EXERCISE_META } from "@/constants";

function generateSetId() {
  return generateRandomId("st", 8);
}

function generateExerciseId() {
  return generateRandomId("ex", 8);
}

export function createWorkoutFromPlan(workoutPlan: WorkoutPlan): Workout {
  const exercises: Exercise[] = workoutPlan.exercises.map(
    ({ name, sets: setPlans, rest }) => {
      const sets: Set[] = setPlans.map((set) => ({
        ...set,
        id: generateSetId(),
        status: SetStatus.UNSTARTED,
        restDuration: rest,
      }));
      
      return {
        id: generateExerciseId(),
        name,
        sets,
      };
    }
  );

  const startedAt = Date.now();

  return {
    name: workoutPlan.name,
    exercises: exercises,
    startedAt: startedAt,
    id: WorkoutApi.getWorkoutId(startedAt, workoutPlan),
  };
}

// todo: adding a set at the end of the workout doesn't lead to the set being shown in the player
export function getCurrentWorkoutActivity(workout: Workout) {
  const sets = workout.exercises.flatMap((exercise) =>
    exercise.sets.map((set) => ({ ...set, exercise }))
  );
  for (const set of sets) {
    if (set.status === SetStatus.UNSTARTED) {
      return {
        type: WorkoutActivityType.EXERCISING,
        activityData: {
          name: set.exercise.name,
          difficultyType: NAME_TO_EXERCISE_META.get(set.exercise.name)
            ?.difficultyType,
          setId: set.id,
          difficulty: set.difficulty,
        },
      };
    } else if (set.status === SetStatus.RESTING) {
      return {
        type: WorkoutActivityType.RESTING,
        activityData: {
          duration: set.restDuration,
          setId: set.id,
          startedAt: set.restStartedAt,
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
  const exercises = workout.exercises.map((ep) => {
    if (ep.id === exerciseId) {
      const {difficulty, restDuration} = ep.sets[ep.sets.length - 1];
      const setToAdd: Set = {status: SetStatus.UNSTARTED, difficulty, restDuration:restDuration, id: generateSetId() }
      return { ...ep, sets: [...ep.sets, setToAdd] };
    }
    return ep;
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

function createDefaultSet(type: DifficultyType): Set {
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
    restDuration: 60,
    difficulty: difficulty,
  };
}

export function addExercise(
  exerciseMeta: ExerciseMeta,
  workout: Workout
): Workout {
  const newExercise = {
    ...exerciseMeta,
    id: generateExerciseId(),
    sets: [createDefaultSet(exerciseMeta.difficultyType)],
  };
  console.log(exerciseMeta, JSON.stringify(newExercise));
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

type WorkoutActions = {
  startWorkout: (_: WorkoutPlan) => void;
  completeSet: (_: string) => void;
  updateRestDuration: (_: string, u: number) => void;
  completeRest: (_: string) => void;
  finishWorkout: () => void;
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
  restCompleting: Audio.Sound;
  nextSetBegin: Audio.Sound;
};

type WorkoutSoundPlayer = {
  playRestCompleting: () => Promise<void>;
  playNextSetBegin: () => Promise<void>;
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
    finishWorkout: () => {},
    resumeInProgressWorkout: () => {},
    updateRestDuration: () => {},
  },
  editor: {
    actions: { updateWorkout: (_: Partial<Workout>) => {}, stopCurrentWorkout: () => {}},
  },
  soundPlayer: {
    playRestCompleting: async () => {},
    playNextSetBegin: async () => {},
  },
});

type Props = {
  children: React.ReactNode;
};

export function WorkoutProvider({ children }: Props) {
  const [workout, setWorkout] = useState<Workout>();
  const [sounds, setSounds] = useState<WorkoutSounds>();

  const startWorkout = (workoutPlan: WorkoutPlan) => {
    let newWorkout = createWorkoutFromPlan(workoutPlan);
    const activity = getCurrentWorkoutActivity(newWorkout);
    if (activity.type !== WorkoutActivityType.FINISHED) {
      newWorkout = updateSet(
        activity.activityData.setId as string,
        { startedAt: Date.now() },
        newWorkout as Workout
      );
    }
    WorkoutApi.saveWorkout(newWorkout).then(() => {
      setWorkout(newWorkout);
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
        activity.activityData.setId as string,
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

  const finishWorkout = () => {
    const newWorkout = finish(workout as Workout);
    WorkoutApi.saveWorkout(newWorkout).then(() => {
      setWorkout(undefined);
    });
  };

  const stopCurrentWorkout = () => {
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
      setSounds({ restCompleting: shortBeep, nextSetBegin: longBeep });
    });
  }, []);

  return (
    <context.Provider
      value={{
        actions: {
          startWorkout,
          completeRest,
          completeSet,
          finishWorkout,
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
          actions: { updateWorkout, stopCurrentWorkout },
        },
        soundPlayer: {
          playRestCompleting: async () => {
            await sounds?.restCompleting.playFromPositionAsync(0);
          },
          playNextSetBegin: async () => {
            await sounds?.nextSetBegin.playFromPositionAsync(0);
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
