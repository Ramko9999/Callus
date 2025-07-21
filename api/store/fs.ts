import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

export async function saveCustomExerciseImage(
  sourceUri: string,
  customExerciseId: string
): Promise<string> {
  try {
    // Create the target directory path
    const targetDir = `${FileSystem.documentDirectory}custom_exercises`;
    const targetUri = `${targetDir}/${customExerciseId}.jpg`;

    // Ensure the directory exists
    const dirInfo = await FileSystem.getInfoAsync(targetDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
    }

    const result = await ImageManipulator.manipulateAsync(sourceUri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
      compress: 0.8,
    });

    await FileSystem.copyAsync({
      from: result.uri,
      to: targetUri,
    });

    return targetUri;
  } catch (error) {
    console.error("Error saving custom exercise image:", error);
    throw error;
  }
}

export function getCustomExerciseUri(customExerciseId: string): string {
  return `${FileSystem.documentDirectory}custom_exercises/${customExerciseId}.jpg`;
}
