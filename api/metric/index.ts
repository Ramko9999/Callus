import {
  CompletedExercise,
  DifficultyType,
  Metric,
  MetricConfig,
  MetricType,
} from "@/interface";
import { truncTime } from "@/util/date";
import { ArrayUtils } from "@/util/misc";
import { getAverageDurationPerSet, getAverageRepsPerSet, getAverageRestDurationPerSet, getAverageWeightPerSet, getOneRepMaxEstimate, getOneRepMaxEstimateForWeightedBodyWeight } from "./util"

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

const ONE_REP_MAX_METRIC_CONFIG: MetricConfig = {
  metricType: "Estimated 1 Rep Max" as MetricType,
  metricGeneration: getOneRepMaxEstimate,
  format: displayWeight,
  determineHasImproved: (a: number, b: number) => b > a,
};

const ONE_REP_MAX_METRIC_FOR_WEIGHTED_BODYWEIGHT_CONFIG: MetricConfig = {
  metricType: "Estimated 1 Rep Max" as MetricType,
  metricGeneration: getOneRepMaxEstimateForWeightedBodyWeight,
  format: displayWeight,
  determineHasImproved: (a: number, b: number) => b > a,
};

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
      type === DifficultyType.WEIGHT
        ? { ...ONE_REP_MAX_METRIC_CONFIG }
        : { ...ONE_REP_MAX_METRIC_FOR_WEIGHTED_BODYWEIGHT_CONFIG },
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

export function getToplineMetric(type: DifficultyType): MetricConfig {
  if (type === DifficultyType.WEIGHT) {
    return { ...ONE_REP_MAX_METRIC_CONFIG };
  } else if (type === DifficultyType.WEIGHTED_BODYWEIGHT) {
    return { ...ONE_REP_MAX_METRIC_FOR_WEIGHTED_BODYWEIGHT_CONFIG };
  } else if (type === DifficultyType.BODYWEIGHT) {
    return { ...AVERAGE_REP_METRIC_CONFIG };
  } else if (type === DifficultyType.TIME) {
    return { ...AVERAGE_DURATION_METRIC_CONFIG };
  } else {
    return { ...AVERAGE_REST_DURATION_METRIC_CONFIG };
  }
}

export function computeMetric(
  completions: CompletedExercise[],
  metricConfig: MetricConfig
): Metric {
  const points = completions
    .flatMap((completion) => {
      const value = metricConfig.metricGeneration(completion);
      if (value != undefined) {
        return [{ value, timestamp: truncTime(completion.workoutStartedAt) }];
      }
      return [];
    })
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
