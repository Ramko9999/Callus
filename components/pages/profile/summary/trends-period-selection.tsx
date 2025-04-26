import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { Check } from "lucide-react-native";
import { forwardRef, ForwardedRef, useCallback } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { PopupBottomSheet } from "@/components/util/popup/sheet";

// Time range options
const timeRangeOptions = [
  { label: "Last 6 weeks", value: "6w" },
  { label: "Last 6 months", value: "6m" },
  { label: "Last year", value: "1y" },
];

const trendsPeriodSelectionStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
    padding: "5%",
  },
  optionsContainer: {
    ...StyleUtils.flexColumn(15),
  },
  optionItem: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  optionText: {
    fontSize: 16,
  },
});

type TrendsPeriodSelectionProps = {
  selectedTimeRange: string;
  onSelectTimeRange: (value: string) => void;
};

export function TrendsPeriodSelection({
  selectedTimeRange,
  onSelectTimeRange,
}: TrendsPeriodSelectionProps) {
  const accentColor = useThemeColoring("primaryAction");

  return (
    <View style={trendsPeriodSelectionStyles.container}>
      <View style={trendsPeriodSelectionStyles.optionsContainer}>
        {timeRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={trendsPeriodSelectionStyles.optionItem}
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

type TrendsPeriodSelectionSheetProps = {
  show: boolean;
  onHide: () => void;
  selectedTimeRange: string;
  onSelectTimeRange: (value: string) => void;
};

export const TrendsPeriodSelectionSheet = forwardRef(
  (
    {
      show,
      onHide,
      selectedTimeRange,
      onSelectTimeRange,
    }: TrendsPeriodSelectionSheetProps,
    ref: ForwardedRef<BottomSheet>
  ) => {

    return (
      <PopupBottomSheet
        ref={ref}
        show={show}
        onHide={onHide}
      >
        <TrendsPeriodSelection
          selectedTimeRange={selectedTimeRange}
          onSelectTimeRange={onSelectTimeRange}
        />
      </PopupBottomSheet>
    );
  }
);
