import { BW, getMeta } from "@/constants";
import {
  BodyWeightDifficulty,
  DifficultyType,
  Exercise,
  TimeDifficulty,
  Trend,
  WeightDifficulty,
} from "@/interface";
import { getDaysBetween, removeDays, truncTime } from "@/util/date";
import { ArrayUtils, saveDiv } from "@/util/misc";
import { getBrzyckiMaxEstimate } from "./progress";

const MINIMUM_TIME_WINDOW_FOR_TRENDS_IN_DAYS = 14;
const MINIMUM_RECENT_TIME_WINDOW_PERFORMED = 14;
const MINIMUM_DAYS_PERFORMED = 4;
const MAX_TRENDS = 5;

type ExerciseJourney = {
  exerciseName: string;
  exerciseEfforts: Exercise[];
};

type ProgressEvaluation = {
  name: string;
  func: (exerciseEffort: Exercise) => number;
  format: (progress: number) => string;
};

function estimateOneRepMax(exerciseEffort: Exercise) {
  const bestSet = Math.max(
    ...exerciseEffort.sets.map(({ difficulty }) => {
      const { weight, reps } = difficulty as WeightDifficulty;
      return getBrzyckiMaxEstimate(weight, reps);
    })
  );

  return Math.round(bestSet * 10) / 10;
}

function adjustOneRepMaxEstimateForBodyweight(bodyweight: number) {
  return (exerciseEffort: Exercise) => {
    const bestSet = Math.max(
      ...exerciseEffort.sets.map(({ difficulty }) => {
        const { weight, reps } = difficulty as WeightDifficulty;
        return getBrzyckiMaxEstimate(bodyweight + weight, reps) - bodyweight;
      })
    );

    return Math.round(bestSet * 10) / 10;
  };
}

function getAverageRepsPerSet(exerciseEffort: Exercise) {
  const totalReps = exerciseEffort.sets
    .map(({ difficulty }) => (difficulty as BodyWeightDifficulty).reps)
    .reduce((totalReps, curerntReps) => totalReps + curerntReps);
  const average = totalReps / exerciseEffort.sets.length;
  return Math.round(average * 10) / 10;
}

function getAverageDurationPerSet(exerciseEffort: Exercise) {
  const totalDuration = exerciseEffort.sets
    .map(({ difficulty }) => (difficulty as TimeDifficulty).duration)
    .reduce(
      (totalDuration, currentDuration) => totalDuration + currentDuration
    );
  const average = totalDuration / exerciseEffort.sets.length;
  return Math.round(average * 10) / 10;
}

function getExerciseTypeToProgressionFuncMapping() {
  return new Map<DifficultyType, ProgressEvaluation>([
    [
      DifficultyType.WEIGHT,
      {
        name: "Estimated One Rep Max",
        func: estimateOneRepMax,
        format: (p) => `${p} lbs`,
      },
    ],
    [
      DifficultyType.WEIGHTED_BODYWEIGHT,
      {
        name: "Estimated One Rep Max",
        func: adjustOneRepMaxEstimateForBodyweight(BW),
        format: (p) => `${p} lbs`,
      },
    ],
    [
      DifficultyType.BODYWEIGHT,
      {
        name: "Average Reps Per Set",
        func: getAverageRepsPerSet,
        format: (p) => `${p} reps`,
      },
    ],
    [
      DifficultyType.TIME,
      {
        name: "Average Duration Per Set",
        func: getAverageDurationPerSet,
        format: (p) => `${p}s`,
      },
    ],
  ]);
}

function hasEnoughDataToTrend({ exerciseEfforts }: ExerciseJourney) {
  const setCompletions = exerciseEfforts.flatMap(({ sets }) =>
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
  if (trend1.delta === 0 || trend2.delta === 0) {
    return trend1.delta === 0 ? 1 : -1;
  }

  if (trend1.delta > 0 !== trend2.delta > 0) {
    return trend1.delta > 0 ? -1 : 1;
  }

  if (Math.abs(trend1.delta) > Math.abs(trend2.delta)) {
    return -1;
  } else if (Math.abs(trend1.delta) < Math.abs(trend2.delta)) {
    return 1;
  } else {
    return (
      ArrayUtils.last(trend2.data).timestamp -
      ArrayUtils.last(trend1.data).timestamp
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
      ArrayUtils.last(b.trend.data).timestamp -
      ArrayUtils.last(a.trend.data).timestamp
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

function getAdjustedRelativeDelta(trend: Trend, exerciseType: DifficultyType) {
  return saveDiv(
    trend.delta,
    trend.data[0].progress + getAdjustment(exerciseType)
  );
}

function generateTrends(journeys: ExerciseJourney[]): Trend[] {
  const exerciseTypeToProgressionMapping =
    getExerciseTypeToProgressionFuncMapping();

  const journeysByExerciseType = ArrayUtils.groupBy(
    journeys.filter(({ exerciseName: name }) =>
      exerciseTypeToProgressionMapping.has(getMeta(name))
    ),
    ({ exerciseName }) => getMeta(exerciseName)
  );

  const journeyTrends = journeysByExerciseType.flatMap(
    ({ key: difficultyType, items: journeys }) =>
      journeys.map((journey) => ({
        trend: generateTrend(
          journey,
          exerciseTypeToProgressionMapping.get(
            difficultyType
          ) as ProgressEvaluation
        ),
        type: difficultyType,
      }))
  );

  const candidateTrends = ArrayUtils.groupBy(journeyTrends, ({ type }) => {
    if (
      type === DifficultyType.WEIGHT ||
      type === DifficultyType.WEIGHTED_BODYWEIGHT
    ) {
      return DifficultyType.WEIGHT;
    }
    return type;
  }).flatMap(({ items: journeyTrends }) =>
    ArrayUtils.sortBy(
      journeyTrends,
      ({ trend }) => trend,
      compareTrendsOfSameExerciseType
    ).slice(0, MAX_TRENDS)
  );

  return candidateTrends
    .sort(compareTrendsOfDifferentExerciseType)
    .map(({ trend }) => trend)
    .splice(0, MAX_TRENDS);
}

function generateTrend(
  journey: ExerciseJourney,
  progressEvaluation: ProgressEvaluation
): Trend {
  const progressEvaluations = journey.exerciseEfforts
    .map((exercise) => ({
      progress: progressEvaluation.func(exercise),
      timestamp: truncTime(exercise.sets[0].restEndedAt as number),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const firstEvaluation = progressEvaluations[0];
  const lastEvaluation = ArrayUtils.last(progressEvaluations);

  const highEvaluation = ArrayUtils.maxBy(
    progressEvaluations,
    ({ progress }) => progress
  );
  const lowEvaluation = ArrayUtils.minBy(
    progressEvaluations,
    ({ progress }) => progress
  );

  const delta =
    Math.round((lastEvaluation.progress - firstEvaluation.progress) * 10) / 10;

  return {
    title: `${journey.exerciseName} - ${progressEvaluation.name}`,
    delta,
    high: highEvaluation.progress,
    low: lowEvaluation.progress,
    data: progressEvaluations,
    isImprovement: delta > 0,
    format: progressEvaluation.format,
  };
}

export function getTrends(exercises: Exercise[]): Trend[] {
  const journeys = ArrayUtils.groupBy(exercises, ({ name }) => name)
    .map(({ key, items }) => ({ exerciseName: key, exerciseEfforts: items }))
    .filter(hasEnoughDataToTrend);
  return generateTrends(journeys);
}
