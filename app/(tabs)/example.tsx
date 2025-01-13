import { Text } from "@/components/Themed";
import React from "react";
import { DynamicHeaderPage } from "@/components/util/dynamic-header-page";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  return (
    <>
      <DynamicHeaderPage title="Example">
        <Text>Hi bozo</Text>
      </DynamicHeaderPage>
    </>
  );
}
