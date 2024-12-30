import { DynamicHeaderPage } from "@/components/util/dynamic-header-page";
import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { Trends } from "@/components/profile/trends";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { Popover } from "@/components/util/popover";
import { useState } from "react";
import { ExerciseInsights } from "@/components/exercises/insights";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  return (
    <DynamicHeaderPage title={"Example"}>
      <Text large>Hi</Text>
    </DynamicHeaderPage>
  );
}
