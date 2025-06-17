import { StyleSheet } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { TouchableOpacity } from "react-native";
import { useUserDetails } from "@/components/user-details";
import * as MetricApi from "@/api/metric";
import { useCallback, useMemo } from "react";
import { getDifficultyType } from "@/api/exercise";
import { useNavigation } from "@react-navigation/native";
import { tintColor } from "@/util/color";
import { SheetX } from "./common";
import { useExerciseInsight } from "../exercise/insight/context";
import { commonSheetStyles } from "./common";

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

export function SelectMetricSheet() {
  const { userDetails } = useUserDetails();
  const { name, setSelectedMetricConfigIndex, selectedMetricConfig } =
    useExerciseInsight();
  const type = getDifficultyType(name);
  const navigation = useNavigation();
  const borderColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.05
  );

  const metricConfigs = useMemo(
    () => MetricApi.getPossibleMetrics(type, userDetails?.bodyweight as number),
    [type, userDetails?.bodyweight]
  );

  const handleSelectMetric = useCallback(
    (index: number) => {
      setSelectedMetricConfigIndex(index);
      navigation.goBack();
    },
    [setSelectedMetricConfigIndex, navigation]
  );

  return (
    <View style={selectMetricSheetStyles.container}>
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          Select metric to view
        </Text>
        <TouchableOpacity onPress={navigation.goBack}>
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
            {config.metricType === selectedMetricConfig?.metricType && (
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
  );
}
