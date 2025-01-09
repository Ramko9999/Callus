import { View, Text, useThemeColoring } from "@/components/Themed";
import React, { useState } from "react";
import { StyleUtils } from "@/util/styles";
import { TimestampRangeEditor } from "@/components/util/timestamp-editor";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  const [startTime, setStartTime] = useState(new Date("2024-01-01").valueOf());
  const [endTime, setEndTime] = useState(new Date("2024-02-01").valueOf());

  return (
    <View
      style={{
        backgroundColor: useThemeColoring("appBackground"),
        ...StyleUtils.flexRowCenterAll(),
        width: "100%",
        height: "100%",
      }}
    >
      <View style={{ height: "50%", width: "80%", backgroundColor: "red" }}>
        <TimestampRangeEditor
          startTime={startTime}
          endTime={endTime}
          onUpdateEndTime={setEndTime}
          onUpdateStartTime={setStartTime}
        />
      </View>
    </View>
  );
}
