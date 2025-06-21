import Svg from "react-native-svg";
import { StyleSheet } from "react-native";
import { View } from "../Themed";
import React from "react";
import * as Front from "./front";
import * as Back from "./back";
import { StyleUtils } from "@/util/styles";


type HeatmapProps = {
  width: number;
  height: number;
  musclesToSets?: MusclesToSets;
};

export function FrontHeatmap({ width, height, musclesToSets = {} }: HeatmapProps) {
  // Helper function to interpolate intensity based on sets (0-10 range)
  const getIntensity = (muscleName: string): number => {
    const sets = musclesToSets[muscleName] || 0;
    // Interpolate between 0-10 sets, clamp to 0-1 range
    return Math.min(Math.max(sets / 10, 0), 1);
  };

  return (
    <Svg width={width} height={height} viewBox="0 0 875 1312">
      <Front.Misc />
      <Front.Chest intensity={getIntensity("Chest")} />
      <Front.Biceps intensity={getIntensity("Biceps")} />
      <Front.Abs intensity={getIntensity("Abs")} />
      <Front.Quads intensity={getIntensity("Quads")} />
      <Front.TibialisAnterior intensity={getIntensity("Tibialis Anterior")} />
      <Front.ForearmFlexors intensity={getIntensity("Forearm Flexors")} />
      <Front.Obliques intensity={getIntensity("Obliques")} />
      <Front.Calves intensity={getIntensity("Calves")} />
      <Front.HipAdductors intensity={getIntensity("Hip Adductors")} />
      <Front.Traps intensity={getIntensity("Traps")} />
      <Front.FrontDelts intensity={getIntensity("Front Delts")} />
      <Front.HipFlexors intensity={getIntensity("Hip Flexors")} />
      <Front.SideDelts intensity={getIntensity("Side Delts")} />
      <Front.HipAbductors intensity={getIntensity("Hip Abductors")} />
      <Front.NeckFlexors intensity={getIntensity("Neck Flexors")} />
      <Front.SerratusAnterior intensity={getIntensity("Serratus Anterior")} />
    </Svg>
  );
}

export function BackHeatmap({ width, height, musclesToSets = {} }: HeatmapProps) {
  // Helper function to interpolate intensity based on sets (0-10 range)
  const getIntensity = (muscleName: string): number => {
    const sets = musclesToSets[muscleName] || 0;
    // Interpolate between 0-10 sets, clamp to 0-1 range
    return Math.min(Math.max(sets / 10, 0), 1);
  };

  return (
    <Svg width={width} height={height} viewBox="0 0 875 1312">
      <Back.Misc />
      <Back.Lats intensity={getIntensity("Lats")} />
      <Back.LowerBack intensity={getIntensity("Lower Back")} />
      <Back.Traps intensity={getIntensity("Traps")} />
      <Back.RearDelts intensity={getIntensity("Rear Delts")} />
      <Back.Glutes intensity={getIntensity("Glutes")} />
      <Back.Hamstrings intensity={getIntensity("Hamstrings")} />
      <Back.Calves intensity={getIntensity("Calves")} />
      <Back.Triceps intensity={getIntensity("Triceps")} />
      <Back.ForearmExtensors intensity={getIntensity("Forearm Extensors")} />
      <Back.Quads intensity={getIntensity("Quads")} />
      <Back.HipAdductors intensity={getIntensity("Hip Adductors")} />
      <Back.Infraspinatus intensity={getIntensity("Infraspinatus")} />
      <Back.Obliques intensity={getIntensity("Obliques")} />
      <Back.NeckExtensors intensity={getIntensity("Neck Extensors")} />
    </Svg>
  );
}

const heatmapStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
  },
});

export function Heatmap({ width, height, musclesToSets = {} }: HeatmapProps) {
  return (
    <View style={heatmapStyles.container}>
      <FrontHeatmap width={width * 0.45} height={height * 0.95} musclesToSets={musclesToSets} />
      <BackHeatmap width={width * 0.48} height={height} musclesToSets={musclesToSets} />
    </View>
  );
}

type MusclesToSets = Record<string, number>;
