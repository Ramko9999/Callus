import {
  BodyWeightDifficulty,
  DifficultyType,
  Exercise,
  Metric,
  MetricConfig,
  MetricGenerationFunc,
  MetricType,
  TimeDifficulty,
  WeightDifficulty,
} from "@/interface";
import { truncTime } from "@/util/date";
import { ArrayUtils } from "@/util/misc";

function getBrzyckiMaxEstimate(weight: number, reps: number): number {
  return (weight * 36) / (37 - reps);
}

function getOneRepMaxEstimate(completion: Exercise) {
  const bestSet = Math.max(
    ...completion.sets.map(({ difficulty }) => {
      const { weight, reps } = difficulty as WeightDifficulty;
      return getBrzyckiMaxEstimate(weight, reps);
    })
  );

  return Math.round(bestSet * 10) / 10;
}

function adjustOneRepMaxEstimateForBodyweight(
  bodyweight: number
): MetricGenerationFunc {
  return (completion: Exercise) => {
    const bestSet = Math.max(
      ...completion.sets.map(({ difficulty }) => {
        const { weight, reps } = difficulty as WeightDifficulty;
        return getBrzyckiMaxEstimate(bodyweight + weight, reps) - bodyweight;
      })
    );

    return Math.round(bestSet * 10) / 10;
  };
}

function getAverageRepsPerSet(completion: Exercise) {
  const average =
    ArrayUtils.sumBy(
      completion.sets,
      ({ difficulty }) => (difficulty as BodyWeightDifficulty).reps
    ) / completion.sets.length;
  return Math.round(average * 10) / 10;
}

function getAverageWeightPerSet(completion: Exercise) {
  const average =
    ArrayUtils.sumBy(
      completion.sets,
      ({ difficulty }) => (difficulty as WeightDifficulty).weight
    ) / completion.sets.length;
  return Math.round(average * 10) / 10;
}

function getAverageDurationPerSet(completion: Exercise) {
  const average =
    ArrayUtils.sumBy(
      completion.sets,
      ({ difficulty }) => (difficulty as TimeDifficulty).duration
    ) / completion.sets.length;
  return Math.round(average * 10) / 10;
}

function getAverageRestDurationPerSet(completion: Exercise) {
  const average =
    ArrayUtils.sumBy(completion.sets, ({ restStartedAt, restEndedAt }) =>
      Math.floor(((restEndedAt as number) - (restStartedAt as number)) / 1000)
    ) / completion.sets.length;
  return Math.round(average * 10) / 10;
}

function displayWeight(weight: number) {
  return `${weight} lbs`;
}

function displayReps(reps: number) {
  return `${reps} reps`;
}

function displayDuration(seconds: number) {
  return `${seconds}s`;
}

const AVERAGE_WEIGHT_METRIC_CONFIG: MetricConfig = {
  metricType: "Average Weight",
  metricGeneration: getAverageWeightPerSet,
  format: displayWeight,
  determineHasImproved: (a, b) => b > a,
};

const AVERAGE_REP_METRIC_CONFIG: MetricConfig = {
  metricType: "Average Reps",
  metricGeneration: getAverageRepsPerSet,
  format: displayReps,
  determineHasImproved: (a, b) => b > a,
};

const AVERAGE_DURATION_METRIC_CONFIG: MetricConfig = {
  metricType: "Average Duration",
  metricGeneration: getAverageDurationPerSet,
  format: displayDuration,
  determineHasImproved: (a, b) => b > a,
};

const AVERAGE_REST_DURATION_METRIC_CONFIG: MetricConfig = {
  metricType: "Average Rest Duration",
  metricGeneration: getAverageRestDurationPerSet,
  format: displayDuration,
  determineHasImproved: (a, b) => b < a,
};

const GET_ESTIMATED_ONE_REP_MAX_METRIC_CONFIG = (
  oneRepMaxEstimation: MetricGenerationFunc
) => ({
  metricType: "Estimated 1 Rep Max" as MetricType,
  metricGeneration: oneRepMaxEstimation,
  format: displayWeight,
  determineHasImproved: (a: number, b: number) => b > a,
});

export function getPossibleMetrics(type: DifficultyType, bodyweight: number) {
  let metrics: MetricConfig[];
  if (
    type === DifficultyType.WEIGHT ||
    type === DifficultyType.WEIGHTED_BODYWEIGHT
  ) {
    metrics = [
      { ...AVERAGE_WEIGHT_METRIC_CONFIG },
      { ...AVERAGE_REP_METRIC_CONFIG },
      { ...AVERAGE_REST_DURATION_METRIC_CONFIG },
      GET_ESTIMATED_ONE_REP_MAX_METRIC_CONFIG(
        type === DifficultyType.WEIGHT
          ? getOneRepMaxEstimate
          : adjustOneRepMaxEstimateForBodyweight(bodyweight)
      ),
    ];
  } else if (type === DifficultyType.BODYWEIGHT) {
    metrics = [
      { ...AVERAGE_REP_METRIC_CONFIG },
      { ...AVERAGE_REST_DURATION_METRIC_CONFIG },
    ];
  } else if (type === DifficultyType.TIME) {
    metrics = [
      { ...AVERAGE_DURATION_METRIC_CONFIG },
      { ...AVERAGE_REST_DURATION_METRIC_CONFIG },
    ];
  } else {
    metrics = [{ ...AVERAGE_REST_DURATION_METRIC_CONFIG }];
  }
  return metrics;
}

export function getToplineMetric(
  type: DifficultyType,
  bodyweight: number
): MetricConfig {
  if (
    type === DifficultyType.WEIGHT ||
    type === DifficultyType.WEIGHTED_BODYWEIGHT
  ) {
    return GET_ESTIMATED_ONE_REP_MAX_METRIC_CONFIG(
      type === DifficultyType.WEIGHT
        ? getOneRepMaxEstimate
        : adjustOneRepMaxEstimateForBodyweight(bodyweight)
    );
  } else if (type === DifficultyType.BODYWEIGHT) {
    return { ...AVERAGE_REP_METRIC_CONFIG };
  } else if (type === DifficultyType.TIME) {
    return { ...AVERAGE_DURATION_METRIC_CONFIG };
  } else {
    return { ...AVERAGE_REST_DURATION_METRIC_CONFIG };
  }
}

export function computeMetric(
  completions: Exercise[],
  metricConfig: MetricConfig
): Metric {
  const points = completions
    .map((completion) => ({
      value: metricConfig.metricGeneration(completion),
      timestamp: truncTime(completion.sets[0].restEndedAt as number),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const first = points[0].value;
  const last = ArrayUtils.last(points).value;

  const high = ArrayUtils.maxBy(points, ({ value }) => value).value;

  const low = ArrayUtils.minBy(points, ({ value }) => value).value;

  return {
    metricType: metricConfig.metricType,
    format: metricConfig.format,
    delta: Math.round((last - first) * 10) / 10,
    hasImproved: metricConfig.determineHasImproved(first, last),
    high,
    low,
    points,
    first,
    last,
  };
}
