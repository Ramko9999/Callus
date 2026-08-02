#!/usr/bin/env node
/**
 * Generates realistic seed workout data for the Callus app, in the exact
 * JSON shape its Settings > Import feature accepts:
 *
 *   { workouts: Workout[], routines: Routine[], customExercises: [] }
 *
 * Format was reverse engineered (not guessed) from:
 *   - mobile/components/pages/settings/index.tsx (exportAppData)
 *   - mobile/components/sheets/import-progress.tsx (handleImport)
 *   - mobile/interface/index.ts (Workout/Exercise/Set/Routine/... types)
 *   - mobile/api/model/util.ts (id generators: st-/ex-/wrk-/ro-/epl-/spl-/cex-)
 *   - mobile/api/model/routine.ts (INITIAL_ROUTINES shape)
 *   - mobile/api/store/index.ts + sql.ts (what actually gets persisted -
 *     confirms there is no extra required field/version beyond the interface)
 *   - mobile/assets/exercises/exerciseMetas.json (real metaId values)
 *
 * Usage:
 *   node generate.js               # writes seed.json next to this script
 *   node generate.js > out.json    # or pipe to stdout
 *
 * IMPORTANT CAVEAT discovered while reading the import code: on this branch,
 * components/sheets/import-progress.tsx unconditionally does
 * `let { workouts, routines, customExercises } = JSON.parse(content); routines = [];`
 * which means routines in the import file are currently silently DISCARDED
 * on import (the "routines" stat will always show 0). We still generate a
 * correct `routines` array here (matching the export/import schema exactly)
 * so the file is correct and future-proof, but be aware today's build will
 * not actually create routine rows from it.
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Tunable constants
// ---------------------------------------------------------------------------

const TODAY = new Date(); // "today" - script always ends history here
const WEEKS_OF_HISTORY = 13; // ~3 months
const WORKOUTS_PER_WEEK_TARGET = 4; // Push/Pull/Legs, ~4x/week
const STARTING_BODYWEIGHT_LBS = 176;
const ENDING_BODYWEIGHT_DRIFT_LBS = -3; // slight recomposition over 3 months
const RANDOM_SEED = 42; // deterministic output

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) so re-runs are reproducible
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(RANDOM_SEED);
const randRange = (min, max) => min + rand() * (max - min);
const randInt = (min, max) => Math.floor(randRange(min, max + 1));
const choice = (arr) => arr[randInt(0, arr.length - 1)];

// ---------------------------------------------------------------------------
// Id generators - copied verbatim from mobile/api/model/util.ts so imported
// rows are indistinguishable from ones the app itself created.
// ---------------------------------------------------------------------------

let idCounter = 0;
function generateRandomId(prefix = "") {
  // Mirrors generateRandomId(prefix, length) in api/model/util.ts, but salts
  // with a monotonic counter so thousands of ids generated in a tight loop
  // never collide (Math.random().toString(36) alone can repeat at this volume).
  idCounter += 1;
  const rnd = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${rnd}${idCounter.toString(36)}`;
}
const generateSetId = () => generateRandomId("st");
const generateExerciseId = () => generateRandomId("ex");
const generateWorkoutId = () => generateRandomId("wrk");
const generateRoutineId = () => generateRandomId("ro");
const generateExercisePlanId = () => generateRandomId("epl");
const generateSetPlanId = () => generateRandomId("spl");

// ---------------------------------------------------------------------------
// DifficultyType / SetStatus enums, copied from mobile/interface/index.ts
// (SetStatus is a numeric TS enum: UNSTARTED=0, RESTING=1, FINISHED=2)
// ---------------------------------------------------------------------------

const DifficultyType = {
  WEIGHT: "WEIGHT",
  BODYWEIGHT: "BODYWEIGHT",
  ASSISTED_BODYWEIGHT: "ASSISTED_BODYWEIGHT",
  WEIGHTED_BODYWEIGHT: "WEIGHTED_BODYWEIGHT",
  TIME: "TIME",
};
const SetStatus = { UNSTARTED: 0, RESTING: 1, FINISHED: 2 };

// ---------------------------------------------------------------------------
// Real exercise metadata, cross-referenced against
// mobile/assets/exercises/exerciseMetas.json (verified below in main()).
// ---------------------------------------------------------------------------

const EXERCISES = {
  BENCH_PRESS: { metaId: "22", name: "Bench Press", type: DifficultyType.WEIGHT },
  MILITARY_PRESS: { metaId: "127", name: "Military Press", type: DifficultyType.WEIGHT },
  INCLINE_DB_PRESS: { metaId: "219", name: "Incline Dumbbell Press", type: DifficultyType.WEIGHT },
  DIP: { metaId: "10", name: "Dip", type: DifficultyType.BODYWEIGHT },
  CABLE_TRICEP_EXT: { metaId: "190", name: "Cable Tricep Extension", type: DifficultyType.WEIGHT },

  DEADLIFT: { metaId: "49", name: "Deadlift", type: DifficultyType.WEIGHT },
  BARBELL_ROW: { metaId: "16", name: "Barbell Row", type: DifficultyType.WEIGHT },
  PULL_UP: { metaId: "137", name: "Pull-Up", type: DifficultyType.BODYWEIGHT },
  LAT_PULLDOWN: { metaId: "105", name: "Lat Pull-Down", type: DifficultyType.WEIGHT },
  BARBELL_CURL: { metaId: "11", name: "Barbell Curl", type: DifficultyType.WEIGHT },

  SQUAT: { metaId: "163", name: "Barbell Squat", type: DifficultyType.WEIGHT },
  LEG_PRESS: { metaId: "212", name: "Leg Press", type: DifficultyType.WEIGHT },
  ROMANIAN_DEADLIFT: { metaId: "148", name: "Romanian Deadlift", type: DifficultyType.WEIGHT },
  LEG_EXTENSION: { metaId: "192", name: "Leg Extension", type: DifficultyType.WEIGHT },
  HOLLOW_BODY_HOLD: { metaId: "182", name: "Hollow Body Hold", type: DifficultyType.TIME },
};

// Push / Pull / Legs split. Each entry defines the exercise plus the
// progressive-overload profile used to synthesize weeks of history.
//
//   startWeight/startReps: week-0 performance
//   weeklyWeightGain: average lb increase per week (WEIGHT/lb-based lifts)
//   weeklyRepGain: average rep increase per week (BODYWEIGHT/TIME lifts, or
//                  additional rep creep layered on top of weight lifts)
//   sets: how many working sets per session
//   restSec: seconds of rest between sets
const SPLIT = {
  Push: {
    routineName: "Push Day",
    exercises: [
      { ex: EXERCISES.BENCH_PRESS, startWeight: 135, weeklyWeightGain: 1.6, startReps: 6, sets: 4, restSec: 120 },
      { ex: EXERCISES.MILITARY_PRESS, startWeight: 65, weeklyWeightGain: 0.9, startReps: 7, sets: 3, restSec: 90 },
      { ex: EXERCISES.INCLINE_DB_PRESS, startWeight: 45, weeklyWeightGain: 0.7, startReps: 8, sets: 3, restSec: 90 },
      { ex: EXERCISES.DIP, startReps: 8, weeklyRepGain: 0.35, sets: 3, restSec: 75 },
      { ex: EXERCISES.CABLE_TRICEP_EXT, startWeight: 40, weeklyWeightGain: 0.6, startReps: 10, sets: 3, restSec: 60 },
    ],
  },
  Pull: {
    routineName: "Pull Day",
    exercises: [
      { ex: EXERCISES.DEADLIFT, startWeight: 185, weeklyWeightGain: 3.2, startReps: 5, sets: 3, restSec: 150 },
      { ex: EXERCISES.BARBELL_ROW, startWeight: 115, weeklyWeightGain: 1.3, startReps: 8, sets: 3, restSec: 90 },
      { ex: EXERCISES.PULL_UP, startReps: 6, weeklyRepGain: 0.3, sets: 4, restSec: 90 },
      { ex: EXERCISES.LAT_PULLDOWN, startWeight: 90, weeklyWeightGain: 0.8, startReps: 9, sets: 3, restSec: 75 },
      { ex: EXERCISES.BARBELL_CURL, startWeight: 45, weeklyWeightGain: 0.5, startReps: 9, sets: 3, restSec: 60 },
    ],
  },
  Legs: {
    routineName: "Leg Day",
    exercises: [
      { ex: EXERCISES.SQUAT, startWeight: 165, weeklyWeightGain: 2.6, startReps: 6, sets: 4, restSec: 150 },
      { ex: EXERCISES.LEG_PRESS, startWeight: 230, weeklyWeightGain: 3.5, startReps: 10, sets: 3, restSec: 100 },
      { ex: EXERCISES.ROMANIAN_DEADLIFT, startWeight: 135, weeklyWeightGain: 1.4, startReps: 8, sets: 3, restSec: 100 },
      { ex: EXERCISES.LEG_EXTENSION, startWeight: 90, weeklyWeightGain: 1.0, startReps: 11, sets: 3, restSec: 60 },
      { ex: EXERCISES.HOLLOW_BODY_HOLD, startDuration: 25, weeklyDurationGain: 0.8, sets: 3, restSec: 45 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Progressive overload with plateaus / small regressions.
//
// Every exercise gets its own smooth-but-imperfect progression curve:
//  - baseline linear growth from weeklyWeightGain/weeklyRepGain/weeklyDurationGain
//  - every ~5-7 weeks a short plateau (no gain) lasting 1-2 weeks
//  - roughly 1-in-10 sessions is a slightly "off" day (small regression)
//  - small day-to-day jitter so it doesn't look robotic
// ---------------------------------------------------------------------------

// Deterministic per-exercise plateau windows, chosen once up front.
const plateauWeeksByExercise = new Map();
function getPlateauWeeks(metaId) {
  if (!plateauWeeksByExercise.has(metaId)) {
    const weeks = new Set();
    let w = randInt(4, 6);
    while (w < WEEKS_OF_HISTORY) {
      const len = randInt(1, 2);
      for (let i = 0; i < len; i++) weeks.add(w + i);
      w += randInt(5, 8);
    }
    plateauWeeksByExercise.set(metaId, weeks);
  }
  return plateauWeeksByExercise.get(metaId);
}

function effectiveWeek(metaId, week) {
  // Returns a "progress week" that stalls during plateau weeks instead of
  // advancing, producing flat stretches in the trend line.
  const plateauWeeks = getPlateauWeeks(metaId);
  let effective = 0;
  for (let w = 0; w <= week; w++) {
    if (!plateauWeeks.has(w)) effective++;
  }
  return effective;
}

function isOffDay() {
  return rand() < 0.1; // ~10% of sessions are a slightly weaker day
}

function computeWeightAndReps(cfg, week) {
  const progWeek = effectiveWeek(cfg.ex.metaId, week);
  let weight = cfg.startWeight + progWeek * cfg.weeklyWeightGain;
  // round to nearest plate-friendly 2.5 lb
  weight = Math.round(weight / 2.5) * 2.5;
  let reps = cfg.startReps + Math.floor(progWeek / 3); // reps creep up slowly too
  reps = Math.min(reps, cfg.startReps + 4);

  if (isOffDay()) {
    weight = Math.max(cfg.startWeight, weight - randRange(2.5, 7.5));
    weight = Math.round(weight / 2.5) * 2.5;
    reps = Math.max(cfg.startReps - 1, reps - randInt(1, 2));
  }
  return { weight, reps };
}

function computeBodyweightReps(cfg, week) {
  const progWeek = effectiveWeek(cfg.ex.metaId, week);
  let reps = cfg.startReps + progWeek * cfg.weeklyRepGain;
  reps = Math.round(reps);
  if (isOffDay()) reps = Math.max(cfg.startReps - 1, reps - randInt(1, 2));
  return reps;
}

function computeDuration(cfg, week) {
  const progWeek = effectiveWeek(cfg.ex.metaId, week);
  let duration = cfg.startDuration + progWeek * cfg.weeklyDurationGain;
  duration = Math.round(duration);
  if (isOffDay()) duration = Math.max(cfg.startDuration, duration - randInt(2, 5));
  return duration;
}

// ---------------------------------------------------------------------------
// Set builder for a single exercise instance within a workout.
// ---------------------------------------------------------------------------

function buildSets(cfg, week, currentTimeMs) {
  const sets = [];
  let cursor = currentTimeMs;
  const restMs = cfg.restSec * 1000;

  for (let i = 0; i < cfg.sets; i++) {
    let difficulty;
    // Slight within-session fatigue: last set(s) drop a rep or two.
    const fatigueDrop = i === cfg.sets - 1 ? randInt(0, 1) : 0;

    if (cfg.ex.type === DifficultyType.WEIGHT) {
      const { weight, reps } = computeWeightAndReps(cfg, week);
      difficulty = { weight, reps: Math.max(1, reps - fatigueDrop) };
    } else if (cfg.ex.type === DifficultyType.BODYWEIGHT) {
      const reps = computeBodyweightReps(cfg, week);
      difficulty = { reps: Math.max(1, reps - fatigueDrop) };
    } else if (cfg.ex.type === DifficultyType.TIME) {
      const duration = computeDuration(cfg, week);
      difficulty = { duration: Math.max(10, duration - fatigueDrop * 3) };
    } else {
      throw new Error(`Unhandled difficulty type: ${cfg.ex.type}`);
    }

    const execMs = randInt(18, 45) * 1000; // time under tension / setup
    const startedAt = cursor;
    cursor += execMs;
    const restStartedAt = cursor;
    const restEndedAt = restStartedAt + restMs;
    cursor = restEndedAt;

    sets.push({
      id: generateSetId(),
      difficulty,
      status: SetStatus.FINISHED,
      startedAt,
      restStartedAt,
      restEndedAt,
      restDuration: cfg.restSec,
    });
  }

  return { sets, endTimeMs: cursor };
}

// ---------------------------------------------------------------------------
// Workout builder
// ---------------------------------------------------------------------------

function buildWorkout(splitKey, date, week, bodyweight) {
  const split = SPLIT[splitKey];
  // Sessions start sometime between 6:30am and 7:30pm.
  const startHour = randInt(6, 19);
  const startMinute = choice([0, 15, 30, 45]);
  const startedAtDate = new Date(date);
  startedAtDate.setHours(startHour, startMinute, 0, 0);
  const startedAt = startedAtDate.getTime();
  let cursor = startedAt;

  // Warm-up (mobility, ramp-up sets not logged) before the first working set.
  cursor += randInt(5, 9) * 60 * 1000;

  const exercises = split.exercises.map((cfg) => {
    // Transition/setup time walking to the next exercise / changing plates.
    cursor += randInt(90, 180) * 1000;
    const { sets, endTimeMs } = buildSets(cfg, week, cursor);
    cursor = endTimeMs;
    return {
      id: generateExerciseId(),
      metaId: cfg.ex.metaId,
      sets,
      restDuration: cfg.restSec,
    };
  });

  // Cool-down / stretching before ending the session.
  cursor += randInt(3, 7) * 60 * 1000;
  const endedAt = cursor;

  return {
    id: generateWorkoutId(),
    bodyweight,
    startedAt,
    endedAt,
    name: `${splitKey} Day`,
    exercises,
  };
}

// ---------------------------------------------------------------------------
// Routines (Push Day / Pull Day / Leg Day) using current (final week)
// prescriptions so they reflect the athlete's up-to-date working sets.
// ---------------------------------------------------------------------------

function buildRoutines() {
  return Object.entries(SPLIT).map(([splitKey, split]) => {
    const finalWeek = WEEKS_OF_HISTORY - 1;
    const plan = split.exercises.map((cfg) => {
      let setPlanDifficulty;
      if (cfg.ex.type === DifficultyType.WEIGHT) {
        const { weight, reps } = computeWeightAndReps(cfg, finalWeek);
        setPlanDifficulty = { weight, reps };
      } else if (cfg.ex.type === DifficultyType.BODYWEIGHT) {
        setPlanDifficulty = { reps: computeBodyweightReps(cfg, finalWeek) };
      } else if (cfg.ex.type === DifficultyType.TIME) {
        setPlanDifficulty = { duration: computeDuration(cfg, finalWeek) };
      }
      return {
        id: generateExercisePlanId(),
        metaId: cfg.ex.metaId,
        rest: cfg.restSec,
        sets: Array.from({ length: cfg.sets }, () => ({
          id: generateSetPlanId(),
          difficulty: { ...setPlanDifficulty },
        })),
      };
    });

    return {
      id: generateRoutineId(),
      name: split.routineName,
      plan,
    };
  });
}

// ---------------------------------------------------------------------------
// Schedule: ~4x/week Push/Pull/Legs rotation with rest days, ending in a
// believable streak leading up to "today".
// ---------------------------------------------------------------------------

function buildSchedule() {
  const days = [];
  const startDate = new Date(TODAY);
  startDate.setDate(startDate.getDate() - WEEKS_OF_HISTORY * 7);
  startDate.setHours(0, 0, 0, 0);

  const totalDays = WEEKS_OF_HISTORY * 7;
  const rotation = ["Push", "Pull", "Legs"];
  let rotationIdx = 0;

  for (let d = 0; d < totalDays; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    if (date > TODAY) break;

    const dayOfWeek = date.getDay(); // 0=Sun..6=Sat
    const daysFromToday = Math.round((TODAY - date) / (1000 * 60 * 60 * 24));

    // Weekly pattern targeting ~4 sessions/week: train Mon/Tue, rest Wed,
    // train Thu/Fri, rest weekend (occasionally train Sat instead).
    let trains;
    if (daysFromToday <= 6) {
      // Final week: force an active, uninterrupted streak so the app shows
      // a live streak on "today" - train every day except we still skip
      // exactly one earlier rest day pattern isn't needed here.
      trains = true;
    } else {
      switch (dayOfWeek) {
        case 1: // Mon
        case 2: // Tue
        case 4: // Thu
        case 5: // Fri
          trains = true;
          break;
        case 6: // Sat - about half the time, to add variance
          trains = rand() < 0.5;
          break;
        default: // Sun, Wed - rest days
          trains = false;
      }
    }

    if (trains) {
      const splitKey = rotation[rotationIdx % rotation.length];
      rotationIdx++;
      const week = Math.floor(d / 7);
      days.push({ date, week, splitKey });
    }
  }

  return days;
}

// ---------------------------------------------------------------------------
// Bodyweight drift over time (slow linear drift + small daily noise)
// ---------------------------------------------------------------------------

function bodyweightForDay(daysSinceStart, totalDays) {
  const progress = totalDays > 0 ? daysSinceStart / totalDays : 0;
  const drifted = STARTING_BODYWEIGHT_LBS + progress * ENDING_BODYWEIGHT_DRIFT_LBS;
  const noise = randRange(-0.6, 0.6);
  return Math.round((drifted + noise) * 10) / 10;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const schedule = buildSchedule();
  const startDate = new Date(TODAY);
  startDate.setDate(startDate.getDate() - WEEKS_OF_HISTORY * 7);
  const totalDays = WEEKS_OF_HISTORY * 7;

  const workouts = schedule.map(({ date, week, splitKey }) => {
    const daysSinceStart = Math.round((date - startDate) / (1000 * 60 * 60 * 24));
    const bodyweight = bodyweightForDay(daysSinceStart, totalDays);
    return buildWorkout(splitKey, date, week, bodyweight);
  });

  const routines = buildRoutines();
  const customExercises = [];

  const output = { workouts, routines, customExercises };

  const outPath = path.join(__dirname, "seed.json");
  const json = JSON.stringify(output, null, 2);

  // If stdout is being redirected (piped to a file / not a TTY captured
  // interactively) still also write seed.json for convenience, per the
  // "runnable as `node generate.js > seed.json` or writing seed.json next
  // to itself" requirement. We always write the file, and only echo to
  // stdout when explicitly not silenced (kept simple: always write file,
  // and print a summary to stderr; JSON itself goes to stdout too).
  fs.writeFileSync(outPath, json);

  // ---- Verification / sanity summary (stderr, so stdout stays pure JSON)
  const allMetaIds = new Set();
  Object.values(SPLIT).forEach((s) =>
    s.exercises.forEach((cfg) => allMetaIds.add(cfg.ex.metaId))
  );

  let exerciseMetaIndex;
  try {
    exerciseMetaIndex = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          "../../mobile/assets/exercises/exerciseMetas.json"
        ),
        "utf8"
      )
    );
  } catch (e) {
    exerciseMetaIndex = null;
  }

  const known = exerciseMetaIndex
    ? new Set(exerciseMetaIndex.map((e) => e.metaId))
    : null;
  const missing = known
    ? [...allMetaIds].filter((id) => !known.has(id))
    : [];

  const dates = workouts.map((w) => w.startedAt).sort((a, b) => a - b);
  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);

  const totalSets = workouts.reduce(
    (acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets.length, 0),
    0
  );

  console.error("=== Seed data summary ===");
  console.error(`Workouts:          ${workouts.length}`);
  console.error(`Routines:          ${routines.length}`);
  console.error(`Custom exercises:  ${customExercises.length}`);
  console.error(`Total sets:        ${totalSets}`);
  console.error(`Date range:        ${first.toDateString()} -> ${last.toDateString()}`);
  console.error(`Distinct metaIds used: ${[...allMetaIds].sort((a,b)=>+a-+b).join(", ")}`);
  console.error(
    missing.length === 0
      ? "All metaIds verified present in mobile/assets/exercises/exerciseMetas.json"
      : `WARNING - metaIds NOT found in exerciseMetas.json: ${missing.join(", ")}`
  );
  console.error(`Output written to: ${outPath}`);

  process.stdout.write(json);
}

main();
