import { ImageRequireSource } from "react-native";
import { Store } from "./store";
import { nativeApplicationVersion } from "expo-application";

export type Change = {
  feature: string;
  description: string;
  image: ImageRequireSource;
};

export type WhatsNew = {
  version: string;
  changes: Change[];
};

const APP_VERSION_KEY = "app_version";

async function hasSeenWhatsNew(): Promise<boolean> {
  const whatsNew =
    (await Store.instance().readMetadata(APP_VERSION_KEY)) ?? "0.0.0";
  return whatsNew >= (nativeApplicationVersion as string);
}

async function markWhatsNewAsSeen() {
  await Store.instance().upsertMetadata(
    APP_VERSION_KEY,
    nativeApplicationVersion as string
  );
}

function getWhatsNew(): WhatsNew {
  return MOST_RECENT_CHANGES;
}

const MOST_RECENT_CHANGES: WhatsNew = {
  version: nativeApplicationVersion as string,
  changes: [
    {
      feature: "Revampled Completed Workout",
      description: "Muscle heatmaps and a crisper completed workout UI.",
      image: require("../assets/whats-new/completed-workout.png"),
    },
    {
      feature: "Revamped Exercise Insight",
      description: "A 10x better exercise insight experience.",
      image: require("../assets/whats-new/exercise-insights.png"),
    },
    {
      feature: "8 New Exercises",
      description:
        "From Hack Squat to Machine Leg Press to Incline Bench Press and more.",
      image: require("../assets/whats-new/new-added-exercises.png"),
    },
  ],
};

export const WhatsNewApi = {
  hasSeenWhatsNew,
  markWhatsNewAsSeen,
  getWhatsNew,
};
