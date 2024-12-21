import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { BottomSheet } from "../util/sheets";
import {
  SETTING_HEIGHT,
  StyleUtils,
  SETTINGS_HEIGHT,
} from "@/util/styles";
import { View, Text, useThemeColoring } from "../Themed";
import { Close } from "../theme/actions";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { WorkoutApi } from "@/api/workout";
import { Workout } from "@/interface";
import { useToast } from "react-native-toast-notifications";

const settingsActionsStyle = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "flex-start",
  },
});

type SettingsActionsProps = {
  hide: () => void;
};

function SettingsActions({ hide }: SettingsActionsProps) {
  return (
    <View style={settingsActionsStyle.container}>
      <Close onClick={hide} />
    </View>
  );
}

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
    paddingTop: "3%",
  },
  content: {
    ...StyleUtils.flexColumn(),
    paddingLeft: "3%",
  },
});

type SettingsProps = {
  hide: () => void;
};

function Settings({ hide }: SettingsProps) {
  const { height } = useWindowDimensions();
  return (
    <View
      background
      style={[
        settingsStyle.container,
        { height: height * SETTINGS_HEIGHT },
      ]}
    >
      <SettingsActions hide={hide} />
      <View style={settingsStyle.content}>
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

type SettingsPopupProps = {
  show: boolean;
  hide: () => void;
};

export function SettingsPopup({ show, hide }: SettingsPopupProps) {
  return (
    <BottomSheet show={show} onBackdropPress={hide} hide={hide}>
      <Settings hide={hide} />
    </BottomSheet>
  );
}
