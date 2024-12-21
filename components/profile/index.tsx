import { View, Text } from "../Themed";
import { StyleSheet } from "react-native";
import { DynamicHeaderPage } from "../util/dynamic-header-page";
import { StyleUtils } from "@/util/styles";
import { WorkoutStreakGrid } from "./streak-grid";
import { LifetimeStats } from "./lifetime-stats";
import { Settings } from "../theme/actions";
import { textTheme } from "@/constants/Themes";

const profileStyles = StyleSheet.create({
  container: {
    marginTop: "5%",
    ...StyleUtils.flexColumn(15),
  },
  header: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "baseline",
  },
});

export function Profile() {
  return (
    <DynamicHeaderPage
      title={"Hello Ramki!"}
      renderLargeHeader={
        <View style={profileStyles.header}>
          <Text emphasized extraLarge>
            Hello Ramki!
          </Text>
          <Settings iconSize={textTheme.extraLarge.fontSize} />
        </View>
      }
    >
      <View style={profileStyles.container}>
        <WorkoutStreakGrid />
        <LifetimeStats />
      </View>
    </DynamicHeaderPage>
  );
}
