import { convertHexToRGBA } from "@/util/color";
import { Theme } from "@react-navigation/native";

// todo: figure out colors for tiles
export const darkColors = {
  textInputPlaceholderColor: "#434247",
  primaryText: "#ffffff",
  lightText: "#999EA0",
  secondaryViewBackground: "#27272F",
  secondaryViewBorder: "#3F4147",
  primaryViewBackground: "#161515",
  primaryViewBorder: "#48515D",
  primaryAction: "#28A0ED",
  dangerAction: "#FF6347",
  neutralAction: "#48515D",
  success: "#2ECD70",
  search: "#313035",
  rouletteSelection: "rgba(200, 200, 200, 0.1)",
  highlightedAnimationColor: convertHexToRGBA("#28A0ED", 0.6),
  dynamicHeaderBorder: "rgba(100, 100, 100, 1)",
  appBackground: "#000000",
  improvement: "#13EBA0",
  degradation: "#FF6347",
  weightLineStroke: "#28A0ED",
  repsLineStroke: "#FF6347",
  oneRepEstimateLineStroke: "#FFFF00",
  durationLineStroke: "#90EE90",
  restDurationLineStroke: "#FF00FF",
  inactiveTileColor: "#4A4A4C",
  bottomSheetBackground: "#161515",
  padBackground: "black",
  calendarDayBackground: "#2d2c2c",
  calendarDayBackgroundTint: "#424141",
  popover: "#2c2c2e",
  separator: "rgba(255,255,255,0.1)",
  destructive: "#ff453a",
};

export const lightColors = {
  textInputPlaceholderColor: "#434247",
  primaryText: "#000000",
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
  appBackground: "000000",
  improvement: "#13EBA0",
  degradation: "#DC143C",
  weightLineStroke: "#24A0ED",
  repsLineStroke: "#DC143C",
  oneRepEstimateLineStroke: "#FFFF00",
  durationLineStroke: "#90EE90",
  restDurationLineStroke: "#FF00FF",
  inactiveTileColor: "#4A4A4C",
  bottomSheetBackground: "#161515",
  padBackground: "black",
  calendarDayBackground: "#2d2c2c",
  calendarDayBackgroundTint: "#424141",
  popover: "#f2f2f7",
  separator: "rgba(0,0,0,0.1)",
  destructive: "#ff3b30",
};

export type UIColor = keyof typeof darkColors & keyof typeof lightColors;

export const textTheme = {
  tab: {
    fontSize: 10,
    fontWeight: "600",
  },
  small: {
    fontSize: 12,
  },
  sneutral: {
    fontSize: 14,
  },
  neutral: {
    fontSize: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
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
  stat: {
    fontSize: 42,
  },
  roulette: {
    fontSize: 70,
  },
  italic: {
    fontStyle: "italic",
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
