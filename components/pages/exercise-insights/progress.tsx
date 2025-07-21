import {
  CompletedExercise,
  Metric,
  MetricPoint,
  MetricConfig,
} from "@/interface";
import { View, Text, useThemeColoring } from "@/components/Themed";
import Svg, { G, Line, Path, Circle, Text as SVGText } from "react-native-svg";
import * as d3 from "d3";
import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import * as MetricApi from "@/api/metric";
import { ArrayUtils } from "@/util/misc";
import {
  addDays,
  getLongDateDisplay,
  removeDays,
  truncTime,
} from "@/util/date";
import {
  useWindowDimensions,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  GestureResponderEvent,
} from "react-native";
import { StyleUtils } from "@/util/styles";
import * as Haptics from "expo-haptics";
import { ScrollView } from "react-native-gesture-handler";
import { tintColor, convertHexToRGBA } from "@/util/color";
import { ChevronDown } from "lucide-react-native";
import {
  useSharedValue,
  withRepeat,
  withTiming,
  interpolateColor,
  useAnimatedProps,
  interpolate,
  Easing,
  SharedValue,
} from "react-native-reanimated";
import { TextSkeleton } from "@/components/util/loading";
import Animated from "react-native-reanimated";
import { svgPathProperties } from "svg-path-properties";
import { SheetError } from "@/components/sheets/common";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const POINTS_TO_SHOW_IN_CHART_WIDTH = 7;

const CHART_HEIGHT_MULTIPLIER = 0.5;
const MIN_CHART_WIDTH_MULTIPLER = 0.94;

const CHART_MARGIN = {
  left: 0,
  top: 0,
  bottom: 30,
  right: 0,
};

type XTick = {
  show: boolean;
  date: Date;
};

type TimeGroupOption = "1w" | "2w" | "1m";

function getMonthlyTicks(
  endTimestamp: number,
  startTimestamp?: number
): XTick[] {
  const ticks: XTick[] = [];

  let currentDate = new Date(endTimestamp);

  if (currentDate.getDate() !== 1) {
    ticks.push({
      show: false,
      date: new Date(endTimestamp),
    });
  }

  currentDate.setDate(1);

  const pointStartTime = new Date(
    truncTime(
      startTimestamp != undefined ? startTimestamp : currentDate.valueOf()
    )
  );
  pointStartTime.setDate(1);

  const minStartTime = new Date(currentDate.valueOf());
  minStartTime.setMonth(currentDate.getMonth() - POINTS_TO_SHOW_IN_CHART_WIDTH);

  const startTime = Math.min(
    pointStartTime!.valueOf(),
    minStartTime!.valueOf()
  );

  while (currentDate.valueOf() >= startTime) {
    ticks.push({
      show: true,
      date: new Date(currentDate.valueOf()),
    });
    currentDate.setMonth(currentDate.getMonth() - 1);
  }

  return ticks;
}

function generateXTicks(points: MetricPoint[], timeGroup: TimeGroupOption) {
  const minimumSteps = POINTS_TO_SHOW_IN_CHART_WIDTH;
  const endDate = new Date();

  // Special handling for monthly ticks
  if (timeGroup === "1m") {
    return getMonthlyTicks(
      truncTime(endDate.valueOf()),
      points.length > 0 ? points[0].timestamp : undefined
    ).reverse();
  }

  const step = timeGroup === "1w" ? 7 : 14;
  const minStartTime = removeDays(
    truncTime(endDate.valueOf()),
    step * minimumSteps
  );

  // Use earliest data point if it exists and is before minStartDate
  const startTime =
    points?.length > 0
      ? Math.min(points[0].timestamp, minStartTime)
      : minStartTime;

  let currentTime = endDate.valueOf();
  const ticks: XTick[] = [
    {
      show: true,
      date: new Date(currentTime),
    },
  ];

  while (currentTime >= startTime) {
    currentTime = removeDays(currentTime, step);
    ticks.push({
      show: true,
      date: new Date(currentTime),
    });
  }

  return ticks.reverse();
}

type XAxisMeta = {
  minDate: Date;
  maxDate: Date;
  xTicks: XTick[];
};

