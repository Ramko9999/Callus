import { BodyWeightDifficulty, TimeDifficulty, WeightDifficulty } from "@/interface";

import { CompletedExercise } from "@/interface";
import { ArrayUtils } from "@/util/misc";

function getBrzyckiMaxEstimate(weight: number, reps: number): number {
    return (weight * 36) / (37 - reps);
}

export function getOneRepMaxEstimate(completion: CompletedExercise) {
    const bestSet = Math.max(
        ...completion.sets.map(({ difficulty }) => {
            const { weight, reps } = difficulty as WeightDifficulty;
            return getBrzyckiMaxEstimate(weight, reps);
        })
    );

    return Math.round(bestSet * 10) / 10;
}

export function getOneRepMaxEstimateForWeightedBodyWeight(
    completion: CompletedExercise
) {
    const bestSet = Math.max(
        ...completion.sets.map(({ difficulty }) => {
            const { weight, reps } = difficulty as WeightDifficulty;
            return (
                getBrzyckiMaxEstimate(weight + completion.bodyweight, reps) -
                completion.bodyweight
            );
        })
    );

    return Math.round(bestSet * 10) / 10;
}

export function getMaxRepsPerSet(completion: CompletedExercise) {
    return Math.max(
        ...completion.sets.map(({ difficulty }) => (difficulty as BodyWeightDifficulty).reps)
    );
}

export function getMaxDurationPerSet(completion: CompletedExercise) {
    return Math.max(
        ...completion.sets.map(({ difficulty }) => (difficulty as TimeDifficulty).duration)
    );
}

export function getAverageRepsPerSet(completion: CompletedExercise) {
    const average =
        ArrayUtils.sumBy(
            completion.sets,
            ({ difficulty }) => (difficulty as BodyWeightDifficulty).reps
        ) / completion.sets.length;
    return Math.round(average * 10) / 10;
}

export function getAverageWeightPerSet(completion: CompletedExercise) {
    const average =
        ArrayUtils.sumBy(
            completion.sets,
            ({ difficulty }) => (difficulty as WeightDifficulty).weight
        ) / completion.sets.length;
    return Math.round(average * 10) / 10;
}

export function getAverageDurationPerSet(completion: CompletedExercise) {
    const average =
        ArrayUtils.sumBy(
            completion.sets,
            ({ difficulty }) => (difficulty as TimeDifficulty).duration
        ) / completion.sets.length;
    return Math.round(average * 10) / 10;
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
    return Math.round(average * 10) / 10;
}