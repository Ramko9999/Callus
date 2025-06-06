import { StyleSheet, ScrollView, View, Linking } from "react-native";
import { StyleUtils } from "@/util/styles";
import { useThemeColoring, Text } from "@/components/Themed";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import * as Application from "expo-application";
import { WorkoutApi } from "@/api/workout";
import { HeaderPage } from "@/components/util/header-page";
import { tintColor } from "@/util/color";
import { GoBackAction, SectionHeader, SettingsRow } from "./common";
import {
  ArrowUpRight,
  ChevronRight,
  Download,
  Upload,
  User,
} from "lucide-react-native";
import React, { useState, useRef } from "react";
import { AccountSettings } from "./account";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ImportProgressSheet } from "@/components/sheets/import-progress";
import BottomSheet from "@gorhom/bottom-sheet";
import { TwitterX } from "@/components/theme/icons";

async function exportAppData() {
  const exportFileUri = `${
    FileSystem.cacheDirectory
  }/callus-${Date.now()}.json`;
  const workouts = await WorkoutApi.getExportableWorkouts();
  const routines = await WorkoutApi.getExportableRoutines();
  const appExport = { workouts, routines };
  await FileSystem.writeAsStringAsync(exportFileUri, JSON.stringify(appExport));
  await Sharing.shareAsync(exportFileUri);
}

const rootSettingsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingHorizontal: "5%",
    paddingTop: "3%",
  },
  versionContainer: {
    ...StyleUtils.flexColumn(),
    alignItems: "center",
    marginTop: "10%",
    marginBottom: "5%",
  },
  versionText: {
    opacity: 0.6,
  },
});

function RootSettings({ navigation }: any) {
  const [importFileUri, setImportFileUri] = useState<string>();
  const importSheetRef = useRef<BottomSheet>(null);
  const appBgColor = useThemeColoring("appBackground");
  const accent = tintColor(appBgColor, 0.3);

  const handleImportPress = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      multiple: false,
    });

    if (!result.canceled && result.assets != null && result.assets.length > 0) {
      setImportFileUri(result.assets[0].uri);
    }
  };

  const handleImportSheetClose = () => {
    importSheetRef.current?.close();
  };

  const handleSheetHide = () => {
    setImportFileUri(undefined);
  };

  return (
    <>
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
          <SectionHeader title="Data" />
          <SettingsRow
            icon={<Upload color={accent} size={22} />}
            label="Import"
            onPress={handleImportPress}
          />
          <SettingsRow
            icon={<Download color={accent} size={22} />}
            label="Export"
            onPress={exportAppData}
          />
          <SectionHeader title="Resources" />
          <SettingsRow
            icon={
              <View style={{ marginLeft: 4 }}>
                <TwitterX color={accent} size={20} />
              </View>
            }
            label="Follow"
            onPress={() => Linking.openURL("https://x.com/ramkoo9999")}
            rightIcon={<ArrowUpRight color={accent} size={20} />}
          />
          <View style={rootSettingsStyles.versionContainer}>
            <Text large light style={rootSettingsStyles.versionText}>
              {Application.applicationName}
            </Text>
            <Text sneutral light style={rootSettingsStyles.versionText}>
              Version {Application.nativeApplicationVersion}
            </Text>
          </View>
        </ScrollView>
      </HeaderPage>
      <ImportProgressSheet
        ref={importSheetRef}
        show={importFileUri != undefined}
        hide={handleImportSheetClose}
        onHide={handleSheetHide}
        fileUri={importFileUri ?? ""}
      />
    </>
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
