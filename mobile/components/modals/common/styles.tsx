import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";

export const topActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
    paddingLeft: "2%",
    paddingBottom: "2%",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    paddingRight: "3%",
  },
});

export const contentStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingTop: "3%",
  },
});
