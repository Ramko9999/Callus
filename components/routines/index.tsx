import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "../Themed";
import { DynamicHeaderPage } from "../util/dynamic-header-page";

export function Routines() {
  return (
    <DynamicHeaderPage title={"Routines"}>
      <View>
        <Text large>Start a routine</Text>
      </View>
    </DynamicHeaderPage>
  );
}