function getChartXAxisMeta(
  points: MetricPoint[],
  timeGroup: TimeGroupOption
): XAxisMeta {
  const xTicks = generateXTicks(points, timeGroup);

  const daysToAdd = timeGroup === "1m" ? 30 : timeGroup === "2w" ? 14 : 7;
  const minDate = new Date(removeDays(xTicks[0].date.valueOf(), daysToAdd / 2));
  const maxDate = new Date(
    addDays(ArrayUtils.last(xTicks).date.valueOf(), daysToAdd)
  );

  return { minDate, maxDate, xTicks };
}

function findMostRecentPointIndex(metric: Metric, date: Date) {
  const targetTime = date.getTime();

  return metric.points.reduce((closestIndex, point, currentIndex) => {
    const currentDiff = Math.abs(point.timestamp - targetTime);
    const closestDiff = Math.abs(
      metric.points[closestIndex].timestamp - targetTime
    );

    return currentDiff < closestDiff ? currentIndex : closestIndex;
  }, 0);
}

type AnimatedChartLineProps = {
  d: string;
  fill?: string;
  stroke: string;
  strokeWidth?: number;
  pointSelectionProgress: SharedValue<number>;
  hiddenChartStroke: SharedValue<boolean>;
};

function AnimatedChartLine({
  d,
  fill = "none",
  stroke,
  strokeWidth = 4,
  pointSelectionProgress,
  hiddenChartStroke,
}: AnimatedChartLineProps) {
  const length = useSharedValue(0);
  const progress = useSharedValue(0);
  const darkenColor = convertHexToRGBA(stroke, 0.5);

  useEffect(() => {
    progress.value = 0;
    const properties = new svgPathProperties(d);
    const pathLength = properties.getTotalLength();
    length.value = pathLength;
    progress.value = withTiming(1, {
      duration: 1000,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [d]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: [length.value, length.value],
    strokeDashoffset: hiddenChartStroke.value
      ? length.value
      : interpolate(progress.value, [0, 1], [length.value, 0]),
    stroke: hiddenChartStroke.value
      ? "transparent"
      : interpolateColor(
          pointSelectionProgress.value,
          [0, 1],
          [stroke, darkenColor]
        ),
  }));

  return (
    <AnimatedPath
      d={d}
      fill={fill}
      strokeWidth={strokeWidth}
      animatedProps={animatedProps}
    />
  );
}

const timeGroupPillsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: "2%",
    paddingTop: "3%",
    paddingHorizontal: "3%",
  },
  pill: {
    paddingHorizontal: "4%",
    paddingVertical: "2%",
    borderRadius: "20%",
  },
});

type TimeGroupPillsProps = {
  selectedGroup: TimeGroupOption;
  onSelectGroup: (group: TimeGroupOption) => void;
  color: string;
};

function TimeGroupPills({
  selectedGroup,
  onSelectGroup,
  color,
}: TimeGroupPillsProps) {
  const primaryText = useThemeColoring("primaryText");

  const handlePress = (
    event: GestureResponderEvent,
    group: TimeGroupOption
  ) => {
    event.stopPropagation();
    onSelectGroup(group);
  };

  return (
    <View style={timeGroupPillsStyles.container}>
      <TouchableOpacity
        style={[
          timeGroupPillsStyles.pill,
          selectedGroup === "1w" && { backgroundColor: color },
        ]}
        onPress={(event) => handlePress(event, "1w")}
      >
        <Text
          sneutral
          style={[{ color: selectedGroup === "1w" ? primaryText : color }]}
        >
          1W
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          timeGroupPillsStyles.pill,
          selectedGroup === "2w" && { backgroundColor: color },
        ]}
        onPress={(event) => handlePress(event, "2w")}
      >
        <Text
          sneutral
          style={[{ color: selectedGroup === "2w" ? primaryText : color }]}
        >
          2W
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          timeGroupPillsStyles.pill,
          selectedGroup === "1m" && { backgroundColor: color },
        ]}
        onPress={(event) => handlePress(event, "1m")}
      >
        <Text
          sneutral
          style={[{ color: selectedGroup === "1m" ? primaryText : color }]}
        >
          1M
        </Text>
      </TouchableOpacity>
    </View>
  );
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
    padding: "3%",
    height: "100%",
    ...StyleUtils.flexColumn(10),
  },
  head: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingLeft: "2%",
  },
  metricSelector: {
    ...StyleUtils.flexRow(5),
    alignItems: "center",
  },
  cursor: {
    ...StyleUtils.flexColumn(5),
  },
});

