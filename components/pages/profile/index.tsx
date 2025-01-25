import { useThemeColoring } from "@/components/Themed";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { StyleUtils } from "@/util/styles";
import { WorkoutStreakGrid } from "./streak-grid";
import { LifetimeStats } from "./lifetime-stats";
import { SettingsSheet } from "../../popup/settings";
import React, { useState } from "react";
import { Trends } from "./trends";
import { HeaderPage } from "@/components/util/header-page";
import { Settings } from "lucide-react-native";

type OpenSettingsActionProps = {
  onClick: () => void;
};

function OepnSettingsAction({ onClick }: OpenSettingsActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <Settings color={useThemeColoring("primaryAction")} />
    </TouchableOpacity>
  );
}

const profileStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
    justifyContent: "space-between",
  },
  scroll: {
    flex: 1,
    marginTop: "3%",
    paddingHorizontal: "3%",
  },
});

// todo: figure out how to re-render the stats after settings change
// todo: add loading skeletons and show trends will be enabled only after 2 weeks of logging the exercise
export function Profile() {
  const [isOpeningSettings, setIsOpeningSettings] = useState(false);

  return (
    <>
      <HeaderPage
        title={"Hello Ramki!"}
        rightAction={
          <OepnSettingsAction onClick={() => setIsOpeningSettings(true)} />
        }
      >
        <ScrollView
          style={profileStyles.scroll}
          contentContainerStyle={profileStyles.container}
        >
          <WorkoutStreakGrid />
          <LifetimeStats />
          <Trends />
        </ScrollView>
      </HeaderPage>
      <SettingsSheet
        show={isOpeningSettings}
        hide={() => setIsOpeningSettings(false)}
      />
    </>
  );
}
