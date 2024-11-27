import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { useEffect, useRef, useState } from "react";
import {  DynamicHeaderPage } from "@/components/util/dynamic-header-page";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  const [focus, setFocus] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);

  return (
    <DynamicHeaderPage title="Home">
      <BlurView intensity={80} tint="dark" experimentalBlurMethod="dimezisBlurView">
      <View style={{...StyleUtils.flexColumn(10)}}>
            <Text large>Sup bro</Text>
        </View>
      </BlurView>
    </DynamicHeaderPage>
  );
}
