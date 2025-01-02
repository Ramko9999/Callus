import { DynamicHeaderPage } from "@/components/util/dynamic-header-page";
import { Text, View } from "@/components/Themed";
import {
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useTabBar } from "@/components/util/tab-bar/context";
import { StyleUtils } from "@/util/styles";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/util/sheets";
import React from "react";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

const styles = StyleSheet.create({});

function Example() {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  return (
    <>
      <DynamicHeaderPage title={"Example"}>
        <View
          style={{
            height: "100%",
            width: "100%",
            ...StyleUtils.flexRow(),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={() => setShowBottomSheet(true)}>
            <Text large>Open Bottom Sheet</Text>
          </TouchableOpacity>
        </View>
      </DynamicHeaderPage>
      <MyBottomSheetPlay
        show={showBottomSheet}
        hide={() => setShowBottomSheet(false)}
      />
    </>
  );
}

type Props = {
  show: boolean;
  hide: () => void;
};
function MyBottomSheetPlay({ show, hide }: Props) {
  const tabBarActions = useTabBar();

  const { height } = useWindowDimensions();

  useEffect(() => {
    if (show) {
      tabBarActions.close();
    } else {
      tabBarActions.open();
    }
  }, [show]);

  return (
    <BottomSheet show={show} hide={hide} height={height * 0.85}>
      <MyBottomSheetContent />
    </BottomSheet>
  );
}

function MyBottomSheetContent() {
  const { height } = useWindowDimensions();

  return (
    <View
      background
      style={{
        height: height * 0.85,
        ...StyleUtils.flexRow(),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Yo Some Content</Text>
    </View>
  );
}
