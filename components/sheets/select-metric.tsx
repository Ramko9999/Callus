import { StyleSheet } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { TouchableOpacity } from "react-native";
import { useCallback, forwardRef } from "react";
import { tintColor } from "@/util/color";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { commonSheetStyles, SheetProps } from "./common";
import { SheetX } from "./common";
import { MetricConfig } from "@/interface";

const selectMetricSheetStyles = StyleSheet.create({
  container: {
    paddingBottom: "10%",
  },
  optionsContainer: {
    ...StyleUtils.flexColumn(),
  },
  metricOption: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: "5%",
    marginRight: "7%",
    paddingVertical: "4%",
    borderBottomWidth: 1,
  },
  metricContent: {
    ...StyleUtils.flexColumn(4),
    flex: 1,
  },
  selectedMetricIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

type SelectMetricSheetProps = SheetProps & {
  metricConfigs: MetricConfig[];
  selectedMetricConfigIndex: number;
  onSelect: (index: number) => void;
};

export const SelectMetricSheet = forwardRef<
  BottomSheet,
  SelectMetricSheetProps
>(
  (
    { show, hide, onHide, metricConfigs, selectedMetricConfigIndex, onSelect },
    ref
  ) => {
    const borderColor = tintColor(
      useThemeColoring("primaryViewBackground"),
      0.05
    );

    const handleSelectMetric = useCallback(
      (index: number) => {
        onSelect(index);
        hide();
      },
      [onSelect, hide]
    );

    return (
      <PopupBottomSheet ref={ref} show={show} onHide={onHide}>
        <View style={selectMetricSheetStyles.container}>
          <View style={commonSheetStyles.sheetHeader}>
            <Text action style={{ fontWeight: 600 }}>
              Select metric to view
            </Text>
            <TouchableOpacity onPress={hide}>
              <SheetX />
            </TouchableOpacity>
          </View>
          <View style={selectMetricSheetStyles.optionsContainer}>
            {metricConfigs.map((config, index) => (
              <TouchableOpacity
                key={config.metricType}
                style={[
                  selectMetricSheetStyles.metricOption,
                  { borderBottomColor: borderColor },
                ]}
                onPress={() => handleSelectMetric(index)}
              >
                <View style={selectMetricSheetStyles.metricContent}>
                  <Text>{config.metricType}</Text>
                  <Text light small>
                    {config.description}
                  </Text>
                </View>
                {index === selectedMetricConfigIndex && (
                  <View
                    style={[
                      selectMetricSheetStyles.selectedMetricIndicator,
                      {
                        backgroundColor: config.color,
                      },
                    ]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </PopupBottomSheet>
    );
  }
);

SelectMetricSheet.displayName = "SelectMetricSheet";
