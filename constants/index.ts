import { DifficultyType, ExerciseMeta } from "@/interface";
import STATIC_EXERCISE_REPOSITORY from "@/assets/exercises/exerciseMetas.json";

// test-v3-10-6
export const STORAGE_NAMESPACE = "test-v9-10-23";
export const EXERCISE_REPOSITORY: ExerciseMeta[] =
  STATIC_EXERCISE_REPOSITORY.map((staticMeta) => ({
    ...staticMeta,
    difficultyType:
      DifficultyType[staticMeta.difficultyType as keyof typeof DifficultyType],
  }));

export const NAME_TO_EXERCISE_META: Map<string, ExerciseMeta> = new Map(
  EXERCISE_REPOSITORY.map((meta) => [meta.name, meta])
);

// todo: store this in the settings
export const BW = 150;

const DB_VERSION = "v2";
export const DB_NAME = `store-${DB_VERSION}.db`