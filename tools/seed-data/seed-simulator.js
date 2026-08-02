#!/usr/bin/env node
/**
 * Seeds a booted iOS simulator's Callus database directly, for App Store
 * screenshots.
 *
 * The app's Import feature cannot be used for this: import-progress.tsx
 * discards the routines array, and driving a file picker from a script is
 * fragile. Writing SQLite directly is deterministic and also lets us set the
 * user_details metadata so onboarding is skipped.
 *
 * Usage:
 *   node seed-simulator.js <SIMULATOR_UDID> [path/to/seed.json]
 *
 * Schema (mobile/api/store/sql.ts):
 *   workouts(id, name, started_at, ended_at, routine_id, bodyweight)
 *   exercises(id, meta_id, workout_id, sets, exercise_order, rest_duration, note)
 *   routines(id, name, plan)
 *   metadata(key, value)
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const DB_NAME = "store-v9.db"; // mobile/api/store/index.ts DB_VERSION
const BUNDLE_ID = "com.ramko9999.callus";

const USER_DETAILS = {
  name: "Rama",
  bodyweight: 175,
  height: 71,
  dob: new Date("2000-06-01T00:00:00Z").getTime(),
  notificationsEnabled: true,
};

function sqlStr(value) {
  if (value === null || value === undefined) return "NULL";
  return "'" + String(value).replace(/'/g, "''") + "'";
}

function findDbPath(udid) {
  const root = path.join(
    process.env.HOME,
    "Library/Developer/CoreSimulator/Devices",
    udid,
    "data/Containers/Data/Application"
  );
  if (!fs.existsSync(root)) {
    throw new Error(`No app containers for simulator ${udid}. Is it booted?`);
  }
  for (const appDir of fs.readdirSync(root)) {
    const candidate = path.join(root, appDir, "Documents/SQLite", DB_NAME);
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `Could not find ${DB_NAME} under ${root}.\n` +
      `Launch Callus (${BUNDLE_ID}) at least once so it creates its database.`
  );
}

/**
 * Slide every timestamp forward so the most recent workout finished a few
 * hours ago. Without this, the generated history can end on a rest day and the
 * app's History tab opens on an empty current month — useless for screenshots.
 */
function shiftToPresent(seed) {
  const latestEnd = Math.max(
    ...seed.workouts.map((w) => w.endedAt || w.startedAt)
  );
  const target = Date.now() - 3 * 60 * 60 * 1000; // 3h ago
  const delta = target - latestEnd;
  if (delta === 0) return seed;

  for (const w of seed.workouts) {
    w.startedAt += delta;
    if (w.endedAt != null) w.endedAt += delta;
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        for (const key of ["startedAt", "restStartedAt", "restEndedAt"]) {
          if (s[key] != null) s[key] += delta;
        }
      }
    }
  }
  return seed;
}

function buildSql(seed) {
  const lines = ["BEGIN TRANSACTION;"];

  // Wipe prior data so re-running is idempotent.
  lines.push("DELETE FROM exercises;");
  lines.push("DELETE FROM workouts;");
  lines.push("DELETE FROM routines;");

  for (const w of seed.workouts) {
    lines.push(
      `INSERT OR REPLACE INTO workouts(id, name, started_at, ended_at, routine_id, bodyweight) VALUES (${sqlStr(
        w.id
      )}, ${sqlStr(w.name)}, ${w.startedAt}, ${
        w.endedAt == null ? "NULL" : w.endedAt
      }, ${w.routineId ? sqlStr(w.routineId) : "NULL"}, ${w.bodyweight});`
    );
    w.exercises.forEach((ex, order) => {
      lines.push(
        `INSERT OR REPLACE INTO exercises(id, meta_id, workout_id, sets, exercise_order, rest_duration, note) VALUES (${sqlStr(
          ex.id
        )}, ${sqlStr(ex.metaId)}, ${sqlStr(w.id)}, ${sqlStr(
          JSON.stringify(ex.sets)
        )}, ${order}, ${ex.restDuration}, ${ex.note ? sqlStr(ex.note) : "NULL"});`
      );
    });
  }

  for (const r of seed.routines || []) {
    lines.push(
      `INSERT OR REPLACE INTO routines(id, name, plan) VALUES (${sqlStr(
        r.id
      )}, ${sqlStr(r.name)}, ${sqlStr(JSON.stringify(r.plan))});`
    );
  }

  // Skip onboarding and populate the profile screen.
  lines.push(
    `INSERT OR REPLACE INTO metadata(key, value) VALUES ('user_details', ${sqlStr(
      JSON.stringify(USER_DETAILS)
    )});`
  );
  // Stop the app re-seeding its stock routines over ours.
  lines.push(
    `INSERT OR REPLACE INTO metadata(key, value) VALUES ('has_loaded_initial_routines', 'true');`
  );

  lines.push("COMMIT;");
  return lines.join("\n");
}

function main() {
  const [udid, seedPathArg] = process.argv.slice(2);
  if (!udid) {
    console.error("Usage: node seed-simulator.js <SIMULATOR_UDID> [seed.json]");
    process.exit(1);
  }
  const seedPath = seedPathArg || path.join(__dirname, "seed.json");
  const seed = shiftToPresent(JSON.parse(fs.readFileSync(seedPath, "utf8")));

  const dbPath = findDbPath(udid);
  const sql = buildSql(seed);
  const sqlPath = path.join(__dirname, ".seed.sql");
  fs.writeFileSync(sqlPath, sql);

  execFileSync("sqlite3", [dbPath, `.read ${sqlPath}`], { stdio: "inherit" });
  fs.unlinkSync(sqlPath);

  const count = (table) =>
    execFileSync("sqlite3", [dbPath, `SELECT COUNT(*) FROM ${table};`])
      .toString()
      .trim();

  console.log(`Seeded ${dbPath}`);
  console.log(
    `  workouts=${count("workouts")} exercises=${count(
      "exercises"
    )} routines=${count("routines")} metadata=${count("metadata")}`
  );
}

main();
