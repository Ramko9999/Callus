import {
  DifficultyType,
  ExerciseMeta,
  ExercisePlan,
  Routine,
  SetPlan,
} from "@/interface";
import { getMeta } from "../exercise";
import { ArrayUtils } from "@/util/misc";
import {
  generateExercisePlanId,
  generateRoutineId,
  generateSetPlanId,
} from "./util";

const DEFAULT_REST_DURATION = 60;

function getExercisePlan(routine: Routine, exercisePlanId: string) {
  return routine.plan.find(({ id }) => id === exercisePlanId) as ExercisePlan;
}

function generateDefaultSet(meta: ExerciseMeta): SetPlan {
  let difficulty: any = { duration: 30 };
  if (meta.difficultyType === DifficultyType.BODYWEIGHT) {
    difficulty = { reps: 10 };
  } else if (meta.difficultyType === DifficultyType.WEIGHT) {
    difficulty = { weight: 45, reps: 10 };
  } else if (meta.difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) {
    difficulty = { weight: 45, reps: 10 };
  } else if (meta.difficultyType === DifficultyType.ASSISTED_BODYWEIGHT) {
    difficulty = { assistanceWeight: 0, reps: 0 };
  }
  return { difficulty, id: generateSetPlanId() };
}

function addExercisePlan(routine: Routine, meta: ExerciseMeta) {
  const exercisePlan: ExercisePlan = {
    sets: [generateDefaultSet(meta)],
    rest: DEFAULT_REST_DURATION,
    metaId: meta.metaId,
    name: meta.name,
    id: generateExercisePlanId(),
  };
  const plan = [...routine.plan, exercisePlan];
  return { ...routine, plan };
}

function addExercisePlans(routine: Routine, metas: ExerciseMeta[]) {
  let updatedRoutine = routine;
  metas.forEach((meta) => {
    updatedRoutine = addExercisePlan(updatedRoutine, meta);
  });
  return updatedRoutine;
}

function updateExercisePlan(
  routine: Routine,
  exercisePlanId: string,
  update: Partial<ExercisePlan>
): Routine {
  const plan = routine.plan.map((exercise, _) => {
    const updateToApply = exercise.id === exercisePlanId ? update : {};
    return { ...exercise, ...updateToApply };
  });
  return { ...routine, plan };
}

function removeExercisePlan(routine: Routine, exercisePlanId: string) {
  const plan = routine.plan.filter(({ id }) => id !== exercisePlanId);
  return { ...routine, plan };
}

export const ExercisePlanActions = (routine: Routine) => ({
  add: (metas: ExerciseMeta[]) => addExercisePlans(routine, metas),
  update: (exercisePlanId: string, update: Partial<ExercisePlan>) =>
    updateExercisePlan(routine, exercisePlanId, update),
  remove: (exercisePlanId: string) =>
    removeExercisePlan(routine, exercisePlanId),
});

function addSetPlan(routine: Routine, exercisePlanId: string) {
  const exercisePlan = getExercisePlan(routine, exercisePlanId);
  let newSetPlans = [
    ...exercisePlan.sets,
    generateDefaultSet(getMeta(exercisePlan.name)),
  ];
  if (exercisePlan.sets.length > 0) {
    newSetPlans = [
      ...exercisePlan.sets,
      { ...ArrayUtils.last(exercisePlan.sets), id: generateSetPlanId() },
    ];
  }

  return updateExercisePlan(routine, exercisePlanId, { sets: newSetPlans });
}

function removeSetPlan(
  routine: Routine,
  exercisePlanId: string,
  setPlanId: string
) {
  const exercisePlan = getExercisePlan(routine, exercisePlanId);
  const newSetPlans = exercisePlan.sets.filter(({ id }) => setPlanId !== id);
  if (newSetPlans.length === 0) {
    return removeExercisePlan(routine, exercisePlanId);
  }
  return updateExercisePlan(routine, exercisePlanId, { sets: newSetPlans });
}

function updateSetPlan(
  routine: Routine,
  exercisePlanId: string,
  setPlanId: string,
  update: Partial<SetPlan>
) {
  const newSetPlans = getExercisePlan(routine, exercisePlanId).sets.map(
    (plan, index) => {
      const updateToApply = plan.id === setPlanId ? update : {};
      return { ...plan, ...updateToApply };
    }
  );
  return updateExercisePlan(routine, exercisePlanId, { sets: newSetPlans });
}

export const SetPlanActions = (routine: Routine, exercisePlanId: string) => ({
  add: () => addSetPlan(routine, exercisePlanId),
  remove: (setPlanId: string) =>
    removeSetPlan(routine, exercisePlanId, setPlanId),
  update: (setPlanId: string, update: Partial<SetPlan>) =>
    updateSetPlan(routine, exercisePlanId, setPlanId, update),
});

