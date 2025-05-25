import { StyleSheet, View } from "react-native";
import { StyleUtils } from "@/util/styles";
import { X as LucideX, ArrowLeft } from "lucide-react-native";
import { useThemeColoring } from "@/components/Themed";
import { tintColor } from "@/util/color";

export const commonSheetStyles = StyleSheet.create({
  sheetHeader: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: "5%",
    paddingTop: "3%",
    paddingBottom: "4%",
  },
  sheetButton: {
    borderRadius: 10,
    paddingVertical: "3%",
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
  },
  sheetIcon: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: "50%",
    aspectRatio: 1,
    padding: "2%",
  },
});

export function SheetX({ size = 14 }: { size?: number }) {
  const color = useThemeColoring("primaryText");
  const bg = tintColor(useThemeColoring("primaryViewBackground"), 0.05);
  return (
    <View style={[commonSheetStyles.sheetIcon, { backgroundColor: bg }]}>
      <LucideX size={size} color={color} />
    </View>
  );
}

export function SheetArrowLeft({ size = 14 }: { size?: number }) {
  const color = useThemeColoring("primaryText");
  const bg = tintColor(useThemeColoring("primaryViewBackground"), 0.05);
  return (
    <View style={[commonSheetStyles.sheetIcon, { backgroundColor: bg }]}>
      <ArrowLeft size={size} color={color} />
    </View>
  );
}

export type SheetProps = {
  show: boolean;
  hide: () => void;
  onHide: () => void;
};
