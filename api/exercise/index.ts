import STATIC_EXERCISE_REPOSITORY from "@/assets/exercises/exerciseMetas.json";
import { DifficultyType, ExerciseMeta } from "@/interface";
import { ArrayUtils } from "@/util/misc";
import { ImageRequireSource } from "react-native";

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
  new Set(
    STATIC_EXERCISE_REPOSITORY.map(({ primaryMuscles }) => primaryMuscles[0])
  )
).slice(0, 7);

export const DISPLAY_EXERCISE_TYPES = ["Bodyweight", "Weight", "Time"];

export const DISPLAY_EXERCISE_TYPE_TO_TYPE: {
  [index: string]: DifficultyType[];
} = {
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

export function getExerciseDemonstration(
  name: string
): ImageRequireSource | undefined {
  const meta = getMeta(name);
  return EXERCISE_DEMONSTRATIONS[meta.metaId];
}

export function isMuscleUpperBody(muscle: string) {
  return (
    [
      "Abs",
      "Chest",
      "Lats",
      "Lower Back",
      "Neck Extensors",
      "Neck Flexors",
      "Obliques",
      "Traps",
    ].indexOf(muscle) > -1
  );
}

export function isMusclePartOfArms(muscle: string) {
  return (
    [
      "Biceps",
      "Forearm Flexors",
      "Front Delts",
      "Rear Delts",
      "Side Delts",
      "Triceps",
    ].indexOf(muscle) > -1
  );
}

export function isMuscleLowerBody(muscle: string) {
  return (
    [
      "Calves",
      "Glutes",
      "Hamstrings",
      "Hip Flexors",
      "Quads",
      "Tibialis Anterior",
    ].indexOf(muscle) > -1
  );
}

export function queryExercises(
  query: string,
  exerciseMetas: ExerciseMeta[],
  muscleFilters: string[],
  exerciseTypeFilters: string[]
): ExerciseMeta[] {
  const relevantMetas = exerciseMetas.filter(
    ({ name, primaryMuscles, secondaryMuscles, difficultyType }) => {
      if (!name.toUpperCase().includes(query.trim().toUpperCase())) {
        return false;
      }

      // Check if all muscle filters are present in either primary or secondary muscles
      const allMuscles = [...primaryMuscles, ...secondaryMuscles];
      const hasAllMuscleFilters = muscleFilters.every((filter) =>
        allMuscles.includes(filter)
      );
      if (muscleFilters.length > 0 && !hasAllMuscleFilters) {
        return false;
      }

      // Check if exercise type matches any of the filters
      if (
        exerciseTypeFilters.length > 0 &&
        !exerciseTypeFilters.includes(difficultyType)
      ) {
        return false;
      }

      return true;
    }
  );

  return ArrayUtils.sortBy(relevantMetas, (meta) => meta.name);
}

const EXERCISE_DEMONSTRATIONS: Record<string, ImageRequireSource> = {
  "22": require("../../assets/exercises/images/bench-press.png"),
  "40": require("../../assets/exercises/images/chin-up.png"),
  "49": require("../../assets/exercises/images/conventional-deadlift.png"),
  "10": require("../../assets/exercises/images/dip.png"),
  "47": require("../../assets/exercises/images/crunch.png"),
  "80": require("../../assets/exercises/images/hammer-curl.png"),
  "182": require("../../assets/exercises/images/hollow-body-hold.png"),
  "183": require("../../assets/exercises/images/landmine-180.png"),
  "184": require("../../assets/exercises/images/neck-flexion.png"),
  "185": require("../../assets/exercises/images/neck-extension.png"),
  "186": require("../../assets/exercises/images/neck-side-flexion.png"),
  "181": require("../../assets/exercises/images/pistol-squat.png"),
  "173": require("../../assets/exercises/images/pike-pushup.png"),
  "137": require("../../assets/exercises/images/pull-up.png"),
  "139": require("../../assets/exercises/images/push-press.png"),
  "140": require("../../assets/exercises/images/push-up.png"),
  "191": require("../../assets/exercises/images/seated-cable-row.png"),
  "192": require("../../assets/exercises/images/leg-extension.png"),
  "148": require("../../assets/exercises/images/romanian-deadlift.png"),
  "147": require("../../assets/exercises/images/ring-inverted-row.png"),
  "179": require("../../assets/exercises/images/ring-arc-row.png"),
  "180": require("../../assets/exercises/images/ring-face-pull.png"),
  "187": require("../../assets/exercises/images/ring-dip.png"),
  "175": require("../../assets/exercises/images/ring-push-up.png"),
  "188": require("../../assets/exercises/images/ring-curl.png"),
  "146": require("../../assets/exercises/images/ring-pull-up.png"),
  "176": require("../../assets/exercises/images/ring-tricep-extensions.png"),
  "194": require("../../assets/exercises/images/seated-leg-curl.png"),
  "145": require("../../assets/exercises/images/machine-rear-delt-fly.png"),
  "113": require("../../assets/exercises/images/machine-chest-press.png"),
  "112": require("../../assets/exercises/images/machine-chest-fly.png"),
  "189": require("../../assets/exercises/images/l-sit.png"),
  "195": require("../../assets/exercises/images/l-sit-pull-up.png"),
  "97": require("../../assets/exercises/images/inverted-row.png"),
  "85": require("../../assets/exercises/images/hanging-knee-raises.png"),
  "196": require("../../assets/exercises/images/handstand-push-up.png"),
  "197": require("../../assets/exercises/images/handstand-hold.png"),
  "198": require("../../assets/exercises/images/front-leg-elevated-split-squat.png"),
  "67": require("../../assets/exercises/images/dumbell-overhead-press.png"),
  "61": require("../../assets/exercises/images/dumbell-lateral-raise.png"),
  "34": require("../../assets/exercises/images/cable-curl.png"),
  "199": require("../../assets/exercises/images/bulgarian-split-squat.png"),
  "163": require("../../assets/exercises/images/barbell-squat.png"),
  "17": require("../../assets/exercises/images/barbell-shrug.png"),
  "16": require("../../assets/exercises/images/barbell-row.png"),
  "91": require("../../assets/exercises/images/barbell-hip-thrust.png"),
  "11": require("../../assets/exercises/images/barbell-curl.png"),
  "200": require("../../assets/exercises/images/tibalis-curls.png"),
  "193": require("../../assets/exercises/images/nordic-hamstring-curl.png"),
  "172": require("../../assets/exercises/images/zercher-squat.png"),
  "177": require("../../assets/exercises/images/weighted-pull-up.png"),
  "174": require("../../assets/exercises/images/weighted-dip.png"),
  "201": require("../../assets/exercises/images/weighted-ring-dip.png"),
  "127": require("../../assets/exercises/images/military-press.png"),
  "204": require("../../assets/exercises/images/hollow-body-pull-up.png"),
  "202": require("../../assets/exercises/images/vertical-knee-raises.png"),
  "203": require("../../assets/exercises/images/vertical-leg-raises.png"),
  "55": require("../../assets/exercises/images/dumbell-bicep-curl.png"),
  "14": require("../../assets/exercises/images/barbell-preacher-curl.png"),
  "190": require("../../assets/exercises/images/cable-tricep-extension.png"),
  "105": require("../../assets/exercises/images/lat-pulldown.png"),
  "111": require("../../assets/exercises/images/machine-bicep-curl.png"),
  "116": require("../../assets/exercises/images/machine-shoulder-press.png"),
  "205": require("../../assets/exercises/images/cable-fly.png"),
  "206": require("../../assets/exercises/images/cable-high-to-low-fly.png"),
  "207": require("../../assets/exercises/images/cable-low-to-high-fly.png"),
  "208": require("../../assets/exercises/images/dumbell-bench-press.png"),
  "209": require("../../assets/exercises/images/machine-shrug.png"),
};
