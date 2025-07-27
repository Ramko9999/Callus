import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

export async function saveCustomExerciseImage(
  sourceUri: string,
  imageId: string
): Promise<string> {
  try {
    // Create the target directory path
    const targetDir = `${FileSystem.documentDirectory}custom_exercises`;
    const targetUri = `${targetDir}/${imageId}.jpg`;

    // Ensure the directory exists
    const dirInfo = await FileSystem.getInfoAsync(targetDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
    }

    const result = await ImageManipulator.manipulateAsync(sourceUri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
      compress: 0.6,
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

export function getCustomExerciseUri(imageId: string): string {
  return `${FileSystem.documentDirectory}custom_exercises/${imageId}.jpg`;
}

export async function deleteCustomExerciseImages(
  exerciseId: string,
  exceptImageId?: string
): Promise<void> {
  try {
    const customExercisesDir = `${FileSystem.documentDirectory}custom_exercises`;

    const dirInfo = await FileSystem.getInfoAsync(customExercisesDir);
    if (!dirInfo.exists) {
      return;
    }

    const files = await FileSystem.readDirectoryAsync(customExercisesDir);

    const filesToDelete = files.filter((file) => {
      if (exceptImageId) {
        return file.startsWith(exerciseId) && !file.startsWith(exceptImageId);
      } else {
        return file.startsWith(exerciseId);
      }
    });

    const deletePromises = filesToDelete.map((file) =>
      FileSystem.deleteAsync(`${customExercisesDir}/${file}`)
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting custom exercise images:", error);
    throw error;
  }
}
