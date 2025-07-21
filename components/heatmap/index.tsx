import Svg from "react-native-svg";
import { StyleSheet } from "react-native";
import { View } from "../Themed";
import React from "react";
import * as Front from "./front";
import * as Back from "./back";
import { StyleUtils } from "@/util/styles";
import { isMuscleFrontBody } from "@/api/exercise";

type MusclesToSets = Record<string, number>;

type HeatmapProps = {
  width: number;
  height: number;
  viewbox?: string;
  musclesToSets?: MusclesToSets;
};

const VIEW_BOX_TO_MUSCLES: Record<string, string[]> = {
  "237.5 150 400 400": ["Chest", "Front Delts", "Side Delts", "Triceps", "Rear Delts"],
  "237.5 240 400 400": ["Abs", "Obliques"],
  "262.5 240 350 350": ["Serratus Anterior"],
  "212.5 175 450 450": ["Biceps"],
  "162.5 175 550 550": ["Forearm Flexors", "Forearm Extensors"],
  "302.5 30 270 270": ["Neck Flexors"],
  "237.5 550 400 400": ["Quads", "Hip Flexors", "Hip Adductors", "Hip Abductors"],
  "262.5 450 350 350": ["Glutes", "Hip Abductors"],
  "262.5 580 350 350": ["Hamstrings"],
  "237.5 810 400 400": ["Tibialis Anterior"],
  "237.5 780 400 400": ["Calves"],
  "237.5 100 400 400": ["Infraspinatus", "Lats", "Traps"],
  "237.5 170 400 400": ["Lower Back"],
  "302.5 0 270 270": ["Neck Extensors"],
};

function getViewboxForMuscle(muscle: string) {
  return Object.keys(VIEW_BOX_TO_MUSCLES).find((viewbox) =>
    VIEW_BOX_TO_MUSCLES[viewbox].includes(muscle)
  );
}

function FrontHeatmap({
  width,
  height,
  viewbox,
  musclesToSets = {},
}: HeatmapProps) {
  // Helper function to interpolate intensity based on sets (0-10 range)
  const getIntensity = (muscleName: string): number => {
    const sets = musclesToSets[muscleName] || 0;
    // Interpolate between 0-10 sets, clamp to 0-1 range
    return Math.min(Math.max(sets / 10, 0), 1);
  };

  return (
    <Svg width={width} height={height} viewBox={viewbox ?? "0 0 875 1312"}>
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

function BackHeatmap({
  width,
  height,
  viewbox,
  musclesToSets = {},
}: HeatmapProps) {
  // Helper function to interpolate intensity based on sets (0-10 range)
  const getIntensity = (muscleName: string): number => {
    const sets = musclesToSets[muscleName] || 0;
    // Interpolate between 0-10 sets, clamp to 0-1 range
    return Math.min(Math.max(sets / 10, 0), 1);
  };

  return (
    <Svg width={width} height={height} viewBox={viewbox ?? "0 0 875 1312"}>
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
      <FrontHeatmap
        width={width * 0.45}
        height={height * 0.95}
        musclesToSets={musclesToSets}
      />
      <BackHeatmap
        width={width * 0.48}
        height={height}
        musclesToSets={musclesToSets}
      />
    </View>
  );
}

type MuscleDistinctionProps = {
  size: number;
  muscle: string;
  intensity: number;
};
export function MuscleDistinction({
  size,
  muscle,
  intensity,
}: MuscleDistinctionProps) {
  if (isMuscleFrontBody(muscle)) {
    return (
      <FrontHeatmap
        width={size}
        height={size}
        viewbox={getViewboxForMuscle(muscle) ?? "0 0 875 1312"}
        musclesToSets={{ [muscle]: intensity * 10 }}
      />
    );
  }

  return (
    <BackHeatmap
      width={size}
      height={size}
      viewbox={getViewboxForMuscle(muscle) ?? "0 0 875 1312"}
      musclesToSets={{ [muscle]: intensity * 10 }}
    />
  );
}
