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
      feature: "Live Workout Player",
      description: "Tracking sets doesn't have to be boring. See your progress click into place delightfully!",
      image: require("../assets/whats-new/live-workout.png"),
    },
    {
      feature: "Custom Exercise",
      description: "Create your own exercises and use them in your workouts!",
      image: require("../assets/whats-new/create-custom-exercise.png"),
    },
  ],
};

export const WhatsNewApi = {
  hasSeenWhatsNew,
  markWhatsNewAsSeen,
  getWhatsNew,
};
