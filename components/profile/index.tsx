import { View, Text } from "../Themed";
import { StyleSheet } from "react-native";
import { DynamicHeaderPage } from "../util/dynamic-header-page";
import { StyleUtils } from "@/util/styles";
import { WorkoutStreakGrid } from "./streak-grid";
import { LifetimeStats } from "./lifetime-stats";
import { Settings } from "../theme/actions";
import { textTheme } from "@/constants/Themes";
import { SettingsPopup } from "./settings";
import React, { useState } from "react";
import { Trends } from "./trends";

const profileStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(15),
  },
  header: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "baseline",
  },
});

// todo: figure out how to re-render the stats after settings change
// todo: add loading skeletons and show trends will be enabled only after 2 weeks of logging the exercise
export function Profile() {
  const [isOpeningSettings, setIsOpeningSettings] = useState(false);

  return (
    <>
      <DynamicHeaderPage
        title={"Hello Ramki!"}
        renderLargeHeader={
          <View style={profileStyles.header}>
            <Text emphasized extraLarge>
              Hello Ramki!
            </Text>
            <Settings
              iconSize={textTheme.extraLarge.fontSize}
              onClick={() => setIsOpeningSettings(true)}
            />
          </View>
        }
      >
        <View style={profileStyles.container}>
          <WorkoutStreakGrid />
          <LifetimeStats />
          <Trends/>
        </View>
      </DynamicHeaderPage>
      <SettingsPopup
        show={isOpeningSettings}
        hide={() => setIsOpeningSettings(false)}
      />
    </>
  );
}
