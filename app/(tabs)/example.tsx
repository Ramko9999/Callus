import { View, useThemeColoring, Text } from "@/components/Themed";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { StyleUtils } from "@/util/styles";
import { useEffect, useState } from "react";
import React from "react";
import { InputsPad } from "@/components/util/popup/inputs-pad";
import { KeypadType } from "@/interface";
import { DynamicHeaderPage } from "@/components/util/dynamic-header-page";
import { useTabBar } from "@/components/util/tab-bar/context";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  const [value, setValue] = useState("125");
  const [show, setShow] = useState(false);
  const tabBarActions = useTabBar();

  useEffect(() => {
    if (show) {
      tabBarActions.close();
    } else {
      tabBarActions.open();
    }
  }, [show]);

  return (
    <>
      <DynamicHeaderPage title="Example">
        <TouchableOpacity onPress={() => setShow(true)}>
          <Text large>Open inputs pad</Text>
        </TouchableOpacity>
      </DynamicHeaderPage>
      <InputsPad
        show={show}
        onHide={() => setShow(false)}
        value={value}
        onUpdate={setValue}
        type={KeypadType.WEIGHT}
      />
    </>
  );
}
