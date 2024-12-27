import { DynamicHeaderPage } from "@/components/util/dynamic-header-page";
import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { Trends } from "@/components/profile/trends";
import { FlatList, useWindowDimensions } from "react-native";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  return (
    <DynamicHeaderPage title={"Example"}>
      <View style={{ ...StyleUtils.flexColumn(), alignItems: "center" }}>
        <Text>Hi</Text>
        <Trends/>
      </View>
    </DynamicHeaderPage>
  );
}
