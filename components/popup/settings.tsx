import { StyleSheet, TouchableOpacity } from "react-native";
import { SETTING_HEIGHT, StyleUtils } from "@/util/styles";
import { View, Text, useThemeColoring } from "@/components/Themed";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { WorkoutApi } from "@/api/workout";
import { Routine, Workout } from "@/interface";
import { useToast } from "react-native-toast-notifications";
import { useTabBar } from "@/components/util/tab-bar/context";
import { useEffect } from "react";
import { FullBottomSheet } from "@/components/util/popup/sheet/full";
import { useLiveIndicator } from "./workout/live";

type ImportExport = {
  workouts: Workout[];
  routines: Routine[];
};

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
  const routines = await WorkoutApi.getExportableRoutines();
  const appExport: ImportExport = { workouts, routines };
  await FileSystem.writeAsStringAsync(exportFileUri, JSON.stringify(appExport));
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
  onDone: (appImport: ImportExport) => void;
  onError: (e: Error) => void;
};

async function importAppData({ onDone, onError }: ImportOptions) {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    multiple: false,
  });
  if (!result.canceled && result.assets != null && result.assets.length > 0) {
    const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const { workouts, routines } = JSON.parse(content) as ImportExport;
    try {
      await WorkoutApi.importWorkouts(workouts);
      await WorkoutApi.importRoutines(routines);
      onDone({ workouts, routines });
    } catch (error) {
      onError(error as Error);
    }
  }
}

// enhancement: show modal to show progress of import
function ImportSetting() {
  const toast = useToast();
  const successColor = useThemeColoring("primaryAction");

  const onDone = ({ workouts, routines }: ImportExport) => {
    toast.show(
      `Imported ${workouts.length} workouts and ${routines.length} routines!`,
      {
        successColor,
        type: "success",
      }
    );
  };

  const onError = (error: Error) => {
    toast.show(`Failed to import: ${error}`, { type: "danger" });
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
  const liveIndicatorActions = useLiveIndicator();

  useEffect(() => {
    if (show) {
      tabBarActions.close();
      liveIndicatorActions.hide();
    } else {
      tabBarActions.open();
      liveIndicatorActions.show();
    }
  }, [show]);

  return (
    <FullBottomSheet show={show} onHide={hide}>
      <Settings />
    </FullBottomSheet>
  );
}
