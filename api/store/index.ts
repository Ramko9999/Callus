import * as FileSystem from "expo-file-system";
import { STORAGE_NAMESPACE } from "@/constants";

const APP_DATA_DIRECTORY = `${FileSystem.documentDirectory}${STORAGE_NAMESPACE}`;

export async function initializeAppDataDirectory() {
  const { exists } = await FileSystem.getInfoAsync(APP_DATA_DIRECTORY);
  if (!exists) {
    await FileSystem.makeDirectoryAsync(APP_DATA_DIRECTORY);
  }
  return APP_DATA_DIRECTORY;
}
