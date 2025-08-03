import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { Roulette } from "../../list/roulette";
import { textTheme } from "@/constants/Themes";

const MINUTES = Array.from({ length: 60 }).map((_, index) => index.toString());
const SECONDS = MINUTES.map((min) => min.padStart(2, "0"));
const ROULETTE_ITEM_HEIGHT = 90;

const durationPadStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    width: "100%",
  },
  colon: {
    height: ROULETTE_ITEM_HEIGHT,
    alignSelf: "center",
  },
  selection: {
    position: "absolute",
    top: 2 * ROULETTE_ITEM_HEIGHT,
    height: ROULETTE_ITEM_HEIGHT,
    width: "100%",
  },
});

type DurationPad = {
  duration: string;
  onUpdate: (duration: string) => void;
};

export function DurationPad({ duration, onUpdate }: DurationPad) {
  const minutes = Math.floor(parseInt(duration) / 60);
  const seconds = parseInt(duration) % 60;

  const onUpdateMinutes = (value: string) =>
    onUpdate((parseInt(value) * 60 + seconds).toString());

  const onUpdateSeconds = (value: string) =>
    onUpdate((minutes * 60 + parseInt(value)).toString());

  return (
    <View background style={durationPadStyles.container}>
      <View
        style={[
          durationPadStyles.selection,
          { backgroundColor: useThemeColoring("rouletteSelection") },
        ]}
      />
      <Roulette
        values={MINUTES}
        onSelect={onUpdateMinutes}
        valueSize={textTheme.roulette.fontSize}
        itemHeight={ROULETTE_ITEM_HEIGHT}
        initialValue={minutes.toString()}
      />
      <View style={durationPadStyles.colon}>
        <Text style={{ fontSize: textTheme.roulette.fontSize }}>:</Text>
      </View>
      <Roulette
        values={SECONDS}
        onSelect={onUpdateSeconds}
        valueSize={textTheme.roulette.fontSize}
        itemHeight={ROULETTE_ITEM_HEIGHT}
        initialValue={seconds.toString().padStart(2, "0")}
      />
    </View>
  );
}
