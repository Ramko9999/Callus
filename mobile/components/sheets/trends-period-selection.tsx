import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { Check } from "lucide-react-native";
import { forwardRef, ForwardedRef, useCallback } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import { commonSheetStyles, SheetProps, SheetX } from "./common";
import { tintColor } from "@/util/color";

// Time range options
const timeRangeOptions = [
  { label: "Last 6 weeks", value: "6w" },
  { label: "Last 6 months", value: "6m" },
  { label: "Last year", value: "1y" },
];

const trendsPeriodSelectionStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
    paddingBottom: "4%",
  },
  optionsContainer: {
    ...StyleUtils.flexColumn(15),
    paddingHorizontal: "5%",
    paddingBottom: "6%",
  },
  optionItem: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: "5%",
    borderBottomWidth: 2,
  },
  optionText: {
    fontSize: 16,
  },
});

type TrendsPeriodSelectionProps = {
  hide: () => void;
  selectedTimeRange: string;
  onSelectTimeRange: (value: string) => void;
};

export function TrendsPeriodSelection({
  hide,
  selectedTimeRange,
  onSelectTimeRange,
}: TrendsPeriodSelectionProps) {
  const accentColor = useThemeColoring("primaryAction");
  const borderColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.05
  );

  return (
    <View style={trendsPeriodSelectionStyles.container}>
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          Select time period
        </Text>
        <TouchableOpacity onPress={hide}>
          <SheetX />
        </TouchableOpacity>
      </View>
      <View style={trendsPeriodSelectionStyles.optionsContainer}>
        {timeRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              trendsPeriodSelectionStyles.optionItem,
              { borderBottomColor: borderColor },
            ]}
            onPress={() => onSelectTimeRange(option.value)}
          >
            <Text style={trendsPeriodSelectionStyles.optionText}>
              {option.label}
            </Text>
            {selectedTimeRange === option.value && (
              <Check size={20} color={accentColor} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

type TrendsPeriodSelectionSheetProps = SheetProps & {
  selectedTimeRange: string;
  onSelectTimeRange: (value: string) => void;
};

export const TrendsPeriodSelectionSheet = forwardRef(
  (
    {
      show,
      hide,
      onHide,
      selectedTimeRange,
      onSelectTimeRange,
    }: TrendsPeriodSelectionSheetProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    return (
      <PopupBottomSheet ref={ref} show={show} onHide={onHide}>
        <TrendsPeriodSelection
          hide={hide}
          selectedTimeRange={selectedTimeRange}
          onSelectTimeRange={onSelectTimeRange}
        />
      </PopupBottomSheet>
    );
  }
);
