import { View, Text } from "@/components/Themed";
import { ProgressRing } from "@/components/util/progress-ring";
import { getDurationDisplay } from "@/util/date";
import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { NeutralAction, SignificantAction } from "../theme/actions";
import * as Haptics from "expo-haptics";
import { textTheme } from "@/constants/Themes";

const restingActivityStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
    justifyContent: "space-between",
    paddingTop: "3%",
    alignItems: "center",
  },
  actions: {
    ...StyleUtils.flexRow(30),
    paddingHorizontal: "5%",
    justifyContent: "center",
  },
  timer: {
    ...StyleUtils.flexColumn(),
    alignItems: "center",
  },
});

type RestingActivityProps = {
  startedAt: number;
  duration: number;
  onUpdateDuration: (delta: number) => void;
  onSkip: () => void;
};

export function RestingActivity({
  startedAt,
  duration,
  onUpdateDuration,
  onSkip,
}: RestingActivityProps) {
  const durationInMs = duration * 1000;
  const remaining = Math.max(startedAt + durationInMs - Date.now(), 0);
  const progress = remaining / durationInMs;

  return (
    <View style={restingActivityStyles.container}>
      <Text extraLarge emphasized>
        Rest
      </Text>
      <ProgressRing progress={progress}>
        <View style={restingActivityStyles.timer}>
          <Text style={{ ...textTheme.timer }}>
            {getDurationDisplay(Math.ceil(remaining / 1000))}
          </Text>
          <Text large light>
            {getDurationDisplay(duration)}
          </Text>
        </View>
      </ProgressRing>
      <View style={restingActivityStyles.actions}>
        <NeutralAction
          text="-15s"
          onClick={() => {
            onUpdateDuration(Math.max(duration - 15, 0));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          }}
        />
        <SignificantAction
          text="Skip"
          onClick={() => {
            onSkip();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          }}
        />
        <NeutralAction
          text="+15s"
          onClick={() => {
            onUpdateDuration(Math.max(duration + 15, 0));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          }}
        />
      </View>
    </View>
  );
}
