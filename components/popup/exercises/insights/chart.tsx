import {
  CompletedExercise,
  DifficultyType,
  Metric,
  MetricPoint,
  MetricType,
} from "@/interface";
import { View, Text, useThemeColoring } from "@/components/Themed";
import Svg, { G, Line, Path, Circle, Text as SVGText } from "react-native-svg";
import { textTheme } from "@/constants/Themes";
import * as d3 from "d3";
import React, { useRef, useState } from "react";
import * as MetricApi from "@/api/metric";
import { ArrayUtils } from "@/util/misc";
import { addDays, getDaysBetween, getLongDateDisplay } from "@/util/date";
import {
  useWindowDimensions,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { StyleUtils } from "@/util/styles";
import * as Haptics from "expo-haptics";
import { getMockCompletions, MOCK_EXERCISE } from "@/api/exercise/mock";
import { getDifficultyType } from "@/api/exercise";
import { BlurView } from "expo-blur";
import { useUserDetails } from "@/components/user-details";
import {
  ScrollView,
} from "react-native-gesture-handler";

const TIME_STEP_DAYS = 7;
const DAY_WIDTH = 14;
const CHART_HEIGHT_MULTIPLIER = 0.45;
const MIN_CHART_WIDTH_MULTIPLER = 0.94;

const CHART_PLACEHOLDER_MESSAGE =
  "Log this exercise in a workout to chart your progress";

const CHART_MARGIN = {
  left: 0,
  top: 0,
  bottom: 30,
  right: 0,
};

const metricSelectionStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "center",
    flexWrap: "wrap",
  },
  item: {
    ...StyleUtils.flexRow(5),
    alignItems: "center",
  },
  drop: {
    height: 10,
    width: 10,
    borderRadius: 3,
  },
});

type MetricSelectionProps = {
  metricTypes: MetricType[];
  selectedMetricType: MetricType;
  onSelect: (metricType: MetricType) => void;
  metricTypeToColorMapping: { [index: string]: string };
};

