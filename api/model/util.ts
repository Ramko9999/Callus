import { Difficulty, DifficultyType, Set, SetStatus } from "@/interface";

function generateRandomId(prefix = "", length = 8) {
  return `${prefix}-${Math.random().toString(36).substring(2, length)}`;
}

export function generateSetId() {
  return generateRandomId("st", 8);
}

export function generateExerciseId() {
  return generateRandomId("ex", 8);
}

export function generateWorkoutId() {
  return generateRandomId("wrk", 8);
}

export function generateRoutineId() {
  return generateRandomId("ro", 8);
}

export function generateExercisePlanId() {
  return generateRandomId("epl", 8);
}

export function generateSetPlanId() {
  return generateRandomId("spl", 8);
}

export function generateCustomExerciseId() {
  return generateRandomId("cex", 8);
}

export function getQuickstartWorkoutName() {
  const date = new Date(Date.now());
  if (date.getHours() >= 0 && date.getHours() < 5) {
    return "Midnight Workout";
  } else if (date.getHours() >= 5 && date.getHours() < 11) {
    return "Morning Workout";
  } else if (date.getHours() >= 11 && date.getHours() <= 17) {
    return "Afternoon Workout";
  } else {
    return "Evening Workout";
  }
}

export function generateDefaultDifficulty(type: DifficultyType): Difficulty {
  let difficulty: Difficulty;
  if (type === DifficultyType.ASSISTED_BODYWEIGHT) {
    difficulty = { assistanceWeight: 0, reps: 0 };
  } else if (type === DifficultyType.TIME) {
    difficulty = { duration: 60 };
  } else if (type === DifficultyType.WEIGHT) {
    difficulty = { reps: 0, weight: 0 };
  } else if (type === DifficultyType.WEIGHTED_BODYWEIGHT) {
    difficulty = { reps: 0, weight: 0 };
  } else {
    difficulty = { reps: 0 };
  }
  return difficulty;
}

export function createDefaultSet(type: DifficultyType, restDuration: number): Set {
  let difficulty: Difficulty;
  if (type === DifficultyType.ASSISTED_BODYWEIGHT) {
    difficulty = { assistanceWeight: 0, reps: 0 };
  } else if (type === DifficultyType.TIME) {
    difficulty = { duration: 60 };
  } else if (type === DifficultyType.WEIGHT) {
    difficulty = { reps: 0, weight: 0 };
  } else if (type === DifficultyType.WEIGHTED_BODYWEIGHT) {
    difficulty = { reps: 0, weight: 0 };
  } else {
    difficulty = { reps: 0 };
  }

  return {
    id: generateSetId(),
    status: SetStatus.UNSTARTED,
    restDuration,
    difficulty: difficulty,
  };
}
