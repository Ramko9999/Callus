import { useThemeColoring, Text, View } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { forwardRef, useCallback, ForwardedRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { ProgressRing } from "@/components/util/progress-ring";
import { getDurationDisplay } from "@/util/date";
import * as Haptics from "expo-haptics";
import { Plus, Minus } from "lucide-react-native";
import { convertHexToRGBA } from "@/util/color";
import { commonSheetStyles, SheetProps, SheetX } from "./common";

const presetDurations = [60, 90, 120, 180, 300];

const editRestDurationStyles = StyleSheet.create({
  container: {
    paddingBottom: "10%",
  },
  ringAndActionsRow: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
    marginTop: "4%",
  },
  ringColumn: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionsColumn: {
    ...StyleUtils.flexColumnCenterAll(12),
  },
  action: {
    aspectRatio: 1,
    padding: "10%",
    borderRadius: "50%",
    ...StyleUtils.flexRowCenterAll(),
    marginVertical: 4,
  },
  duration: {
    fontSize: 40,
  },
  divider: {
    height: 2,
    width: "90%",
    alignSelf: "center",
    marginVertical: "2%",
  },
  pillsRow: {
    ...StyleUtils.flexRowCenterAll(10),
    marginTop: "2%",
  },
  pill: {
    borderRadius: 10,
    paddingVertical: "2%",
    paddingHorizontal: "3%",
    marginHorizontal: "1%",
    ...StyleUtils.flexRowCenterAll(),
  },
});

type EditRestDurationProps = SheetProps & {
  duration: number;
  onUpdateDuration: (duration: number) => void;
};

export const EditRestDuration = forwardRef(
  (
    { show, hide, onHide, duration, onUpdateDuration }: EditRestDurationProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    const { width } = useWindowDimensions();
    const actionBackgroundColor = useThemeColoring("calendarDayBackground");
    const primaryText = useThemeColoring("primaryText");
    const dividerColor = convertHexToRGBA(useThemeColoring("lightText"), 0.2);

    function formatPill(seconds: number) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    }

    const handleUpdateDuration = useCallback(
      (duration: number) => {
        onUpdateDuration(duration);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      },
      [onUpdateDuration]
    );

    return (
      <PopupBottomSheet ref={ref} show={show} onHide={onHide}>
        <View style={commonSheetStyles.sheetHeader}>
          <Text action style={{ fontWeight: 600 }}>
            Edit rest duration
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX size={14} />
          </TouchableOpacity>
        </View>
        <View style={editRestDurationStyles.container}>
          <View style={editRestDurationStyles.ringAndActionsRow}>
            <View style={editRestDurationStyles.ringColumn}>
              <ProgressRing
                dimension={width * 0.4}
                progress={1}
                strokeWidth={5}
              >
                <Text style={editRestDurationStyles.duration}>
                  {getDurationDisplay(duration)}
                </Text>
              </ProgressRing>
            </View>
            <View style={editRestDurationStyles.actionsColumn}>
              <TouchableOpacity
                style={[
                  editRestDurationStyles.action,
                  { backgroundColor: actionBackgroundColor },
                ]}
                onPress={() => handleUpdateDuration(duration + 15)}
              >
                <Plus size={20} color={primaryText} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  editRestDurationStyles.action,
                  { backgroundColor: actionBackgroundColor },
                ]}
                onPress={() => handleUpdateDuration(Math.max(duration - 15, 0))}
              >
                <Minus size={20} color={primaryText} />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={[
              editRestDurationStyles.divider,
              { backgroundColor: dividerColor },
            ]}
          />
          <View style={editRestDurationStyles.pillsRow}>
            {presetDurations.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  editRestDurationStyles.pill,
                  { backgroundColor: actionBackgroundColor },
                ]}
                onPress={() => handleUpdateDuration(d)}
              >
                <Text>{formatPill(d)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </PopupBottomSheet>
    );
  }
);
