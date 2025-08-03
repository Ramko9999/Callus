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
      feature: "Edit Custom Exercises",
      description:
        "You can now edit your custom exercises to change the name, description, targeted muscles and image.",
      image: require("../assets/whats-new/edit-custom-exercise.png"),
    },
  ],
};

export const WhatsNewApi = {
  hasSeenWhatsNew,
  markWhatsNewAsSeen,
  getWhatsNew,
};
