import {
  BodyWeightDifficulty,
  TimeDifficulty,
  WeightDifficulty,
  CompletedExercise,
  MetricGenerationResult,
} from "@/interface";

import { ArrayUtils } from "@/util/misc";

function getBrzyckiMaxEstimate(weight: number, reps: number): number {
  return (weight * 36) / (37 - reps);
}

export function getOneRepMaxEstimate(completion: CompletedExercise) {
  let bestSetId: string | undefined;
  let bestEstimate = 0;

  completion.sets.forEach((set) => {
    const { weight, reps } = set.difficulty as WeightDifficulty;
    const estimate = getBrzyckiMaxEstimate(weight, reps);
    if (estimate > bestEstimate) {
      bestEstimate = estimate;
      bestSetId = set.id;
    }
  });

  return {
    metric: Math.round(bestEstimate * 10) / 10,
    bestSetId,
  };
}

export function getOneRepMaxEstimateForWeightedBodyWeight(
  completion: CompletedExercise
): MetricGenerationResult {
  let bestSetId: string | undefined;
  let bestEstimate = 0;

  completion.sets.forEach((set) => {
    const { weight, reps } = set.difficulty as WeightDifficulty;
    const estimate =
      getBrzyckiMaxEstimate(weight + completion.bodyweight, reps) -
      completion.bodyweight;
    if (estimate > bestEstimate) {
      bestEstimate = estimate;
      bestSetId = set.id;
    }
  });

  return {
    metric: Math.round(bestEstimate * 10) / 10,
    bestSetId,
  };
}

export function getMaxRepsPerSet(completion: CompletedExercise) {
  let bestSetId: string | undefined;
  let maxReps = 0;

  completion.sets.forEach((set) => {
    const reps = (set.difficulty as BodyWeightDifficulty).reps;
    if (reps > maxReps) {
      maxReps = reps;
      bestSetId = set.id;
    }
  });

  return {
    metric: maxReps,
    bestSetId,
  };
}

export function getMaxDurationPerSet(completion: CompletedExercise) {
  let bestSetId: string | undefined;
  let maxDuration = 0;

  completion.sets.forEach((set) => {
    const duration = (set.difficulty as TimeDifficulty).duration;
    if (duration > maxDuration) {
      maxDuration = duration;
      bestSetId = set.id;
    }
  });

  return {
    metric: maxDuration,
    bestSetId,
  };
}

export function getAverageRepsPerSet(completion: CompletedExercise) {
  const average =
    ArrayUtils.sumBy(
      completion.sets,
      ({ difficulty }) => (difficulty as BodyWeightDifficulty).reps
    ) / completion.sets.length;

  return {
    metric: Math.round(average * 10) / 10,
  };
}

export function getAverageWeightPerSet(completion: CompletedExercise) {
  const average =
    ArrayUtils.sumBy(
      completion.sets,
      ({ difficulty }) => (difficulty as WeightDifficulty).weight
    ) / completion.sets.length;

  return {
    metric: Math.round(average * 10) / 10,
  };
}

export function getAverageDurationPerSet(completion: CompletedExercise) {
  const average =
    ArrayUtils.sumBy(
      completion.sets,
      ({ difficulty }) => (difficulty as TimeDifficulty).duration
    ) / completion.sets.length;

  return {
    metric: Math.round(average * 10) / 10,
  };
}

export function getAverageRestDurationPerSet(completion: CompletedExercise) {
  const setsWithRest = completion.sets.filter(
    ({ restStartedAt, restEndedAt }) =>
      restStartedAt != undefined && restEndedAt != undefined
  );
  if (setsWithRest.length === 0) {
    return;
  }

  const average =
    ArrayUtils.sumBy(setsWithRest, ({ restStartedAt, restEndedAt }) =>
      Math.floor(((restEndedAt as number) - (restStartedAt as number)) / 1000)
    ) / setsWithRest.length;

  return {
    metric: Math.round(average * 10) / 10,
  };
}

export function getTotalWeightVolume(completion: CompletedExercise) {
  const totalVolume =
    ArrayUtils.sumBy(
      completion.sets,
      ({ difficulty }) => (difficulty as WeightDifficulty).weight
    ) / completion.sets.length;
}
