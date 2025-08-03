import { useThemeColoring } from "@/components/Themed";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { StyleUtils } from "@/util/styles";
import { StreakGrid } from "./streak-grid";
import React from "react";
import { HeaderPage } from "@/components/util/header-page";
import { Settings } from "lucide-react-native";
import { useUserDetails } from "@/components/user-details";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/layout/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { LifetimeSummary } from "./summary/lifetime";
import { SummaryTrends } from "./summary/trends";
import { PersonalRecords } from "./personal-records";
import { LiveWorkoutPreview } from "@/components/workout/preview";

type OpenSettingsActionProps = {
  onClick: () => void;
};

function OpenSettingsAction({ onClick }: OpenSettingsActionProps) {
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
    paddingBottom: "30%"
  },
  scroll: {
    flex: 1,
    marginTop: "3%",
    paddingHorizontal: "3%",
  },
});

export function Profile() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userDetails } = useUserDetails();

  return (
    <>
      <HeaderPage
        title={`Hello ${userDetails?.name as string}!`}
        rightAction={
          <OpenSettingsAction onClick={() => navigation.navigate("settings")} />
        }
      >
        <ScrollView
          style={profileStyles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={profileStyles.container}
        >
          <LifetimeSummary />
          <StreakGrid />
          <SummaryTrends />
          <PersonalRecords />
        </ScrollView>
      </HeaderPage>
      <LiveWorkoutPreview />
    </>
  );
}
