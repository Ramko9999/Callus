import { View, useThemeColoring } from "@/components/Themed";
import React, { useState } from "react";
import { StyleUtils } from "@/util/styles";
import { DurationPad } from "@/components/util/popup/inputs-pad/duration";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  const [duration, setDuration] = useState("112");

  return (
    <View
      style={{
        backgroundColor: useThemeColoring("appBackground"),
        ...StyleUtils.flexRowCenterAll(),
        width: "100%",
        height: "100%",
      }}
    >
      <DurationPad
        duration={duration}
        onUpdate={(updatedDuration) => {
          setDuration(updatedDuration);
        }}
      />
    </View>
  );
}
