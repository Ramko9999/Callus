import { ViewStyle } from "react-native";

function flexRowCenterAll(gap?: number): ViewStyle {
  return {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap,
  };
}

function flexRow(gap?: number): ViewStyle {
  return {
    display: "flex",
    flexDirection: "row",
    gap,
  };
}

function flexColumn(gap?: number): ViewStyle {
  return {
    display: "flex",
    flexDirection: "column",
    gap,
  };
}

export const StyleUtils = {
  flexRowCenterAll,
  flexRow,
  flexColumn,
};

export const WORKOUT_PLAYER_EDITOR_HEIGHT = 0.7;

export const EDITOR_SET_HEIGHT = 60;
export const EDITOR_EXERCISE_HEIGHT = 70;
export const TEXT_ACTION_HEIGHT = 40;

export const ICON_ACTION_DIMENSION = 45;