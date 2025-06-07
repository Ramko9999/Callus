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
      feature: "Revamped Account Settings",
      description:
        "You can now edit your name, weight, and height in the account settings. Go to Profile > Settings > Account",
      image: require("../assets/whats-new/settings.png"),
    },
    {
      feature: "New Exercise Display",
      description:
        "You can now view exercises with their demonstration images.",
      image: require("../assets/whats-new/exercises-grid.png"),
    },
    {
      feature: "5 New Exercises",
      description: "Cable Fly, Cable High-Low Fly, Cable Low-High Fly, Dumbell Bench Press, and Machine Shrug have been added to the exercise collection.",
      image: require("../assets/whats-new/new-added-exercises.png")
    }
  ],
};

export const WhatsNewApi = {
  hasSeenWhatsNew,
  markWhatsNewAsSeen,
  getWhatsNew,
};
