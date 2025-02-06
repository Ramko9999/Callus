import React from "react";
import { HeaderPage } from "@/components/util/header-page";
import { Text } from "@/components/Themed";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  return (
    <HeaderPage title="Example">
      <Text>Play around</Text>
    </HeaderPage>
  );
}
