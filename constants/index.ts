import { DifficultyType, ExerciseMeta } from "@/interface";

export const STORAGE_NAMESPACE = "test-v3-10-6";

export const EXERCISE_REPOSITORY: ExerciseMeta[] = [
  { name: "Bench Press", difficultyType: DifficultyType.WEIGHT },
  { name: "Shoulder Press", difficultyType: DifficultyType.WEIGHT },
  { name: "Pull Up", difficultyType: DifficultyType.BODY_WEIGHT },
  { name: "Dip", difficultyType: DifficultyType.BODY_WEIGHT },
  { name: "Lateral Raises", difficultyType: DifficultyType.WEIGHT },
  { name: "Squat", difficultyType: DifficultyType.WEIGHT },
];
