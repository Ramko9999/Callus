import { Add, Minus } from "@/components/theme/actions";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StyleSheet, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { DeleteKeypadIcon, TypingIndicator } from "@/components/theme/icons";

type PadKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "0"
  | "."
  | "delete";

const PAD_GRID_KEYS: PadKey[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "delete"],
];

function updateNumberValueFromKey(value: string, key: PadKey) {
  if (key === "delete") {
    if (value.length > 0) {
      return value.slice(0, -1);
    }
    return value;
  } else if (key === ".") {
    if (value.indexOf(".") > -1) {
      return value;
    }
    return value.concat(".");
  } else {
    if (value === "0") {
      return key;
    }
    return value.concat(key).toString();
  }
}

const padTileStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
    borderStyle: "solid",
    flex: 1,
  },
});

type PadTileProps = {
  label: PadKey;
  onClick: () => void;
};

function PadTile({ label, onClick }: PadTileProps) {
  return (
    <TouchableOpacity
      style={padTileStyles.container}
      onPress={() => {
        onClick();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
    >
      {label === "delete" ? <DeleteKeypadIcon /> : <Text large>{label}</Text>}
    </TouchableOpacity>
  );
}

function EmptyPadTile() {
  return (
    <View style={padTileStyles.container}>
      <Text></Text>
    </View>
  );
}

const padStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
  },
  row: {
    ...StyleUtils.flexRow(),
    flex: 1,
  },
});

type PadProps = {
  keysGrid: PadKey[][];
  hideDecimal: boolean;
  onClick: (key: PadKey) => void;
};

function Pad({ keysGrid, hideDecimal, onClick }: PadProps) {
  return (
    <View style={padStyles.container}>
      {keysGrid.map((rowKeys, index) => (
        <View key={index} style={padStyles.row}>
          {rowKeys.map((key, index) =>
            key === "." && hideDecimal ? (
              <EmptyPadTile key={index} />
            ) : (
              <PadTile key={index} label={key} onClick={() => onClick(key)} />
            )
          )}
        </View>
      ))}
    </View>
  );
}

const numericPadStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
  },
  input: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: "3%",
    paddingHorizontal: "6%",
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    ...StyleUtils.flexRow(2),
    alignItems: "center",
  },
  pad: {
    ...StyleUtils.flexColumn(15)
  },
});

type NumericPadProps = {
  value: string;
  onUpdate: (value: string) => void;
  hideDecimal: boolean;
  increment: number;
};

// ehancement: when pad key is pressed, throttle the updates to the input
export function NumericPad({
  value,
  onUpdate,
  hideDecimal,
  increment,
}: NumericPadProps) {
  return (
    <View
      style={[
        numericPadStyles.container,
        { backgroundColor: useThemeColoring("padBackground") },
      ]}
    >
      <View background style={numericPadStyles.input}>
        <Add
          onClick={() => {
            const numericValue = value.trim() === "" ? 0 : parseFloat(value);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onUpdate((numericValue + increment).toString());
          }}
        />
        <View style={numericPadStyles.value}>
          <Text large>{value}</Text>
          <TypingIndicator />
        </View>
        <Minus
          onClick={() => {
            const numericValue = value.trim() === "" ? 0 : parseFloat(value);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onUpdate(Math.max(numericValue - increment, 0).toString());
          }}
        />
      </View>
      <Pad
        keysGrid={PAD_GRID_KEYS}
        hideDecimal={hideDecimal}
        onClick={(key) => onUpdate(updateNumberValueFromKey(value, key))}
      />
    </View>
  );
}