type ChartProps = {
  name: string;
  completions: CompletedExercise[];
  selectedMetricConfig: MetricConfig;
  showMetricSheet: () => void;
};

// todo: looking to why the scrollview has bit of extra padding on the bottom
function Chart({
  name,
  completions,
  selectedMetricConfig,
  showMetricSheet,
}: ChartProps) {
  const [yAxisOffset, setYAxisOffset] = useState<number>();
  const [pointIndex, setPointIndex] = useState<number>();
  const [timeGroup, setTimeGroup] = useState<TimeGroupOption>("1w");
  const pointSelectionProgress = useSharedValue(0);

  const hiddenChartStroke = useSharedValue(true);

  const { width, height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const hasScrolledToEndRef = useRef(false);

  const outlineColor = useThemeColoring("lightText");
  const gridColor = tintColor(useThemeColoring("appBackground"), 0.15);
  const xAxisColor = tintColor(useThemeColoring("appBackground"), 0.2);
  const accentColor = selectedMetricConfig.color;

  const metric = useMemo(() => {
    return MetricApi.computeMetric(completions, selectedMetricConfig);
  }, [completions, selectedMetricConfig]);

  const { points } = metric;

  useEffect(() => {
    pointSelectionProgress.value = withTiming(pointIndex != undefined ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [pointIndex]);

  const { minDate, maxDate, xTicks } = useMemo(() => {
    return getChartXAxisMeta(points, timeGroup);
  }, [points, timeGroup]);

  const dimensions = {
    width:
      (width * MIN_CHART_WIDTH_MULTIPLER * xTicks.length) /
      POINTS_TO_SHOW_IN_CHART_WIDTH,
    height: height * CHART_HEIGHT_MULTIPLIER,
  };

  const xScale = d3
    .scaleTime()
    .domain([minDate, maxDate])
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

  const yTicks = yScale.ticks(5);

  const hasData = metric.points.length > 0;

  const cursorPoint = hasData
    ? metric.points[
        pointIndex != undefined ? pointIndex : metric.points.length - 1
      ]
    : undefined;

  const revealChart = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (!hasScrolledToEndRef.current) {
            hasScrolledToEndRef.current = true;
            scrollRef.current?.scrollToEnd({ animated: false });
            hiddenChartStroke.value = false;
          }
        }, 300); // 150ms debounce delay
      };
    })(),
    []
  );

  return (
    <Pressable
      onPress={() => {
        setPointIndex(undefined);
      }}
    >
      <View style={chartStyles.container}>
        <View
          style={chartStyles.head}
          onLayout={(event) => {
            if (!yAxisOffset) {
              setYAxisOffset(event.nativeEvent.layout.height);
            }
          }}
        >
          <View style={chartStyles.cursor}>
            {hasData ? (
              <>
                <Text action>{metric.format(cursorPoint?.value ?? 0)}</Text>
                <Text neutral light>
                  {getLongDateDisplay(cursorPoint?.timestamp ?? Date.now())}
                </Text>
              </>
            ) : (
              <>
                <TextSkeleton
                  text="100 lbs"
                  color={accentColor}
                  style={{ fontSize: 18, fontWeight: "bold" }}
                />
                <TextSkeleton
                  text="January 1st, 2024"
                  color={accentColor}
                  style={{ fontSize: 14, opacity: 0.7 }}
                />
              </>
            )}
          </View>
          <TouchableOpacity
            style={chartStyles.metricSelector}
            onPress={(event) => {
              event.stopPropagation();
              showMetricSheet();
            }}
          >
            <Text style={{ color: accentColor }}>
              {selectedMetricConfig.metricType}
            </Text>
            <ChevronDown size={16} color={accentColor} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          ref={scrollRef}
          bounces={false}
          style={chartStyles.scroll}
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={revealChart}
        >
          <Svg
            onPress={(event) => {
              event.stopPropagation();
              const date = xScale.invert(event.nativeEvent.locationX);
              setPointIndex(findMostRecentPointIndex(metric, date));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            width={dimensions.width}
            height={dimensions.height}
          >
            <G>
              <Line
                x1={dimensions.width - CHART_MARGIN.right}
                y1={dimensions.height - CHART_MARGIN.bottom}
                x2={CHART_MARGIN.left}
                y2={dimensions.height - CHART_MARGIN.bottom}
                stroke={xAxisColor}
              />
              {xTicks
                .filter(({ show }) => show)
                .map(({ date }, index) => (
                  <SVGText
                    key={index}
                    x={xScale(date)}
                    y={dimensions.height - CHART_MARGIN.bottom + 15}
                    fontSize={12}
                    fontWeight="100"
                    stroke={outlineColor}
                    textAnchor={"start"}
                  >
                    {d3.timeFormat("%m/%d")(date)}
                  </SVGText>
                ))}
              {xTicks
                .filter(({ show }) => show)
                .map(({ date }, index) => (
                  <Line
                    key={index}
                    x={xScale(date)}
                    y1={CHART_MARGIN.top}
                    y2={dimensions.height - CHART_MARGIN.bottom}
                    stroke={gridColor}
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
                  stroke={gridColor}
                  strokeDasharray="4,2"
                />
              ))}
              <AnimatedChartLine
                d={linePath ?? ""}
                stroke={accentColor}
                strokeWidth={4}
                pointSelectionProgress={pointSelectionProgress}
                hiddenChartStroke={hiddenChartStroke}
              />
              {pointIndex !== undefined && cursorPoint !== undefined && (
                <Line
                  x1={xScale(new Date(cursorPoint.timestamp))}
                  y1={dimensions.height - CHART_MARGIN.bottom}
                  x2={xScale(new Date(cursorPoint.timestamp))}
                  y2={yScale(cursorPoint.value)}
                  stroke={accentColor}
                  strokeDasharray="4,4"
                  strokeWidth={2}
                />
              )}
              {cursorPoint !== undefined && (
                <Circle
                  cx={xScale(new Date(cursorPoint.timestamp))}
                  cy={yScale(cursorPoint.value)}
                  r={7}
                  fill={accentColor}
                />
              )}
            </G>
          </Svg>
        </ScrollView>
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

        {!hasData ? (
          <SheetError text="There is no data to chart for this exercise." />
        ) : (
          <TimeGroupPills
            selectedGroup={timeGroup}
            onSelectGroup={(group) => {
              if (timeGroup !== group) {
                hiddenChartStroke.value = true;
                setPointIndex(undefined);
                hasScrolledToEndRef.current = false;
                setTimeGroup(group);
                revealChart();
              }
            }}
            color={selectedMetricConfig.color}
          />
        )}
        <View style={{ flex: 5 }} />
      </View>
    </Pressable>
  );
}

function ChartSkeleton() {
  const { width, height } = useWindowDimensions();

  const accentColor = useThemeColoring("primaryAction");
  const gridColor = tintColor(useThemeColoring("appBackground"), 0.15);
  const xAxisColor = tintColor(useThemeColoring("appBackground"), 0.2);
  const outlineColor = useThemeColoring("lightText");
  const [yAxisOffset, setYAxisOffset] = useState<number>(0);

  const fromLineColor = convertHexToRGBA(accentColor, 0.1);
  const toLineColor = convertHexToRGBA(accentColor, 0.3);

  const animationProgress = useSharedValue(0);
  const scrollRef = useRef<ScrollView>(null);
  const hasScrolledToEndRef = useRef(false);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  // Generate mock data points for the skeleton
  const mockPoints = useMemo(() => {
    const points = [];
    const now = new Date();

    for (let i = 0; i < POINTS_TO_SHOW_IN_CHART_WIDTH; i++) {
      points.push({
        timestamp: removeDays(now.valueOf(), i * 7),
        value: Math.random() * 80 + 20, // Random value for skeleton visualization
      });
    }
    return points.reverse();
  }, []);

  const xTicks = generateXTicks(mockPoints, "1w");

  const { minDate, maxDate, dimensions } = useMemo(() => {
    const maxDate = addDays(ArrayUtils.last(xTicks).date.valueOf(), 7);
    const minDate = removeDays(xTicks[0].date.valueOf(), 3);

    return {
      minDate,
      maxDate,
      dimensions: {
        width:
          (width * MIN_CHART_WIDTH_MULTIPLER * xTicks.length) /
          POINTS_TO_SHOW_IN_CHART_WIDTH,
        height: height * CHART_HEIGHT_MULTIPLIER,
      },
    };
  }, [xTicks, width, height]);

  const xScale = d3
    .scaleTime()
    .domain([minDate, maxDate])
    .range([CHART_MARGIN.left, dimensions.width - CHART_MARGIN.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([dimensions.height - CHART_MARGIN.top, CHART_MARGIN.bottom]);

  const lineGenerator = d3
    .line<{ timestamp: number; value: number }>()
    .x(({ timestamp }) => xScale(new Date(timestamp)))
    .y(({ value }) => yScale(value));

  const linePath = lineGenerator(mockPoints);

  const animatedLineProps = useAnimatedProps(() => ({
    stroke: interpolateColor(
      animationProgress.value,
      [0, 1],
      [fromLineColor, toLineColor]
    ),
  }));

  const yTicks = yScale.ticks(5);

  const debouncedContentSizeChange = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return (w: number, h: number) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (!hasScrolledToEndRef.current) {
            hasScrolledToEndRef.current = true;
            scrollRef.current?.scrollToEnd({ animated: false });
          }
        }, 150); // 150ms debounce delay
      };
    })(),
    []
  );

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
        <View>
          <TextSkeleton
            text="100 lbs"
            style={{ fontSize: 18, fontWeight: "bold" }}
          />
          <TextSkeleton
            text="January 1st, 2024"
            style={{ fontSize: 14, opacity: 0.7 }}
          />
        </View>
        <TouchableOpacity style={chartStyles.metricSelector}>
          <TextSkeleton text="The Metric Type" />
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        bounces={false}
        style={chartStyles.scroll}
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={debouncedContentSizeChange}
      >
        <Svg width={dimensions.width} height={dimensions.height}>
          <G>
            <Line
              x1={dimensions.width - CHART_MARGIN.right}
              y1={dimensions.height - CHART_MARGIN.bottom}
              x2={CHART_MARGIN.left}
              y2={dimensions.height - CHART_MARGIN.bottom}
              stroke={xAxisColor}
            />
            {xTicks
              .filter(({ show }) => show)
              .map(({ date }, index) => (
                <SVGText
                  key={index}
                  x={xScale(date)}
                  y={dimensions.height - CHART_MARGIN.bottom + 15}
                  fontSize={12}
                  fontWeight="100"
                  stroke={outlineColor}
                  textAnchor={"start"}
                >
                  {d3.timeFormat("%m/%d")(date)}
                </SVGText>
              ))}
            <AnimatedPath
              d={linePath ?? ""}
              strokeWidth={4}
              stroke={fromLineColor}
              animatedProps={animatedLineProps}
            />
            <Circle
              cx={xScale(new Date(ArrayUtils.last(mockPoints).timestamp))}
              cy={yScale(ArrayUtils.last(mockPoints).value)}
              r={7}
              fill={fromLineColor}
            />
            {xTicks
              .filter(({ show }) => show)
              .map(({ date }, index) => (
                <Line
                  key={index}
                  x={xScale(date)}
                  y1={CHART_MARGIN.top}
                  y2={dimensions.height - CHART_MARGIN.bottom}
                  stroke={gridColor}
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
                stroke={gridColor}
                strokeDasharray="4,2"
              />
            ))}
          </G>
        </Svg>
      </ScrollView>
      {yTicks.slice(1).map((tick, index) => (
        <View
          key={index}
          style={[chartStyles.yAxis, { top: yScale(tick) + yAxisOffset }]}
        >
          <TextSkeleton
            text={`${tick} lbs`}
            style={{ fontSize: 12, opacity: 0.7 }}
          />
        </View>
      ))}
    </View>
  );
}

type ProgressProps = {
  name: string;
  completions: CompletedExercise[];
  isLoading: boolean;
  selectedMetricConfig?: MetricConfig;
  showMetricSheet: () => void;
};

export function Progress({
  name,
  completions,
  isLoading,
  selectedMetricConfig,
  showMetricSheet,
}: ProgressProps) {
  if (isLoading || !selectedMetricConfig) {
    return <ChartSkeleton />;
  }

  return (
    <Chart
      name={name}
      completions={completions}
      selectedMetricConfig={selectedMetricConfig}
      showMetricSheet={showMetricSheet}
    />
  );
}
