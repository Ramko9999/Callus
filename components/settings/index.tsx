import { Action, View } from "../Themed";
import { StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { WorkoutApi } from "@/api/workout";
import { Workout } from "@/interface";
import { useToast } from "react-native-toast-notifications";
import { DynamicHeaderPage } from "../util/dynamic-header-page";
import { StyleUtils } from "@/util/styles";

const settingsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
    alignItems: "center",
    justifyContent: "center",
  },
});

export function Settings() {
  const toast = useToast();

  const exportWorkouts = async () => {
    const exportFileUri = `${
      FileSystem.cacheDirectory
    }/export-${Date.now()}.json`;

    const workouts = await WorkoutApi.getExportableWorkouts();
    await FileSystem.writeAsStringAsync(
      exportFileUri,
      JSON.stringify(workouts)
    );
    await Sharing.shareAsync(exportFileUri);
  };

  const importWorkouts = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
    });
    if (!result.canceled && result.assets != null && result.assets.length > 0) {
      const importWorkoutPromises = result.assets.map(async (asset) => {
        const content = await FileSystem.readAsStringAsync(asset.uri);
        return JSON.parse(content) as Workout[];
      });
      try {
        const importedWorkouts = (
          await Promise.all(importWorkoutPromises)
        ).flatMap((workouts) => workouts);
        await WorkoutApi.importWorkouts(importedWorkouts);
        toast.show(`Imported ${importedWorkouts.length} workouts!`, {
          type: "success",
        });
      } catch (error) {
        // display a notice suggesting we failed to import workouts
        // todo: figure out a framework how to alert users
        toast.show(`Failed to import workouts: ${error}`, { type: "danger" });
      }
    }
  };

  return (
    <DynamicHeaderPage title={"Settings"}>
      <View style={settingsStyles.container}>
        <Action
          _action={{ type: "neutral", name: "Export" }}
          onPress={exportWorkouts}
        />
        <Action
          _action={{ type: "neutral", name: "Import" }}
          onPress={importWorkouts}
        />
      </View>
    </DynamicHeaderPage>
  );
}
