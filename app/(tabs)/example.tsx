import { useEffect, useRef, useState } from "react";
import { DynamicHeaderPage } from "@/components/util/dynamic-header-page";
import { ProgressRing } from "@/components/util/progress-ring";
import { View } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { RestingActivity } from "@/components/live/activity";
import { useTimer } from "@/components/hooks/use-timer";
import { Audio } from "expo-av";
import { SignificantAction } from "@/components/theme/actions";
import { timeout } from "@/util/misc";
import { Modal } from "@/components/util/modal";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

type WorkoutSounds = {
  shortBeep: Audio.Sound;
  longBeep: Audio.Sound;
};

function Example() {
  const [isModalOpen, setisModalOpen] = useState(false);

  return (
    <>
      <DynamicHeaderPage title="Playground">
        <View style={{ ...StyleUtils.flexColumn(), height: "100%" }}>
          <SignificantAction
            text="Open Modal"
            onClick={() => setisModalOpen(true)}
          />
        </View>
      </DynamicHeaderPage>
      <Modal show={isModalOpen} hide={() => setisModalOpen(false)}>
        {null}
      </Modal>
    </>
  );
}
