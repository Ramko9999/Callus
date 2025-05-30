import { CompletedExercise, SetStatus } from "@/interface";
import { addDays, removeDays, truncTime } from "@/util/date";
import { getMeta } from ".";

export const MOCK_EXERCISE = "Barbell Squat";

export function getMockCompletions(
  completionCount: number
): CompletedExercise[] {
  const originTimestamp = removeDays(truncTime(Date.now()), completionCount);
  const baseWeight = 100;
  return Array.from({ length: completionCount }).map((_, index) => ({
    id: `${index}`,
    name: MOCK_EXERCISE,
    metaId: getMeta(MOCK_EXERCISE).metaId,
    restDuration: 60,
    bodyweight: 150,
    workoutStartedAt: addDays(originTimestamp, index),
    sets: [
      {
        id: `set-${index}`,
        status: SetStatus.FINISHED,
        startedAt: addDays(originTimestamp, index),
        restStartedAt: addDays(originTimestamp, index) + 120_000,
        restEndedAt: addDays(originTimestamp, index) + 180_000,
        difficulty: {
          weight: baseWeight + 10 * index,
          reps: 8,
        },
        restDuration: 60,
      },
    ],
  }));
}
