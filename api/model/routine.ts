import {
  DifficultyType,
  ExerciseMeta,
  ExercisePlan,
  Routine,
  SetPlan,
} from "@/interface";
import { ArrayUtils } from "@/util/misc";
import {
  generateDefaultDifficulty,
  generateExercisePlanId,
  generateRoutineId,
  generateSetPlanId,
} from "./util";

const DEFAULT_REST_DURATION = 60;

function getExercisePlan(routine: Routine, exercisePlanId: string) {
  return routine.plan.find(({ id }) => id === exercisePlanId) as ExercisePlan;
}

function generateDefaultSet(difficultyType: DifficultyType): SetPlan {
  return {
    difficulty: generateDefaultDifficulty(difficultyType),
    id: generateSetPlanId(),
  };
}

function addExercisePlan(routine: Routine, meta: ExerciseMeta) {
  const exercisePlan: ExercisePlan = {
    sets: [generateDefaultSet(meta.difficultyType)],
    rest: DEFAULT_REST_DURATION,
    metaId: meta.metaId,
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
  const newSetPlans = [
    ...exercisePlan.sets,
    { ...ArrayUtils.last(exercisePlan.sets), id: generateSetPlanId() },
  ];

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
        metaId: "137",
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
        metaId: "146",
        rest: 60,
        sets: [
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
          { id: generateSetPlanId(), difficulty: { reps: 8 } },
        ],
      },
      {
        id: generateExercisePlanId(),
        metaId: "147",
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
        metaId: "191",
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
        metaId: "10",
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
        metaId: "173",
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
        metaId: "127",
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
        metaId: "176",
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
        metaId: "192",
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
        metaId: "163",
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
        metaId: "193",
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
