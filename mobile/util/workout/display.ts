import {
  AssistedBodyWeightDifficulty,
  BodyWeightDifficulty,
  Difficulty,
  DifficultyType,
  Exercise,
  SetStatus,
  TimeDifficulty,
  WeightDifficulty,
} from "@/interface";
import { getDurationDisplay } from "../date";

export function getHistoricalExerciseDescription({
  difficulties,
  difficultyType,
}: {
  difficulties: Difficulty[];
  difficultyType: DifficultyType;
}) {
  function getDifficultyRange(
    values: number[],
    format?: (value: number) => string
  ) {
    const formatValue = format ? format : (value: number) => value.toString();

    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) {
      return `${formatValue(min)}`;
    }
    return `${formatValue(min)}-${formatValue(max)}`;
  }

  const description = [`${difficulties.length} sets`];
  if (
    difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT ||
    difficultyType == DifficultyType.WEIGHT
  ) {
    const reps = difficulties.map(
        (difficulty) => (difficulty as WeightDifficulty).reps
      );
    const weight = difficulties.map(
      (difficulty) => (difficulty as WeightDifficulty).weight
    );
    description.push(
      `of ${getDifficultyRange(weight)} lbs`,
      `for ${getDifficultyRange(reps)} reps`
    );
  } else if (difficultyType === DifficultyType.BODYWEIGHT) {
    const reps = difficulties.map(
      (difficulty) => (difficulty as BodyWeightDifficulty).reps
    );
    description.push(`for ${getDifficultyRange(reps)} reps`);
  } else if (difficultyType === DifficultyType.ASSISTED_BODYWEIGHT) {
    const assistanceWeight = difficulties.map(
      (difficulty) =>
        (difficulty as AssistedBodyWeightDifficulty).assistanceWeight
    );

    const reps = difficulties.map(
      (difficulty) => (difficulty as AssistedBodyWeightDifficulty).reps
    );
    description.push(
      `of ${getDifficultyRange(assistanceWeight)} assistance lbs`,
      `for ${getDifficultyRange(reps)} reps`
    );
  } else {
    const duration = difficulties.map(
      (difficulty) => (difficulty as TimeDifficulty).duration
    );
    description.push(`for ${getDifficultyRange(duration, getDurationDisplay)}`);
  }

  return description.join(" ");
}
