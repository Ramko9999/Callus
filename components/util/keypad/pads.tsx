import React from "react";
import { View, Text, FeatherIcon, FeatherIconProps } from "../../Themed";
import { StyleSheet, TouchableOpacity } from "react-native";

const styles = StyleSheet.create({
  padTile: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "solid",
    height: 60,
    width: 60,
  },
  numberPad: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  numberPadRow: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
  },
  incrementsPad: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});

type PadTileProps = {
  label?: string;
  children?: React.ReactNode;
  onClick: () => void;
};

export function PadTile({ label, children, onClick }: PadTileProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={styles.padTile}>
        {label ? (
          <Text _type="large">{label}</Text>
        ) : children ? (
          children
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

type NumberPadKey =
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

type NumberPadProps = {
  value: string;
  onUpdate: (value: string) => void;
  hideDecimal: boolean;
};

function updateNumberValueFromKey(value: string, key: NumberPadKey) {
  // todo: add a cap for the maximum for the number value
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

export function NumberPad({ value, onUpdate, hideDecimal }: NumberPadProps) {
  return (
    <View style={styles.numberPad}>
      <View style={styles.numberPadRow}>
        {["1", "2", "3"].map((number) => (
          <PadTile
            key={number}
            label={number}
            onClick={() => {
              onUpdate(updateNumberValueFromKey(value, number as NumberPadKey));
            }}
          />
        ))}
      </View>
      <View style={styles.numberPadRow}>
        {["4", "5", "6"].map((number) => (
          <PadTile
            key={number}
            label={number}
            onClick={() => {
              onUpdate(updateNumberValueFromKey(value, number as NumberPadKey));
            }}
          />
        ))}
      </View>
      <View style={styles.numberPadRow}>
        {["7", "8", "9"].map((number) => (
          <PadTile
            key={number}
            label={number.toString()}
            onClick={() => {
              onUpdate(updateNumberValueFromKey(value, number as NumberPadKey));
            }}
          />
        ))}
      </View>
      <View style={[styles.numberPadRow]}>
        {!hideDecimal && (
          <PadTile
            label="."
            onClick={() => {
              onUpdate(updateNumberValueFromKey(value, "."));
            }}
          />
        )}
        <PadTile
          label={"0"}
          onClick={() => {
            onUpdate(updateNumberValueFromKey(value, "0"));
          }}
        />
        <PadTile
          onClick={() => {
            onUpdate(updateNumberValueFromKey(value, "delete"));
          }}
        >
          <FeatherIcon
            {...({
              name: "delete",
              size: 20,
            } as FeatherIconProps)}
          />
        </PadTile>
      </View>
    </View>
  );
}

type WeightPlateProps = {
  plate: number;
  onClick: () => void;
};

const PLATES: number[] = [2.5, 5, 10, 25, 45, -2.5, -5, -10, -25, -45];

function WeightPlate({ plate, onClick }: WeightPlateProps) {
  const display = plate > 0 ? `+${plate}` : `${plate}`;

  return (
    <PadTile onClick={onClick}>
      <Text _type={"neutral"}>{display}</Text>
    </PadTile>
  );
}

function updateWeightFromPlate(weight: string, plate: number) {
  return Math.max(parseFloat(weight) + plate, 0).toString();
}

type WeightPadProps = {
  value: string;
  onUpdate: (weight: string) => void;
};

export function WeightPad({ value, onUpdate }: WeightPadProps) {
  return (
    <View style={styles.incrementsPad}>
      {PLATES.map((plate, index) => (
        <WeightPlate
          key={index}
          plate={plate}
          onClick={() => onUpdate(updateWeightFromPlate(value, plate))}
        />
      ))}
    </View>
  );
}

type RepDeltaProps = {
  delta: number;
  onClick: () => void;
};

function RepDelta({ delta, onClick }: RepDeltaProps) {
  const display = delta > 0 ? `+${delta}` : `${delta}`;
  return (
    <PadTile onClick={onClick}>
      <Text _type={"neutral"}>{display}</Text>
    </PadTile>
  );
}

const REP_DELTAS = [-5, -1, 1, 5];

function updateRepFromDelta(reps: string, delta: number) {
  return Math.max(parseInt(reps) + delta, 0).toString();
}

type RepPadProps = {
  value: string;
  onUpdate: (reps: string) => void;
};

export function RepPad({ value, onUpdate }: RepPadProps) {
  return (
    <View style={styles.incrementsPad}>
      {REP_DELTAS.map((delta, index) => (
        <RepDelta
          delta={delta}
          key={index}
          onClick={() => onUpdate(updateRepFromDelta(value, delta))}
        />
      ))}
    </View>
  );
}
