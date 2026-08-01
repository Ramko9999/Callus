import {
  Exercise,
  ExercisePlan,
  Set,
  SetPlan,
  SetStatus,
} from "@/interface";

/**
 * Routines hold SetPlan/ExercisePlan, which are the live workout's
 * Set/Exercise without runtime state. Adapting them here lets the live
 * workout's row and sheet components render routine data unchanged.
 */
export function setPlanToSet(plan: SetPlan): Set {
  return {
    id: plan.id,
    difficulty: plan.difficulty,
    status: SetStatus.UNSTARTED,
    restDuration: 0,
  };
}

export function exercisePlanToExercise(plan: ExercisePlan): Exercise {
  return {
    id: plan.id,
    metaId: plan.metaId,
    sets: plan.sets.map(setPlanToSet),
    restDuration: plan.rest,
  };
}