function MetricSelection({
  metricTypes,
  selectedMetricType,
  onSelect,
  metricTypeToColorMapping,
}: MetricSelectionProps) {
  return (
    <View style={metricSelectionStyles.container}>
      {metricTypes.map((metricType, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onSelect(metricType)}
          style={[
            metricSelectionStyles.item,
            metricType !== selectedMetricType ? { opacity: 0.5 } : {},
          ]}
        >
          <View
            style={[
              metricSelectionStyles.drop,
              { backgroundColor: metricTypeToColorMapping[metricType] },
            ]}
          />
          <Text neutral>{metricType}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function generateXTicks(minDate: Date, maxDate: Date) {
  let ticks = [minDate];
  let currentTick = minDate.valueOf();
  while (currentTick < maxDate.valueOf()) {
    currentTick = addDays(currentTick, TIME_STEP_DAYS);
    ticks.push(new Date(currentTick));
  }
  return ticks;
}

const chartStyles = StyleSheet.create({
  yAxis: {
    position: "absolute",
    right: "2%",
  },
  scroll: {
    paddingLeft: "3%",
  },
  container: {
    paddingRight: "3%",
    paddingBottom: "3%",
    ...StyleUtils.flexColumn(10),
    flex: 1,
  },
  head: {
    ...StyleUtils.flexColumn(5),
    paddingLeft: "3%",
  },
});

type ChartProps = {
  completions: CompletedExercise[];
  type: DifficultyType;
};

function findMostRecentPointIndex(metric: Metric, date: Date) {
  if (date < new Date(metric.points[0].timestamp)) {
    return 0;
  }
  if (date > new Date(ArrayUtils.last(metric.points).timestamp)) {
    return metric.points.length - 1;
  }

  return ArrayUtils.last(
    metric.points
      .filter((point) => new Date(point.timestamp) <= date)
      .map((_, index) => index)
  );
}

function Chart({ completions, type }: ChartProps) {
  const [metricConfigIndex, setMetricConfigIndex] = useState<number>(0);
  const [yAxisOffset, setYAxisOffset] = useState<number>(0);
  const [pointIndex, setPointIndex] = useState<number>();
  const { userDetails } = useUserDetails();

  const scrollRef = useRef<ScrollView>(null);
  const hasInitiallyScrolledToEndRef = useRef<boolean>(false);

  const metricTypeToStrokeColor = {
    "Average Weight": useThemeColoring("weightLineStroke"),
    "Average Reps": useThemeColoring("repsLineStroke"),
    "Average Duration": useThemeColoring("durationLineStroke"),
    "Average Rest Duration": useThemeColoring("restDurationLineStroke"),
    "Estimated 1 Rep Max": useThemeColoring("oneRepEstimateLineStroke"),
  };

  const metricConfigs = MetricApi.getPossibleMetrics(
    type,
    userDetails?.bodyweight as number
  );
  const metric = MetricApi.computeMetric(
    completions,
    metricConfigs[metricConfigIndex]
  );

  const minDate = new Date(metric.points[0].timestamp);
  const maxDate = new Date(ArrayUtils.last(metric.points).timestamp);

  const { height, width } = useWindowDimensions();

  const dimensions = {
    width: Math.max(
      DAY_WIDTH * getDaysBetween(minDate.valueOf(), maxDate.valueOf()),
      MIN_CHART_WIDTH_MULTIPLER * width
    ),
    height: height * CHART_HEIGHT_MULTIPLIER,
  };

  const xTicks = generateXTicks(minDate, maxDate);

  const xScale = d3
    .scaleTime()
    .domain([xTicks[0], ArrayUtils.last(xTicks)])
    .range([CHART_MARGIN.left, dimensions.width - CHART_MARGIN.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, Math.ceil(metric.high * 1.25)])
    .range([dimensions.height - CHART_MARGIN.top, CHART_MARGIN.bottom]);

  const lineGenerator = d3
    .line<MetricPoint>()
    .x(({ timestamp }) => xScale(new Date(timestamp)))
    .y(({ value }) => yScale(value));

  const linePath = lineGenerator(metric.points);

  const outlineColor = useThemeColoring("lightText");
  const lightOutlineColor = useThemeColoring("dynamicHeaderBorder");

  const yTicks = yScale.ticks(5);

  const cursorPoint =
    metric.points[
      pointIndex && pointIndex < metric.points.length
        ? pointIndex
        : metric.points.length - 1
    ];

  return (
    <View style={chartStyles.container}>
      <View
        style={chartStyles.head}
        onLayout={(event) => {
          if (!yAxisOffset) {
            setYAxisOffset(event.nativeEvent.layout.height);
          }
        }}
      >
        <Text large>{metric.format(cursorPoint.value)}</Text>
        <Text neutral light>
          {getLongDateDisplay(cursorPoint.timestamp)}
        </Text>
      </View>
      <ScrollView
        horizontal
        ref={scrollRef}
        bounces={false}
        style={chartStyles.scroll}
        onContentSizeChange={() => {
          if (!hasInitiallyScrolledToEndRef.current) {
            hasInitiallyScrolledToEndRef.current = true;
            scrollRef.current?.scrollToEnd({ animated: false });
          }
        }}
      >
        <Pressable
          onPress={(event) => {
            const date = xScale.invert(event.nativeEvent.locationX);
            setPointIndex(findMostRecentPointIndex(metric, date));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <Svg width={dimensions.width} height={dimensions.height}>
            <G>
              <Path
                d={linePath ?? ""}
                fill="none"
                stroke={metricTypeToStrokeColor[metric.metricType]}
                strokeWidth={4}
              />
              <Line
                x1={dimensions.width - CHART_MARGIN.right}
                y1={dimensions.height - CHART_MARGIN.bottom}
                x2={CHART_MARGIN.left}
                y2={dimensions.height - CHART_MARGIN.bottom}
                stroke={outlineColor}
              />
              {xTicks.map((date, index) => (
                <SVGText
                  key={index}
                  x={xScale(date)}
                  y={dimensions.height - CHART_MARGIN.bottom + 15}
                  fontSize={textTheme.small.fontSize}
                  stroke={outlineColor}
                  textAnchor={"start"}
                >
                  {d3.timeFormat("%b %d")(date)}
                </SVGText>
              ))}
              {xTicks.slice(1, xTicks.length - 1).map((date, index) => (
                <Line
                  key={index}
                  x={xScale(date)}
                  y1={CHART_MARGIN.top}
                  y2={dimensions.height - CHART_MARGIN.bottom}
                  stroke={lightOutlineColor}
                  strokeDasharray="4,2"
                />
              ))}
              {yTicks.slice(1).map((tick, index) => (
                <Line
                  key={index}
                  x1={CHART_MARGIN.left}
                  x2={dimensions.width - CHART_MARGIN.right}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                  stroke={lightOutlineColor}
                  strokeDasharray="4,2"
                />
              ))}
              <Circle
                cx={xScale(new Date(cursorPoint.timestamp))}
                cy={yScale(cursorPoint.value)}
                r={7}
                fill={metricTypeToStrokeColor[metric.metricType]}
              />
            </G>
          </Svg>
        </Pressable>
      </ScrollView>
      <MetricSelection
        metricTypes={metricConfigs.map(({ metricType }) => metricType)}
        selectedMetricType={metricConfigs[metricConfigIndex].metricType}
        onSelect={(metricType: MetricType) => {
          setMetricConfigIndex(
            metricConfigs.findIndex(
              (config) => config.metricType === metricType
            )
          );
        }}
        metricTypeToColorMapping={metricTypeToStrokeColor}
      />
      {yAxisOffset != undefined
        ? yTicks.slice(1).map((tick, index) => (
            <View
              key={index}
              style={[chartStyles.yAxis, { top: yScale(tick) + yAxisOffset }]}
            >
              <Text small light>
                {metric.format(tick)}
              </Text>
            </View>
          ))
        : null}
    </View>
  );
}

const chartPlaceholderStyles = StyleSheet.create({
  placeholder: {
    width: "100%",
    height: "100%",
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  mock: {
    paddingVertical: "2%",
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

function ChartPlaceholder() {
  return (
    <View style={chartPlaceholderStyles.container}>
      <View style={chartPlaceholderStyles.mock}>
        <Chart
          completions={getMockCompletions(10)}
          type={getDifficultyType(MOCK_EXERCISE)}
        />
      </View>
      <BlurView
        style={chartPlaceholderStyles.placeholder}
        experimentalBlurMethod="dimezisBlurView"
      >
        <Text>{CHART_PLACEHOLDER_MESSAGE}</Text>
      </BlurView>
    </View>
  );
}

type ChartInsightsProps = ChartProps;

export function ChartInsight({ completions, type }: ChartInsightsProps) {
  if (completions.length === 0) {
    return <ChartPlaceholder />;
  }

  return <Chart completions={completions} type={type} />;
}
