import { StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SETTING_HEIGHT, StyleUtils } from "@/util/styles";
import { View, Text, useThemeColoring } from "@/components/Themed";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { WorkoutApi } from "@/api/workout";
import { Routine, Workout } from "@/interface";
import { useToast } from "react-native-toast-notifications";
import { HeaderPage } from "@/components/util/header-page";
import { tintColor } from "@/util/color";
import { GoBackAction, SectionHeader, SettingsRow } from "./common";
import {
  ChevronRight,
  Download,
  Palette,
  Upload,
  User,
} from "lucide-react-native";
import React from "react";
import { AccountSettings } from "./account";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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

const rootSettingsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingHorizontal: "5%",
    paddingTop: "3%",
  },
});


function RootSettings({ navigation }: any) {
  const appBgColor = useThemeColoring("appBackground");
  const accent = tintColor(appBgColor, 0.3);
  // Handlers (replace with real navigation/actions)
  const goToEditProfile = () => {};
  const goToAccountSettings = () => {};
  const goToPayment = () => {};
  const goToNotifications = () => {};
  const goToAppearance = () => {};
  const goToContactSupport = () => {};
  const goToRateApp = () => {};
  const goToFollow = () => {};
  const goToSignOut = () => {};

  return (
    <HeaderPage
      title="Settings"
      leftAction={<GoBackAction onClick={navigation.goBack} />}
    >
      <ScrollView contentContainerStyle={rootSettingsStyles.container}>
        <SettingsRow
          icon={<User color={accent} size={22} />}
          label="Account"
          onPress={() => navigation.navigate("account")}
          rightIcon={<ChevronRight color={accent} size={20} />}
        />
        <SectionHeader title="Preferences" />
        <SettingsRow
          icon={<Palette color={accent} size={22} />}
          label="Appearance"
          onPress={goToAppearance}
          rightIcon={<ChevronRight color={accent} size={20} />}
        />
        <SectionHeader title="Data" />
        <SettingsRow
          icon={<Upload color={accent} size={22} />}
          label="Import"
          onPress={goToContactSupport}
        />
        <SettingsRow
          icon={<Download color={accent} size={22} />}
          label="Export"
          onPress={goToRateApp}
        />
      </ScrollView>
    </HeaderPage>
  );
}

const Stack = createNativeStackNavigator();

export function Settings() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="root"
    >
      <Stack.Screen name="root" component={RootSettings} />
      <Stack.Screen name="account" component={AccountSettings} />
    </Stack.Navigator>
  );
}
