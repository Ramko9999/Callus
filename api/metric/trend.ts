import { BW } from "@/constants";
import { DifficultyType, Exercise, Trend } from "@/interface";
import { getDaysBetween, removeDays, truncTime } from "@/util/date";
import { ArrayUtils, safeDiv } from "@/util/misc";
import { getDifficultyType } from "../exercise";
import * as MetricApi from ".";

const MINIMUM_TIME_WINDOW_FOR_TRENDS_IN_DAYS = 14;
const MINIMUM_RECENT_TIME_WINDOW_PERFORMED = 14;
const MINIMUM_DAYS_PERFORMED = 4;
const MAX_TRENDS = 5;

type ExerciseCompletions = {
  name: string;
  completions: Exercise[];
};

function hasEnoughDataToTrend({ completions }: ExerciseCompletions) {
  const setCompletions = completions.flatMap(({ sets }) =>
    sets.map(({ restEndedAt }) => restEndedAt as number)
  );

  const earliestTimePerformed = Math.min(...setCompletions);
  const latestTimePerformed = Math.max(...setCompletions);

  const hasEnoughTime =
    getDaysBetween(earliestTimePerformed, latestTimePerformed) >=
    MINIMUM_TIME_WINDOW_FOR_TRENDS_IN_DAYS;

  const hasEnoughDaysPerformed =
    new Set(setCompletions.map((setCompletion) => truncTime(setCompletion)))
      .size >= MINIMUM_DAYS_PERFORMED;

  const hasPerformedRecently =
    latestTimePerformed >=
    removeDays(truncTime(Date.now()), MINIMUM_RECENT_TIME_WINDOW_PERFORMED);

  return hasEnoughTime && hasEnoughDaysPerformed && hasPerformedRecently;
}

function compareTrendsOfSameExerciseType(trend1: Trend, trend2: Trend) {
  if (trend1.metric.delta === 0 || trend2.metric.delta === 0) {
    return trend1.metric.delta === 0 ? 1 : -1;
  }

  if (trend1.metric.delta > 0 !== trend2.metric.delta > 0) {
    return trend1.metric.delta > 0 ? -1 : 1;
  }

  if (Math.abs(trend1.metric.delta) > Math.abs(trend2.metric.delta)) {
    return -1;
  } else if (Math.abs(trend1.metric.delta) < Math.abs(trend2.metric.delta)) {
    return 1;
  } else {
    return (
      ArrayUtils.last(trend2.metric.points).timestamp -
      ArrayUtils.last(trend1.metric.points).timestamp
    );
  }
}

function compareTrendsOfDifferentExerciseType(
  a: { trend: Trend; type: DifficultyType },
  b: { trend: Trend; type: DifficultyType }
) {
  const aRelativeDelta = getAdjustedRelativeDelta(a.trend, a.type);

  const bRelativeDelta = getAdjustedRelativeDelta(b.trend, b.type);

  if (aRelativeDelta === 0 || bRelativeDelta === 0) {
    return aRelativeDelta === 0 ? 1 : -1;
  }
  if (aRelativeDelta > 0 !== bRelativeDelta > 0) {
    return aRelativeDelta > 0 ? -1 : 1;
  }

  if (Math.abs(aRelativeDelta) > Math.abs(bRelativeDelta)) {
    return -1;
  } else if (Math.abs(aRelativeDelta) < Math.abs(bRelativeDelta)) {
    return 1;
  } else {
    return (
      ArrayUtils.last(b.trend.metric.points).timestamp -
      ArrayUtils.last(a.trend.metric.points).timestamp
    );
  }
}

function getAdjustment(exerciseType: DifficultyType) {
  if (
    exerciseType === DifficultyType.WEIGHT ||
    exerciseType === DifficultyType.WEIGHTED_BODYWEIGHT
  ) {
    return 50;
  }
  return 0;
}

function getAdjustedRelativeDelta(trend: Trend, type: DifficultyType) {
  return safeDiv(
    trend.metric.delta,
    trend.metric.points[0].value + getAdjustment(type)
  );
}

function generateTrends(exerciseCompletions: ExerciseCompletions[]): Trend[] {
  const exerciseCompletionsByType = ArrayUtils.groupBy(
    exerciseCompletions,
    ({ name }) => getDifficultyType(name)
  );

  const typeTrends = exerciseCompletionsByType.flatMap(
    ({ key: difficultyType, items: exerciseCompletions }) =>
      exerciseCompletions.map((exerciseCompletion) => ({
        trend: generateTrend(exerciseCompletion, difficultyType),
        type: difficultyType,
      }))
  );

  const candidateTrends = ArrayUtils.groupBy(typeTrends, ({ type }) => {
    if (
      type === DifficultyType.WEIGHT ||
      type === DifficultyType.WEIGHTED_BODYWEIGHT
    ) {
      return DifficultyType.WEIGHT;
    }
    return type;
  }).flatMap(({ items: trends }) =>
    ArrayUtils.sortBy(
      trends,
      ({ trend }) => trend,
      compareTrendsOfSameExerciseType
    ).slice(0, MAX_TRENDS)
  );

  return candidateTrends
    .sort(compareTrendsOfDifferentExerciseType)
    .map(({ trend }) => trend)
    .splice(0, MAX_TRENDS);
}

export function generateTrend(
  exerciseCompletion: ExerciseCompletions,
  type: DifficultyType
): Trend {
  const metricConfig = MetricApi.getToplineMetric(type, BW);
  const metric = MetricApi.computeMetric(
    exerciseCompletion.completions,
    metricConfig
  );

  return {
    title: `${exerciseCompletion.name} - ${metric.metricType}`,
    metric,
  };
}

export function getTrends(exercises: Exercise[]): Trend[] {
  const exerciseCompletions = ArrayUtils.groupBy(exercises, ({ name }) => name)
    .map(({ key: name, items: completions }) => ({ name, completions }))
    .filter(hasEnoughDataToTrend);
  return generateTrends(exerciseCompletions);
}
