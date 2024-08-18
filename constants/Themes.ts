import { Theme } from "@react-navigation/native";

export const darkColorTheme = {
  text: { color: "#fff" },
  viewForeground: {
    backgroundColor: "#27272F",
    borderColor: "#3F4147",
  },
  viewBackground: {
  },
  actionNeutral: {
    color: "#24A0ED",
  },
  actionDanger: {
    color: "#FF6347",
  }
};

export const lightColorTheme = {
  text: { color: "#000" },
  viewForeground: {
    backgroundColor: "#fff",
    borderColor: "#DADCE0",
  },
  viewBackground: {
    backgroundColor: "#rgb(242, 242, 242)"
  },
  actionNeutral: {
    color: "#24A0ED",
  },
  actionDanger: {
    color: "#DC143C",
  },
};

export type UIColor = keyof typeof darkColorTheme &
  keyof typeof lightColorTheme;

export const textTheme = {
  small: {
    fontSize: 12,
  },
  neutral: {
    fontSize: 16,
  },
  emphasized: {
    fontSize: 16,
    fontWeight: "bold",
  },
  large: {
    fontSize: 24,
  },
};

export function getTabActiveTintColor(theme: "light" | "dark"){
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
