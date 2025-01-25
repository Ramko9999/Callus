import { View, Text } from "@/components/Themed";
import React, { useState } from "react";
import { HeaderPage } from "@/components/util/header-page";
import { CollapsableSearchScroll } from "@/components/util/collapsable-search-scroll";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <HeaderPage title={"Example"}>
      <Text>Hi</Text>
    </HeaderPage>
  );
}
