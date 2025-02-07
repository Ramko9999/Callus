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
