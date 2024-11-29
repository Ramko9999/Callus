import { convertHexToRGBA } from "@/util/color";
import { Theme } from "@react-navigation/native";

export const darkColors = {
  primaryText: "#fff",
  lightText: "#999EA0",
  secondaryViewBackground: "#27272F",
  secondaryViewBorder: "#3F4147",
  primaryViewBackground: "#27272F",
  primaryViewBorder: "#48515D",
  primaryAction: "#24A0ED",
  dangerAction: "#FF6347",
  neutralAction: "#48515D",
  success: "#2ECD70",
  search: "#313035",
  rouletteSelection: "rgba(200, 200, 200, 0.1)",
  highlightedAnimationColor: convertHexToRGBA("#24A0ED", 0.6),
  dynamicHeaderBorder: "rgba(100, 100, 100, 1)",
};

export const lightColors = {
  primaryText: "#000",
  lightText: "#48515D",
  secondaryViewBackground: "#fff",
  secondaryViewBorder: "#DADCE0",
  primaryViewBackground: "#rgb(242, 242, 242)",
  primaryViewBorder: "#48515D",
  primaryAction: "#24A0ED",
  dangerAction: "#DC143C",
  neutralAction: "#C4C4C4",
  success: "#4FA94D",
  search: "#eeeef0",
  rouletteSelection: "rgba(100, 100, 100, 0.2)",
  highlightedAnimationColor: convertHexToRGBA("#24A0ED", 0.2),
  dynamicHeaderBorder: "#C4C4C4",
};

export type UIColor = keyof typeof darkColors & keyof typeof lightColors;

export const textTheme = {
  small: {
    fontSize: 12,
  },
  neutral: {
    fontSize: 16,
  },
  action: {
    fontSize: 20,
  },
  emphasized: {
    fontWeight: "bold",
  },
  large: {
    fontSize: 24,
  },
  extraLarge: {
    fontSize: 32,
  },
  timer: {
    fontSize: 48,
  },
};

export function getTabActiveTintColor(theme: "light" | "dark") {
  return theme === "light" ? "#2f95dc" : "#fff";
}

export const darkNavigationColorTheme: Theme = {
  dark: true,
  colors: {
    primary: "rgb(10, 132, 255)",
    background: "#1C1D22",
    card: "rgb(18, 18, 18)",
    text: "rgb(229, 229, 231)",
    border: "rgb(39, 39, 41)",
    notification: "rgb(255, 69, 58)",
  },
};