function makeEmptyRoutine(): Routine {
  return {
    id: generateRoutineId(),
    name: "New Routine",
    plan: [],
  };
}

export const RoutineActions = {
  makeEmptyRoutine,
};

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: "ro_pull-day",
    name: "Pull Day",
    plan: [
      {
        id: generateExercisePlanId(),
        metaId: getMeta("Pull-Up").metaId,
        name: "Pull-Up",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { reps: 7 } },
          { id: generateSetPlanId(), difficulty: { reps: 7 } },
          { id: generateSetPlanId(), difficulty: { reps: 7 } },
          { id: generateSetPlanId(), difficulty: { reps: 7 } },
          { id: generateSetPlanId(), difficulty: { reps: 7 } },
        ],
      },
      {
        id: generateExercisePlanId(),
        metaId: getMeta("Ring Pull-Up").metaId,
        name: "Ring Pull-Up",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
        ],
      },
      {
        id: generateExercisePlanId(),
        metaId: getMeta("Ring Inverted Row").metaId,
        name: "Ring Row",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { reps: 12 } },
          { id: generateSetPlanId(), difficulty: { reps: 12 } },
          { id: generateSetPlanId(), difficulty: { reps: 12 } },
          { id: generateSetPlanId(), difficulty: { reps: 12 } },
        ],
      },
      {
        id: generateExercisePlanId(),
        metaId: getMeta("Seated Cable Row").metaId,
        name: "Seated Cable Row",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { weight: 35, reps: 8 } },
          { id: generateSetPlanId(), difficulty: { weight: 35, reps: 8 } },
          { id: generateSetPlanId(), difficulty: { weight: 35, reps: 8 } },
          { id: generateSetPlanId(), difficulty: { weight: 35, reps: 8 } },
        ],
      },
    ],
  },
  {
    id: "ro_push-day",
    name: "Push Day",
    plan: [
      {
        id: generateExercisePlanId(),
        metaId: getMeta("Dip").metaId,
        name: "Dip",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { reps: 9 } },
          { id: generateSetPlanId(), difficulty: { reps: 9 } },
          { id: generateSetPlanId(), difficulty: { reps: 9 } },
          { id: generateSetPlanId(), difficulty: { reps: 9 } },
          { id: generateSetPlanId(), difficulty: { reps: 9 } },
        ],
      },
      {
        id: generateExercisePlanId(),
        metaId: getMeta("Pike Push-Up").metaId,
        name: "Pike Push-Up",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
        ],
      },
      {
        id: generateExercisePlanId(),
        metaId: getMeta("Military Press").metaId,
        name: "Military Press",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { weight: 30, reps: 6 } },
          { id: generateSetPlanId(), difficulty: { weight: 30, reps: 6 } },
          { id: generateSetPlanId(), difficulty: { weight: 30, reps: 6 } },
          { id: generateSetPlanId(), difficulty: { weight: 30, reps: 6 } },
        ],
      },
      {
        id: generateExercisePlanId(),
        metaId: getMeta("Ring Tricep Extension").metaId,
        name: "Ring Tricep Extension",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { weight: 15, reps: 20 } },
          { id: generateSetPlanId(), difficulty: { weight: 15, reps: 20 } },
          { id: generateSetPlanId(), difficulty: { weight: 15, reps: 20 } },
          { id: generateSetPlanId(), difficulty: { weight: 15, reps: 20 } },
        ],
      },
    ],
  },
  {
    id: "ro_leg-day",
    name: "Leg Day",
    plan: [
      {
        id: generateExercisePlanId(),
        metaId: getMeta("Leg Extension").metaId,
        name: "Leg Extension",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { weight: 50, reps: 12 } },
          { id: generateSetPlanId(), difficulty: { weight: 50, reps: 12 } },
          { id: generateSetPlanId(), difficulty: { weight: 50, reps: 12 } },
          { id: generateSetPlanId(), difficulty: { weight: 50, reps: 12 } },
        ],
      },
      {
        id: generateExercisePlanId(),
        metaId: getMeta("Barbell Squat").metaId,
        name: "Barbell Squat",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { weight: 85, reps: 6 } },
          { id: generateSetPlanId(), difficulty: { weight: 85, reps: 6 } },
          { id: generateSetPlanId(), difficulty: { weight: 85, reps: 6 } },
          { id: generateSetPlanId(), difficulty: { weight: 85, reps: 6 } },
          { id: generateSetPlanId(), difficulty: { weight: 85, reps: 6 } },
        ],
      },
      {
        id: generateExercisePlanId(),
        metaId: getMeta("Nordic Hamstring Curl").metaId,
        name: "Nordic Hamstring Curl",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
        ],
      },
    ],
  },
];
