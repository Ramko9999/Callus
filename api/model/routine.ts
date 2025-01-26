import {
  DifficultyType,
  ExerciseMeta,
  ExercisePlan,
  Routine,
  SetPlan,
} from "@/interface";
import { getMeta } from "../exercise";
import { ArrayUtils } from "@/util/misc";
import { generateRoutineId } from "./util";

const DEFAULT_REST_DURATION = 60;

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
  return { difficulty };
}

function addExercisePlan(routine: Routine, meta: ExerciseMeta) {
  const exercisePlan: ExercisePlan = {
    sets: [generateDefaultSet(meta)],
    rest: DEFAULT_REST_DURATION,
    name: meta.name,
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
  index: number,
  update: Partial<ExercisePlan>
): Routine {
  const plan = routine.plan.map((exercise, exercisePlanIndex) => {
    const updateToApply = index === exercisePlanIndex ? update : {};
    return { ...exercise, ...updateToApply };
  });
  return { ...routine, plan };
}

function removeExercisePlan(routine: Routine, index: number) {
  const plan = routine.plan.filter(
    (_, exercisePlanIndex) => index !== exercisePlanIndex
  );
  return { ...routine, plan };
}

export const ExercisePlanActions = (routine: Routine) => ({
  add: (metas: ExerciseMeta[]) => addExercisePlans(routine, metas),
  update: (index: number, update: Partial<ExercisePlan>) =>
    updateExercisePlan(routine, index, update),
  remove: (index: number) => removeExercisePlan(routine, index),
});

function addSetPlan(routine: Routine, exercisePlanIndex: number) {
  const exercisePlan = routine.plan[exercisePlanIndex];

  const initialSetPlans = routine.plan[exercisePlanIndex].sets;
  let newSetPlans = [
    ...initialSetPlans,
    generateDefaultSet(getMeta(exercisePlan.name)),
  ];
  if (initialSetPlans.length > 0) {
    newSetPlans = [...initialSetPlans, { ...ArrayUtils.last(initialSetPlans) }];
  }

  return updateExercisePlan(routine, exercisePlanIndex, { sets: newSetPlans });
}

function removeSetPlan(
  routine: Routine,
  exercisePlanIndex: number,
  setPlanIndex: number
) {
  const newSetPlans = routine.plan[exercisePlanIndex].sets.filter(
    (_, index) => setPlanIndex !== index
  );
  return updateExercisePlan(routine, exercisePlanIndex, { sets: newSetPlans });
}

function updateSetPlan(
  routine: Routine,
  exercisePlanIndex: number,
  setPlanIndex: number,
  update: Partial<SetPlan>
) {
  const newSetPlans = routine.plan[exercisePlanIndex].sets.map(
    (plan, index) => {
      const updateToApply = index === setPlanIndex ? update : {};
      return { ...plan, ...updateToApply };
    }
  );
  return updateExercisePlan(routine, exercisePlanIndex, { sets: newSetPlans });
}

export const SetPlanActions = (routine: Routine, exerciseIndex: number) => ({
  add: () => addSetPlan(routine, exerciseIndex),
  remove: (index: number) => removeSetPlan(routine, exerciseIndex, index),
  update: (index: number, update: Partial<SetPlan>) =>
    updateSetPlan(routine, exerciseIndex, index, update),
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
