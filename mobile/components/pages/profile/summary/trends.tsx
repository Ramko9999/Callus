import {
  CompletedExercise,
  DifficultyType,
  BodyWeightDifficulty,
  WeightDifficulty,
  AssistedBodyWeightDifficulty,
  SetStatus,
  WorkedOutDay,
} from "@/interface";
import { truncTime, addDays, removeDays } from "@/util/date";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { WorkoutApi } from "@/api/workout";
import { View, Text, useThemeColoring } from "@/components/Themed";
import {
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { StyleUtils } from "@/util/styles";
import * as d3 from "d3";
import Svg, { Rect, Text as SvgText, Line, G } from "react-native-svg";
import { textTheme } from "@/constants/Themes";
import * as Haptics from "expo-haptics";
import { ArrayUtils, getNumberSuffix } from "@/util/misc";
import { ChevronDown } from "lucide-react-native";
import { usePopup } from "@/components/popup";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  SharedValue,
  withRepeat,
  interpolateColor,
} from "react-native-reanimated";
import { convertHexToRGBA } from "@/util/color";
import { TextSkeleton } from "@/components/util/loading";
import { ExerciseStoreSelectors, useExercisesStore } from "@/components/store";
import { useShallow } from "zustand/shallow";

const CHART_HEIGHT_MULTIPLIER = 0.17;
const CHART_WIDTH_MULTIPLIER = 0.96;
const PADDING = { top: 10, right: 20, bottom: 30, left: 55 };

type DataPoint = {
  date: number;
  value: number;
};

