import { DifficultyType, ExerciseMeta } from "@/interface";
import { generateCustomExerciseId } from "./util";

export type CustomExercise = {
  id: string;
  name: string;
  type: DifficultyType;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  description?: string;
};

export function createCustomExercise(
  name: string,
  type: DifficultyType,
  primaryMuscles: string[],
  secondaryMuscles: string[],
  description?: string
) {
  return {
    id: generateCustomExerciseId(),
    name,
    type,
    primaryMuscles,
    secondaryMuscles,
    description,
  };
}

export function updateCustomExercise(
  customExercise: CustomExercise,
  update: Partial<CustomExercise>
) {
  return {
    ...customExercise,
    ...update,
  };
}

export function toExerciseMeta(customExercise: CustomExercise): ExerciseMeta {
  return {
    metaId: customExercise.id,
    name: customExercise.name,
    difficultyType: customExercise.type,
    primaryMuscles: customExercise.primaryMuscles,
    secondaryMuscles: customExercise.secondaryMuscles,
    description: customExercise.description || "",
  };
}
