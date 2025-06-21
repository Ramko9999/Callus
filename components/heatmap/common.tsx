import { tintColor } from "@/util/color";
import { G, Defs, RadialGradient, Stop } from "react-native-svg";
import { useThemeColoring } from "../Themed";
import React from "react";
export type MuscleProps = {
  intensity: number;
};

type MuscleHighlightProps = {
  intensity: number;
  children: React.ReactNode;
  id: string;
};

export function MuscleHighlight({
  intensity,
  children,
  id,
}: MuscleHighlightProps) {
  const notActiveColor = tintColor(useThemeColoring("appBackground"), 0.4);

  const intensityColor = tintColor(
    useThemeColoring("primaryAction"),
    (1 - intensity) * 0.4
  );

  const isActive = intensity > 0;

  return (
    <G id={id} fill={isActive ? `url(#gradient-${id})` : notActiveColor}>
      <Defs>
        <RadialGradient id={`gradient-${id}`} cx="50%" cy="50%" r="50%">
          <Stop
            offset="0%"
            stopColor={isActive ? intensityColor : notActiveColor}
            stopOpacity={1}
          />
          <Stop
            offset="100%"
            stopColor={isActive ? intensityColor : notActiveColor}
            stopOpacity={0.8}
          />
        </RadialGradient>
      </Defs>
      {children}
    </G>
  );
}
