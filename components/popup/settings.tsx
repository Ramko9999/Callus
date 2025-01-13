import { StyleSheet, TouchableOpacity } from "react-native";
import { SETTING_HEIGHT, StyleUtils } from "@/util/styles";
import { View, Text, useThemeColoring } from "@/components/Themed";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { WorkoutApi } from "@/api/workout";
import { Workout } from "@/interface";
import { useToast } from "react-native-toast-notifications";
import { useTabBar } from "@/components/util/tab-bar/context";
import { useEffect } from "react";
import { FullBottomSheet } from "@/components/util/popup/sheet/full";

const settingStyles = StyleSheet.create({
  container: {
    paddingLeft: "3%",
    paddingVertical: "3%",
    height: SETTING_HEIGHT,
  },
});

type SettingProps = {
  name: string;
  description: string;
  onClick: () => void;
};

function Setting({ name, description, onClick }: SettingProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={settingStyles.container}>
        <Text large>{name}</Text>
        <Text neutral light>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

async function exportAppData() {
  const exportFileUri = `${
    FileSystem.cacheDirectory
  }/export-${Date.now()}.json`;
  const workouts = await WorkoutApi.getExportableWorkouts();
  await FileSystem.writeAsStringAsync(exportFileUri, JSON.stringify(workouts));
  await Sharing.shareAsync(exportFileUri);
}

function ExportSetting() {
  return (
    <Setting
      name="Export"
      description="Export your workouts and routines as JSON"
      onClick={exportAppData}
    />
  );
}

type ImportOptions = {
  onDone: (workouts: Workout[]) => void;
  onError: (e: Error) => void;
};

async function importAppData({ onDone, onError }: ImportOptions) {
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
      onDone(importedWorkouts);
    } catch (error) {
      onError(error as Error);
    }
  }
}

// enhancement: show modal to show progress of import
function ImportSetting() {
  const toast = useToast();
  const successColor = useThemeColoring("primaryAction");

  const onDone = (workouts: Workout[]) => {
    toast.show(`Imported ${workouts.length} workouts!`, {
      successColor,
      type: "success",
    });
  };

  const onError = (error: Error) => {
    toast.show(`Failed to import workouts: ${error}`, { type: "danger" });
  };

  return (
    <Setting
      name="Import"
      description="Import your workouts and routines from a JSON file"
      onClick={() => importAppData({ onDone, onError })}
    />
  );
}

const settingsStyle = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingTop: "6%",
  },
  head: {
    ...StyleUtils.flexColumn(),
    paddingLeft: "3%",
  },
});

function Settings() {
  return (
    <View background style={settingsStyle.container}>
      <View background style={settingsStyle.head}>
        <Text extraLarge>Settings</Text>
        <Text neutral light>
          Configure how the app tracks your workouts
        </Text>
      </View>
      <ImportSetting />
      <ExportSetting />
    </View>
  );
}

type SettingsSheetProps = {
  show: boolean;
  hide: () => void;
};

export function SettingsSheet({ show, hide }: SettingsSheetProps) {
  const tabBarActions = useTabBar();

  useEffect(() => {
    if (show) {
      tabBarActions.close();
    } else {
      tabBarActions.open();
    }
  }, [show]);

  return (
    <FullBottomSheet show={show} onHide={hide}>
      <Settings />
    </FullBottomSheet>
  );
}
