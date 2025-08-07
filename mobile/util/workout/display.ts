import {
  AssistedBodyWeightDifficulty,
  BodyWeightDifficulty,
  Difficulty,
  DifficultyType,
  Exercise,
  Set,
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

export function getInProgressExerciseDescription(
  exercise: Exercise,
  difficultyType: DifficultyType
) {
  if (!exercise || !exercise.sets || exercise.sets.length === 0) {
    return "0 sets";
  }

  const setCount = exercise.sets.length;
  const completedSets = exercise.sets.filter(
    (set) => set.status !== SetStatus.UNSTARTED
  ).length;
  const allSetsCompleted = completedSets === setCount;

  switch (difficultyType) {
    case DifficultyType.WEIGHT:
    case DifficultyType.WEIGHTED_BODYWEIGHT: {
      let completedWeight = 0;
      let completedReps = 0;
      let totalWeight = 0;
      let totalReps = 0;

      exercise.sets.forEach((set: Set) => {
        const weightDiff = set.difficulty as WeightDifficulty;
        const setWeight = weightDiff.weight * weightDiff.reps;
        const setReps = weightDiff.reps;

        totalWeight += setWeight;
        totalReps += setReps;

        if (set.status !== SetStatus.UNSTARTED) {
          completedWeight += setWeight;
          completedReps += setReps;
        }
      });

      if (allSetsCompleted) {
        return `${setCount} sets • ${Math.round(
          totalWeight
        )} lbs • ${totalReps} reps`;
      } else {
        return `${Math.round(completedWeight)}/${Math.round(
          totalWeight
        )} lbs • ${completedReps}/${totalReps} reps`;
      }
    }
    case DifficultyType.BODYWEIGHT:
    case DifficultyType.ASSISTED_BODYWEIGHT: {
      let completedReps = 0;
      let totalReps = 0;

      exercise.sets.forEach((set: Set) => {
        const bodyweightDiff = set.difficulty as BodyWeightDifficulty;
        const setReps = bodyweightDiff.reps;

        totalReps += setReps;
        if (set.status !== SetStatus.UNSTARTED) {
          completedReps += setReps;
        }
      });

      if (allSetsCompleted) {
        return `${setCount} sets • ${totalReps} reps`;
      } else {
        return `${completedReps}/${totalReps} reps`;
      }
    }
    case DifficultyType.TIME: {
      let completedDuration = 0;
      let totalDuration = 0;

      exercise.sets.forEach((set: Set) => {
        const timeDiff = set.difficulty as TimeDifficulty;
        const setDuration = timeDiff.duration;

        totalDuration += setDuration;
        if (set.status !== SetStatus.UNSTARTED) {
          completedDuration += setDuration;
        }
      });

      if (allSetsCompleted) {
        return `${setCount} sets • ${getDurationDisplay(totalDuration)}`;
      } else {
        return `${getDurationDisplay(
          completedDuration
        )} of ${getDurationDisplay(totalDuration)}`;
      }
    }
    default:
      if (allSetsCompleted) {
        return `${setCount} sets`;
      } else {
        return `${completedSets}/${setCount} sets`;
      }
  }
}
