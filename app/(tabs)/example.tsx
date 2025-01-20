import { Text, useThemeColoring, View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { HeaderPage } from "@/components/util/header-page";
import { getLongDateDisplay, removeDays, truncTime } from "@/util/date";
import { TouchableOpacity } from "react-native";
import { CalendarDays } from "lucide-react-native";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  const [date, setDate] = useState(removeDays(truncTime(Date.now()), 2));
  const [showMonthSheet, setShowMonthSheet] = useState(false);

  return (
    <>
      <HeaderPage
        title={getLongDateDisplay(date)}
        rightAction={
          <TouchableOpacity onPress={() => setShowMonthSheet(true)}>
            <CalendarDays color={useThemeColoring("primaryAction")} />
          </TouchableOpacity>
        }
      >
        <Text>Hi</Text>
      </HeaderPage>
    </>
  );
}
