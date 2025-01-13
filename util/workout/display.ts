import { NAME_TO_EXERCISE_META } from "@/api/exercise";
import {
  AssistedBodyWeightDifficulty,
  BodyWeightDifficulty,
  Difficulty,
  DifficultyType,
  Exercise,
  ExerciseMeta,
  SetStatus,
  TimeDifficulty,
  WeightDifficulty,
} from "@/interface";
import { getDurationDisplay } from "../date";

export function getLiveExerciseDescription(exercise: Exercise) {
  const totalSets = exercise.sets.length;
  const completedSets = exercise.sets.filter(
    ({ status }) => status === SetStatus.FINISHED
  ).length;
  const allSetsAreUnstarted = exercise.sets.every(
    ({ status }) => status === SetStatus.UNSTARTED
  );

  if (totalSets === completedSets) {
    return `All ${totalSets} sets completed!`;
  }

  if (allSetsAreUnstarted) {
    return `${totalSets} sets not yet started`;
  }

  return `${completedSets} of ${totalSets} sets completed`;
}

export function getHistoricalExerciseDescription(exercise: Exercise) {
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

  const description = [`${exercise.sets.length} sets`];
  const meta = NAME_TO_EXERCISE_META.get(exercise.name) as ExerciseMeta;
  if (
    meta.difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT ||
    meta.difficultyType == DifficultyType.WEIGHT
  ) {
    const reps = exercise.sets.map(
      ({ difficulty }) => (difficulty as WeightDifficulty).reps
    );
    const weight = exercise.sets.map(
      ({ difficulty }) => (difficulty as WeightDifficulty).weight
    );
    description.push(
      `of ${getDifficultyRange(weight)} lbs`,
      `for ${getDifficultyRange(reps)} reps`
    );
  } else if (meta.difficultyType === DifficultyType.BODYWEIGHT) {
    const reps = exercise.sets.map(
      ({ difficulty }) => (difficulty as BodyWeightDifficulty).reps
    );
    description.push(`for ${getDifficultyRange(reps)} reps`);
  } else if (meta.difficultyType === DifficultyType.ASSISTED_BODYWEIGHT) {
    const assistanceWeight = exercise.sets.map(
      ({ difficulty }) =>
        (difficulty as AssistedBodyWeightDifficulty).assistanceWeight
    );
    const reps = exercise.sets.map(
      ({ difficulty }) => (difficulty as AssistedBodyWeightDifficulty).reps
    );
    description.push(
      `of ${getDifficultyRange(assistanceWeight)} assistance lbs`,
      `for ${getDifficultyRange(reps)} reps`
    );
  } else {
    const duration = exercise.sets.map(
      ({ difficulty }) => (difficulty as TimeDifficulty).duration
    );
    description.push(`for ${getDifficultyRange(duration, getDurationDisplay)}`);
  }

  return description.join(" ");
}

export function getDifficultyDescription(difficultyType: DifficultyType, difficulty: Difficulty){
  if(difficultyType === DifficultyType.WEIGHT || difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT){
    const {weight, reps} = difficulty as WeightDifficulty;
    return `${weight} lbs for ${reps} reps`
  } else if (difficultyType === DifficultyType.BODYWEIGHT){
    const {reps} = difficulty as BodyWeightDifficulty
    return `${reps} reps`
  }
  else if (difficultyType === DifficultyType.ASSISTED_BODYWEIGHT){
    const {assistanceWeight, reps} = difficulty as AssistedBodyWeightDifficulty;
    return `${assistanceWeight} lbs of assistance for ${reps} reps`
  } else {
    const {duration} = difficulty as TimeDifficulty;
    return `${duration} seconds`
  }
}
