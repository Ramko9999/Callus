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
import { BottomSheet } from "@/components/util/popup";
import React from "react";
import { Modal } from "@/components/util/popup/modal";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

const styles = StyleSheet.create({});

function Example() {
  const [show, setShow] = useState(false);
  const dims = useWindowDimensions();
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
      <DynamicHeaderPage title={"Example"}>
        <View
          style={{
            height: "100%",
            width: "100%",
            ...StyleUtils.flexRowCenterAll(),
          }}
        >
          <TouchableOpacity onPress={() => setShow(true)}>
            <Text large>Open Modal</Text>
            <View
              style={{
                height: 300,
                width: 300,
                ...StyleUtils.flexRowCenterAll(),
                backgroundColor: "red",
              }}
            >
              <View
                style={{ height: 400, width: 400, backgroundColor: "blue" }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </DynamicHeaderPage>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        height={dims.height * 0.5}
        width={dims.width * 0.8}
      >
        <MyModalContent />
      </Modal>
    </>
  );
}

function MyModalContent() {
  const { height, width } = useWindowDimensions();

  return (
    <View
      background
      style={{
        ...StyleUtils.flexRow(),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Yo Some Content</Text>
    </View>
  );
}