function formatTitleDateRange(startDate: number, endDate: number): string {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Format month names
  const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
  });

  const startMonth = monthFormatter.format(startDateObj);
  const endMonth = monthFormatter.format(endDateObj);

  const startDay = startDateObj.getDate();
  const endDay = endDateObj.getDate();

  const startFormatted = `${startMonth} ${startDay}${getNumberSuffix(
    startDay
  )}`;
  const endFormatted = `${endMonth} ${endDay}${getNumberSuffix(endDay)}`;

  return `${startFormatted} - ${endFormatted}`;
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}m lbs`;
  }
  if (volume >= 1000) {
    return `${Math.round(volume / 1000)}k lbs`;
  }
  return `${Math.round(volume)} lbs`;
}

function formatTotalVolume(volume: number): string {
  return `${volume} lbs`;
}

function formatDuration(durationInMs: number): string {
  const hours = (durationInMs / 3600000).toFixed(1);
  return `${hours}h`;
}

function formatXAxisLabel(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function generateVolumeTrends(
  exercises: CompletedExercise[],
  metaIdToDifficultyType: Record<string, DifficultyType>,
  startDate: number,
  endDate: number
): DataPoint[] {
  const volumeByDay = new Map<number, number>();

  // Initialize all days with zero volume
  for (let day = startDate; day <= endDate; day = addDays(day, 1)) {
    const dayKey = truncTime(day);
    volumeByDay.set(dayKey, 0);
  }

  // Calculate volume for each exercise
  exercises.forEach((exercise) => {
    const day = truncTime(exercise.workoutStartedAt);
    let dayVolume = volumeByDay.get(day) || 0;

    exercise.sets.forEach((set) => {
      if (set.status !== SetStatus.FINISHED) return;
      const difficultyType = metaIdToDifficultyType[exercise.metaId];

      switch (difficultyType) {
        case DifficultyType.BODYWEIGHT:
          const bwReps = (set.difficulty as BodyWeightDifficulty).reps;
          dayVolume += exercise.bodyweight * bwReps;
          break;

        case DifficultyType.WEIGHTED_BODYWEIGHT:
          const wbwDiff = set.difficulty as WeightDifficulty;
          dayVolume += (exercise.bodyweight + wbwDiff.weight) * wbwDiff.reps;
          break;

        case DifficultyType.WEIGHT:
          const wDiff = set.difficulty as WeightDifficulty;
          dayVolume += wDiff.weight * wDiff.reps;
          break;

        case DifficultyType.ASSISTED_BODYWEIGHT:
          const abwDiff = set.difficulty as AssistedBodyWeightDifficulty;
          dayVolume +=
            (exercise.bodyweight - abwDiff.assistanceWeight) * abwDiff.reps;
          break;
      }
    });

    volumeByDay.set(day, dayVolume);
  });

  // Convert to DataPoint array and sort by date
  return Array.from(volumeByDay.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date - b.date);
}

function generateDurationTrends(
  workedOutDays: WorkedOutDay[],
  startDate: number,
  endDate: number
): DataPoint[] {
  // Create a map for quick lookup of durations by day
  const durationByDay = new Map<number, number>();

  // Initialize the map with all days in the range set to 0 duration
  for (let day = startDate; day <= endDate; day = addDays(day, 1)) {
    const dayKey = truncTime(day);
    durationByDay.set(dayKey, 0);
  }

  // Add durations from worked out days
  workedOutDays.forEach((workedOutDay) => {
    durationByDay.set(workedOutDay.day, workedOutDay.totalDurationWorkedOut);
  });

  // Convert to DataPoint array and sort by date
  return Array.from(durationByDay.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date - b.date);
}

function groupDataByTimePeriod(
  data: DataPoint[],
  getGroupDate: (timestamp: number) => number
): DataPoint[] {
  if (!data.length) return [];

  const groupMap = new Map<number, number>();

  data.forEach((dataPoint) => {
    const groupKey = getGroupDate(dataPoint.date);
    groupMap.set(groupKey, (groupMap.get(groupKey) || 0) + dataPoint.value);
  });

  return Array.from(groupMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date - b.date);
}

function getWeekStartDate(timestamp: number): number {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = date.getDate() - day;
  const startOfWeek = new Date(date);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek.getTime();
}

function getMonthStartDate(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

function getTwoMonthPeriodStartDate(timestamp: number): number {
  const date = new Date(timestamp);
  const twoMonthPeriod = Math.floor(date.getMonth() / 2);
  return new Date(date.getFullYear(), twoMonthPeriod * 2, 1).getTime();
}

type SummaryMetric = {
  name: string;
  generateData: (
    startDate: number,
    endDate: number,
    metaIdsToDifficultyType: Record<string, DifficultyType>
  ) => Promise<DataPoint[]>;
  formatYAxisLabel: (value: number) => string;
  formatTitleValue: (value: number) => string;
};

const volumeMetric: SummaryMetric = {
  name: "Volume",
  generateData: async (startDate, endDate, metaIdToDifficultyType) => {
    const exercises = await WorkoutApi.getAllExerciseCompletions(
      startDate,
      endDate
    );

    return generateVolumeTrends(
      exercises,
      metaIdToDifficultyType,
      startDate,
      endDate
    );
  },
  formatYAxisLabel: formatVolume,
  formatTitleValue: formatTotalVolume,
};

const durationMetric: SummaryMetric = {
  name: "Duration",
  generateData: async (startDate, endDate) => {
    const workedOutDays = await WorkoutApi.getWorkedOutDays(endDate, startDate);
    return generateDurationTrends(workedOutDays, startDate, endDate);
  },
  formatYAxisLabel: formatDuration,
  formatTitleValue: formatDuration,
};

const summaryBarChartStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  header: {
    ...StyleUtils.flexColumn(),
    marginBottom: "2%",
  },
  headerRow: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeFilterButton: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    paddingVertical: "1%",
    paddingHorizontal: "4%",
    borderRadius: 8,
  },
  timeFilterText: {
    marginRight: 4,
  },
  noDataText: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataTextLabel: {
    textAlign: "center",
  },
});

// Time range options for the popup
const timeRangeOptions = [
  { label: "Last 6 weeks", value: "6w" },
  { label: "Last 6 months", value: "6m" },
  { label: "Last year", value: "1y" },
];

type SummaryBarChartProps = {
  data: DataPoint[];
  formatYAxisLabel: (value: number) => string;
  formatTitleValue: (value: number) => string;
  height: number;
  metricType: string;
  timeRange: string;
  defaultMaxYValue: number;
};

// Create animated version of SVG Rect component
const AnimatedRect = Animated.createAnimatedComponent(Rect);

type BarProps = {
  x: number | undefined;
  y: number;
  width: number;
  height: number;
  color: string;
  barSelectionProgress: SharedValue<number>;
  isSelected: boolean;
  onPress: () => void;
};

function Bar({
  x,
  y,
  width,
  height,
  color,
  barSelectionProgress,
  isSelected,
  onPress,
}: BarProps) {
  // Use useAnimatedProps for SVG property animation
  const animatedProps = useAnimatedProps(() => {
    // When barSelectionProgress is 0, all bars are at opacity 1
    // When barSelectionProgress is 1, selected bar is at opacity 1, others at 0.4
    const opacity =
      isSelected || barSelectionProgress.value === 0
        ? 1
        : 1 - 0.6 * barSelectionProgress.value;

    return { opacity };
  });

  return (
    <AnimatedRect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color}
      rx={4}
      ry={4}
      animatedProps={animatedProps}
      onPress={onPress}
    />
  );
}

function SummaryBarChart({
  data,
  formatYAxisLabel,
  formatTitleValue,
  height,
  metricType,
  timeRange,
  defaultMaxYValue,
}: SummaryBarChartProps) {
  const { width } = useWindowDimensions();
  const accentColor = useThemeColoring("primaryAction");
  const gridColor = useThemeColoring("dynamicHeaderBorder");
  const axisTextColor = useThemeColoring("lightText");
  const barColor = accentColor;
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const { trendsPeriodSelection } = usePopup();

  // Use a single shared value to track selection progress (0-1)
  const barSelectionProgress = useSharedValue(0);

  const groupedData = useMemo(() => {
    switch (timeRange) {
      case "6w":
        return groupDataByTimePeriod(data, getWeekStartDate);
      case "6m":
        return groupDataByTimePeriod(data, getMonthStartDate);
      case "1y":
        return groupDataByTimePeriod(data, getTwoMonthPeriodStartDate);
      default:
        return groupDataByTimePeriod(data, getWeekStartDate);
    }
  }, [data, timeRange]);

  useEffect(() => {
    barSelectionProgress.value = withTiming(selectedBarIndex !== null ? 1 : 0, {
      duration: 250,
    });
  }, [selectedBarIndex]);

  useEffect(() => {
    setSelectedBarIndex(null);
  }, [metricType, timeRange]);

  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const handleBarPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (selectedBarIndex === index) {
      setSelectedBarIndex(null);
    } else {
      setSelectedBarIndex(index);
    }
  };

  const selectedBarData = useMemo(() => {
    if (selectedBarIndex !== null && groupedData[selectedBarIndex]) {
      return groupedData[selectedBarIndex];
    }
    return null;
  }, [selectedBarIndex, groupedData]);

  const dateRangeText = useMemo(() => {
    const startDateTimestamp = selectedBarData
      ? selectedBarData.date
      : groupedData[0].date;
    let endingDateTimestamp = selectedBarData
      ? selectedBarData.date
      : ArrayUtils.last(groupedData).date;

    const endingDate = new Date(endingDateTimestamp);

    if (timeRange === "6m") {
      endingDateTimestamp = new Date(
        endingDate.getFullYear(),
        endingDate.getMonth() + 1,
        1
      ).getTime();
    } else if (timeRange === "1y") {
      endingDateTimestamp = new Date(
        endingDate.getFullYear(),
        endingDate.getMonth() + 2,
        1
      ).getTime();
    } else {
      endingDateTimestamp = addDays(endingDateTimestamp, 7);
    }

    return formatTitleDateRange(
      startDateTimestamp,
      removeDays(endingDateTimestamp, 1)
    );
  }, [selectedBarData, groupedData, timeRange]);

  const getTimeRangeLabel = () => {
    return timeRangeOptions.find(
      (o) => o.value === trendsPeriodSelection.timeRange
    )!.label;
  };

  if (groupedData.length === 0) {
    return (
      <View style={summaryBarChartStyles.container}>
        <View style={summaryBarChartStyles.headerRow}>
          <Text header emphasized>
            {formatTitleValue(0)}
          </Text>
          <TouchableOpacity
            style={summaryBarChartStyles.timeFilterButton}
            onPress={() => trendsPeriodSelection.open()}
          >
            <Text
              style={[
                summaryBarChartStyles.timeFilterText,
                { color: accentColor },
              ]}
            >
              {getTimeRangeLabel()}
            </Text>
            <ChevronDown size={16} color={accentColor} />
          </TouchableOpacity>
        </View>
        <Text light sneutral>
          No data available
        </Text>
        <View style={summaryBarChartStyles.noDataText}>
          <Text style={summaryBarChartStyles.noDataTextLabel}>
            No data available
          </Text>
        </View>
      </View>
    );
  }

  const chartHeight = height;
  const chartWidth = width * CHART_WIDTH_MULTIPLIER;
  const barPadding = 0.2;

  const xScale = d3
    .scaleBand()
    .domain(groupedData.map((d) => d.date.toString()))
    .range([PADDING.left, chartWidth - PADDING.right])
    .padding(barPadding);

  const maxValue = Math.max(
    Math.max(...groupedData.map((d) => d.value)),
    defaultMaxYValue
  );
  // Ensure we have exactly 5 ticks with first at 0
  const tickStep = Math.ceil(maxValue / 4);
  const yMax = tickStep * 4;

  const yScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([chartHeight - PADDING.bottom, PADDING.top]);

  // Create exactly 5 evenly spaced ticks starting at 0
  const yTicks = [0, tickStep, tickStep * 2, tickStep * 3, tickStep * 4];

  const barWidth = xScale.bandwidth();

  return (
    <View style={summaryBarChartStyles.container}>
      <View style={summaryBarChartStyles.header}>
        <View style={summaryBarChartStyles.headerRow}>
          <Text header emphasized>
            {formatTitleValue(selectedBarData?.value || total)}
          </Text>
          <TouchableOpacity
            style={summaryBarChartStyles.timeFilterButton}
            onPress={() => trendsPeriodSelection.open()}
          >
            <Text
              style={[
                summaryBarChartStyles.timeFilterText,
                { color: accentColor },
              ]}
            >
              {getTimeRangeLabel()}
            </Text>
            <ChevronDown size={16} color={accentColor} />
          </TouchableOpacity>
        </View>
        <Text light sneutral>
          {dateRangeText}
        </Text>
      </View>
      <Svg width={chartWidth} height={chartHeight}>
        {yTicks.map((tick, i) => (
          <Line
            key={`grid-${i}`}
            x1={PADDING.left}
            x2={chartWidth - PADDING.right}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke={gridColor}
            strokeOpacity={0.5}
            strokeDasharray="3,3"
            strokeWidth={1}
          />
        ))}

        <Line
          x1={PADDING.left}
          x2={chartWidth - PADDING.right}
          y1={chartHeight - PADDING.bottom}
          y2={chartHeight - PADDING.bottom}
          stroke={gridColor}
          strokeWidth={1}
        />

        {groupedData.map((d, i) => (
          <G key={`bar-${i}`}>
            <Bar
              x={xScale(d.date.toString())}
              y={yScale(d.value)}
              width={barWidth}
              height={chartHeight - PADDING.bottom - yScale(d.value)}
              color={barColor}
              barSelectionProgress={barSelectionProgress}
              isSelected={i === selectedBarIndex}
              onPress={() => handleBarPress(i)}
            />
          </G>
        ))}

        {groupedData.map((d, i) => (
          <SvgText
            key={`x-label-${i}`}
            x={xScale(d.date.toString())! + barWidth / 2}
            y={chartHeight - PADDING.bottom + 15}
            fontSize={textTheme.small.fontSize}
            fill={axisTextColor}
            textAnchor="middle"
          >
            {formatXAxisLabel(d.date)}
          </SvgText>
        ))}

        {yTicks.map((tick, i) => (
          <SvgText
            key={`y-label-${i}`}
            x={PADDING.left - 5}
            y={yScale(tick)}
            fontSize={textTheme.small.fontSize}
            fill={axisTextColor}
            textAnchor="end"
            dy="0.3em"
          >
            {formatYAxisLabel(tick)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const summaryMetricSelectorStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    marginTop: "2%",
  },
  option: {
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: "1%",
    paddingHorizontal: "5%",
    borderRadius: 12,
    marginRight: 8,
  },
});

type SummaryMetricOptionProps = {
  name: string;
  isSelected: boolean;
  onSelect: () => void;
};

function SummaryMetricOption({
  name,
  isSelected,
  onSelect,
}: SummaryMetricOptionProps) {
  const accentColor = useThemeColoring("primaryAction");
  const backgroundInactiveColor = useThemeColoring("secondaryViewBackground");

  return (
    <TouchableOpacity
      style={[
        summaryMetricSelectorStyles.option,
        {
          backgroundColor: isSelected ? accentColor : backgroundInactiveColor,
        },
      ]}
      onPress={onSelect}
    >
      <Text sneutral>{name}</Text>
    </TouchableOpacity>
  );
}

type SummaryMetricSelectorProps = {
  selectedMetric: string;
  onSelectMetric: (metric: string) => void;
};

function SummaryMetricSelector({
  selectedMetric,
  onSelectMetric,
}: SummaryMetricSelectorProps) {
  return (
    <View style={summaryMetricSelectorStyles.container}>
      <SummaryMetricOption
        name="Volume"
        isSelected={selectedMetric === "Volume"}
        onSelect={() => onSelectMetric("Volume")}
      />
      <SummaryMetricOption
        name="Duration"
        isSelected={selectedMetric === "Duration"}
        onSelect={() => onSelectMetric("Duration")}
      />
    </View>
  );
}

const summaryTrendsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
});

function getSummaryDateRange(timeRange: string) {
  const endDate = new Date(truncTime(Date.now()));

  let adjustedEndDate;
  if (timeRange === "6w") {
    const daysToNextWeek = 7 - endDate.getDay();
    adjustedEndDate = new Date(addDays(endDate.valueOf(), daysToNextWeek));
  } else if (timeRange === "6m") {
    adjustedEndDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth() + 1,
      1
    );
  } else {
    const currentBiMonth = Math.floor(endDate.getMonth() / 2);
    adjustedEndDate = new Date(
      endDate.getFullYear(),
      (currentBiMonth + 1) * 2,
      1
    );
  }
  let startDate: number;

  switch (timeRange) {
    case "6m":
      startDate = new Date(
        adjustedEndDate.getFullYear(),
        adjustedEndDate.getMonth() - 6,
        1
      ).getTime();
      break;

    case "1y":
      startDate = new Date(
        adjustedEndDate.getFullYear() - 1,
        adjustedEndDate.getMonth(),
        1
      ).getTime();
      break;

    default:
      startDate = removeDays(adjustedEndDate.valueOf(), 42);
  }

  return { startDate: truncTime(startDate), endDate: endDate.valueOf() };
}

type SummaryBarChartSkeletonProps = {
  startDate: number;
  endDate: number;
  timeRange: string;
};

function SummaryBarChartSkeleton({
  startDate,
  endDate,
  timeRange,
}: SummaryBarChartSkeletonProps) {
  const { width, height } = useWindowDimensions();
  const accentColor = useThemeColoring("primaryAction");
  const gridColor = useThemeColoring("dynamicHeaderBorder");
  const axisTextColor = useThemeColoring("lightText");
  const fromBarColor = convertHexToRGBA(accentColor, 0.1);
  const toBarColor = convertHexToRGBA(accentColor, 0.3);

  const animationProgress = useSharedValue(0);
  const chartHeight = height * CHART_HEIGHT_MULTIPLIER;
  const chartWidth = width * CHART_WIDTH_MULTIPLIER;
  const numBars = 6;
  const barPadding = 0.2;
  const timeRangeDuration = endDate - startDate;
  const dateStep = timeRangeDuration / (numBars - 1);

  const skeletonData = Array.from({ length: numBars }, (_, i) => ({
    date: startDate + i * dateStep,
    value: 0, // Value will be ignored, we'll use height factors for visualization
  }));

  // Format date range text using the actual dates
  const dateRangeText = formatTitleDateRange(startDate, endDate);

  useEffect(() => {
    // Start the animation
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  // Animated props for SVG elements
  const animatedProps = useAnimatedProps(() => ({
    fill: interpolateColor(
      animationProgress.value,
      [0, 1],
      [fromBarColor, toBarColor]
    ),
  }));

  // Use D3 scales exactly like in SummaryBarChart
  const xScale = d3
    .scaleBand()
    .domain(skeletonData.map((d) => d.date.toString()))
    .range([PADDING.left, chartWidth - PADDING.right])
    .padding(barPadding);

  // Calculate a reasonable max value for the y-axis
  const yMax = 100000; // Some reasonable default max value
  const yScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([chartHeight - PADDING.bottom, PADDING.top]);

  // Create exactly 5 evenly spaced ticks starting at 0
  const tickStep = yMax / 4;
  const yTicks = [0, tickStep, tickStep * 2, tickStep * 3, tickStep * 4];

  // Get bar width from xScale bandwidth
  const barWidth = xScale.bandwidth();

  const getTimeRangeLabel = () => {
    return timeRangeOptions.find((o) => o.value === timeRange)!.label;
  };

  return (
    <View style={summaryBarChartStyles.container}>
      <View style={summaryBarChartStyles.header}>
        <View style={summaryBarChartStyles.headerRow}>
          <TextSkeleton text="100,000 lbs" />
          <TouchableOpacity
            style={summaryBarChartStyles.timeFilterButton}
            onPress={() => {}}
          >
            <Text
              style={[
                summaryBarChartStyles.timeFilterText,
                { color: accentColor },
              ]}
            >
              {getTimeRangeLabel()}
            </Text>
            <ChevronDown size={16} color={accentColor} />
          </TouchableOpacity>
        </View>

        <Text light sneutral>
          {dateRangeText}
        </Text>
      </View>

      <Svg width={chartWidth} height={chartHeight}>
        {/* Y-axis ticks */}
        {yTicks.map((tick, i) => (
          <G key={`y-tick-${i}`}>
            {/* Horizontal grid line */}
            <Line
              key={`grid-${i}`}
              x1={PADDING.left}
              x2={chartWidth - PADDING.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke={gridColor}
              strokeOpacity={0.5}
              strokeDasharray="3,3"
            />

            {/* Y-axis label as AnimatedRect skeleton */}
            <AnimatedRect
              x={PADDING.left - 45}
              y={yScale(tick) - 8}
              width={40}
              height={16}
              rx={2}
              animatedProps={animatedProps}
            />
          </G>
        ))}

        {/* Bottom axis line */}
        <Line
          x1={PADDING.left}
          x2={chartWidth - PADDING.right}
          y1={chartHeight - PADDING.bottom}
          y2={chartHeight - PADDING.bottom}
          stroke={gridColor}
          strokeWidth={1}
        />

        {/* Bar skeletons - with predictable height pattern */}
        {skeletonData.map((d, i) => {
          // Create a more realistic pattern for bar heights (tall, medium, short)
          const heightFactors = [0.7, 0.6, 0.4, 0.8, 0.5, 0.3];
          const maxBarHeight = chartHeight - PADDING.top - PADDING.bottom - 10;
          const barHeight = maxBarHeight * heightFactors[i];

          return (
            <G key={`bar-${i}`}>
              {/* Bar skeleton */}
              <AnimatedRect
                x={xScale(d.date.toString())}
                y={chartHeight - PADDING.bottom - barHeight}
                width={barWidth}
                height={barHeight}
                rx={4}
                animatedProps={animatedProps}
              />

              {/* X-axis label with real date */}
              <SvgText
                x={xScale(d.date.toString())! + barWidth / 2}
                y={chartHeight - PADDING.bottom + 15}
                fontSize={textTheme.small.fontSize}
                fill={axisTextColor}
                textAnchor="middle"
              >
                {formatXAxisLabel(d.date)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

export function SummaryTrends() {
  const [barChartData, setBarChartData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetricName, setSelectedMetricName] =
    useState<string>("Volume");
  const { trendsPeriodSelection } = usePopup();
  const { height } = useWindowDimensions();
  const metaIdToDifficultyType = useExercisesStore(
    useShallow((state) =>
      ExerciseStoreSelectors.getMetaIdToDifficultyType(state)
    )
  );

  const { startDate, endDate } = useMemo(() => {
    return getSummaryDateRange(trendsPeriodSelection.timeRange);
  }, [trendsPeriodSelection.timeRange]);

  const metric = useMemo(() => {
    return selectedMetricName === "Volume" ? volumeMetric : durationMetric;
  }, [selectedMetricName]);

  useFocusEffect(
    useCallback(() => {
      metric
        .generateData(startDate, addDays(endDate, 1), metaIdToDifficultyType)
        .then(setBarChartData)
        .catch((error) => console.error(error)) // we need to safely handl
        .finally(() => setIsLoading(false));
    }, [startDate, endDate, metric, metaIdToDifficultyType])
  );

  return (
    <View style={summaryTrendsStyles.container}>
      {isLoading ? (
        <SummaryBarChartSkeleton
          startDate={startDate}
          endDate={endDate}
          timeRange={trendsPeriodSelection.timeRange}
        />
      ) : (
        <SummaryBarChart
          data={barChartData}
          formatYAxisLabel={metric.formatYAxisLabel}
          formatTitleValue={metric.formatTitleValue}
          height={height * CHART_HEIGHT_MULTIPLIER}
          metricType={selectedMetricName}
          timeRange={trendsPeriodSelection.timeRange}
          defaultMaxYValue={
            selectedMetricName === "Volume" ? 10000 : 5 * 60 * 60 * 1000 // 5 hrs
          }
        />
      )}
      <SummaryMetricSelector
        selectedMetric={selectedMetricName}
        onSelectMetric={setSelectedMetricName}
      />
    </View>
  );
}
