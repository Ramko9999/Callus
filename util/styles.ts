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
        gap
    }
}

function flexColumn(gap?: number): ViewStyle {
    return {
        display: "flex",
        flexDirection: "column",
        gap
    }
}

export const StyleUtils = {
  flexRowCenterAll,
  flexRow,
  flexColumn
};
