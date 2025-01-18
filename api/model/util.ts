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

export function generateRoutineId(){
    return generateRandomId("ro", 8)
}
