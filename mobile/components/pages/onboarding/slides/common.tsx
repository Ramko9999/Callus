import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";

export const commonSlideStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleUtils.flexColumn(),
  },
  header: {
    marginTop: "3%",
    marginBottom: "2%",
  },
  title: {
    marginBottom: "1%",
    fontWeight: "600",
    fontSize: 32,
  },
});

export type DateOfBirth = {
  month: number;
  day: number;
  year: number;
};

export function formatHeight(height: number) {
  const feet = Math.floor(height / 12);
  const remainder = height % 12;
  return `${feet}'${remainder}"`;
}
