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

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

type WorkoutSounds = {
  shortBeep: Audio.Sound;
  longBeep: Audio.Sound;
};

function Example() {
  const [sounds, setSounds] = useState<WorkoutSounds>();

  const playRef = useRef(false);

  Promise.all([
    Audio.Sound.createAsync(require("@/assets/audio/short-beep.mp3")),
    Audio.Sound.createAsync(require("@/assets/audio/long-beep.mp3")),
  ]).then(([{ sound: shortBeep }, { sound: longBeep }]) => {
    setSounds({ shortBeep, longBeep });
  });

  const playRestCompleting = async () => {
    if (!playRef.current) {
      playRef.current = true;
      await sounds?.shortBeep.replayAsync();
      await timeout(2000);
      await sounds?.shortBeep.replayAsync();
      await timeout(2000);
      await sounds?.longBeep.replayAsync();
      playRef.current = false;
    }
  };

  return (
    <DynamicHeaderPage title="Playground">
      <View style={{ ...StyleUtils.flexColumn(), height: "100%" }}>
        <SignificantAction text="Click" onClick={playRestCompleting} />
      </View>
    </DynamicHeaderPage>
  );
}
