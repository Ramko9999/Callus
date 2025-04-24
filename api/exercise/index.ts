import STATIC_EXERCISE_REPOSITORY from "@/assets/exercises/exerciseMetas.json";
import { DifficultyType, ExerciseMeta } from "@/interface";

export const EXERCISE_REPOSITORY: ExerciseMeta[] =
  STATIC_EXERCISE_REPOSITORY.map((staticMeta) => ({
    ...staticMeta,
    difficultyType:
      DifficultyType[staticMeta.difficultyType as keyof typeof DifficultyType],
  }));


export const ID_TO_EXERCISE_META: Map<string, ExerciseMeta> = new Map(
  EXERCISE_REPOSITORY.map((meta) => [meta.metaId, meta])
);

export const NAME_TO_EXERCISE_META: Map<string, ExerciseMeta> = new Map(
  EXERCISE_REPOSITORY.map((meta) => [meta.name, meta])
);

export const MUSCLE_GROUPS = Array.from(
  new Set(STATIC_EXERCISE_REPOSITORY.map(({ muscles }) => muscles[0]))
).slice(0, 7);

export const DISPLAY_EXERCISE_TYPES = ["Bodyweight", "Weight", "Time"];

export const DISPLAY_EXERCISE_TYPE_TO_TYPE: {[index: string]: DifficultyType[]} = {
  Bodyweight: [DifficultyType.BODYWEIGHT],
  Weight: [DifficultyType.WEIGHT, DifficultyType.WEIGHTED_BODYWEIGHT],
  Time: [DifficultyType.TIME],
};

export function getMeta(name: string): ExerciseMeta {
  return NAME_TO_EXERCISE_META.get(name) as ExerciseMeta;
}

export function getDifficultyType(name: string): DifficultyType {
  return getMeta(name).difficultyType;
}
