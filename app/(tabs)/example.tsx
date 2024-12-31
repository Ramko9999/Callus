import { DynamicHeaderPage } from "@/components/util/dynamic-header-page";
import { Text } from "@/components/Themed";
import { TouchableOpacity } from "react-native";
import { useTabBar } from "@/components/util/tab-bar/context";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  const tabBarActions = useTabBar();
  return (
    <DynamicHeaderPage title={"Example"}>
      <TouchableOpacity onPress={() => tabBarActions.open()}>
        <Text>Open Tab Bar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => tabBarActions.close()}>
        <Text>Close Tab Bar</Text>
      </TouchableOpacity>
    </DynamicHeaderPage>
  );
}
