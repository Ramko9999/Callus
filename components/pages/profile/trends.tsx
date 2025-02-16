import { StyleUtils } from "@/util/styles";
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  ViewabilityConfig,
} from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import {
  TrendingDown,
  TrendingNeutral,
  TrendingUp,
} from "@/components/theme/icons";
import Svg, {
  Line,
  Path,
  G,
  Text as SVGText,
  LinearGradient,
  Defs,
  Stop,
} from "react-native-svg";
import * as d3 from "d3";
import {
  addDays,
  getDaysBetween,
  getTrendDatePeriod,
  goBackMonths,
  truncTime,
} from "@/util/date";
import { textTheme } from "@/constants/Themes";
import { Pagination } from "@/components/util/pagination";
import { useCallback, useEffect, useState } from "react";
import { WorkoutApi } from "@/api/workout";
import * as TrendsApi from "@/api/metric/trend";
import { Trend, MetricPoint } from "@/interface";
import { ArrayUtils } from "@/util/misc";
import { getMockCompletions, MOCK_EXERCISE } from "@/api/exercise/mock";
import { getDifficultyType } from "@/api/exercise";
import { BlurView } from "expo-blur";

const TREND_CHART_MARGIN = {
  top: 20,
  bottom: 30,
  right: 20,
};

const TREND_CHART_HEIGHT = 150;

const MONTHS_TO_LOOKBACK = 3;

const TRENDS_GAP = 10;

const TREND_CHART_WIDTH_MULTIPLER = 0.9;
const TREND_ITEM_WIDTH_MULTIPLIER = 0.96;
const TREND_PLACEHOLDER_MESSAGE =
  "You need to log exercises at least 4 times in the span of 2 weeks to view your trends.";

const trendDeltaStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(5),
    alignItems: "baseline",
  },
  slope: {
    marginBottom: 5,
    alignSelf: "flex-end",
  },
});

type TrendDeltaProps = {
  delta: number;
  format: (delta: number) => string;
  hasImproved: boolean;
};

function TrendDelta({ delta, format, hasImproved }: TrendDeltaProps) {
  const improvementColor = useThemeColoring("improvement");
  const degradationColor = useThemeColoring("degradation");
  const maintainColor = useThemeColoring("lightText");

  const color =
    delta === 0
      ? maintainColor
      : hasImproved
      ? improvementColor
      : degradationColor;
  const deltaSign = delta !== 0 ? (delta > 0 ? "+" : "-") : "";

  return (
    <View style={trendDeltaStyles.container}>
      <View style={trendDeltaStyles.slope}>
        {delta === 0 ? (
          <TrendingNeutral color={maintainColor} />
        ) : delta > 0 ? (
          <TrendingUp color={improvementColor} />
        ) : (
          <TrendingDown color={degradationColor} />
        )}
      </View>
      <Text action style={{ color }}>
        {deltaSign}
        {format(Math.abs(delta))}
      </Text>
    </View>
  );
}

const trendChartStyles = StyleSheet.create({
  container: {
    borderRadius: 10,
  },
  content: {
    marginLeft: "4%",
    marginVertical: "2%",
    ...StyleUtils.flexColumn(),
  },
  scalar: {
    ...StyleUtils.flexRow(5),
    alignItems: "baseline",
  },
  delta: {
    ...StyleUtils.flexRow(5),
  },
});

export type TrendChartProps = {
  width: number;
  height: number;
  trend: Trend;
};

export function TrendChart({ width, height, trend }: TrendChartProps) {
  const dimensions = { width, height };
  const { title, metric } = trend;
  const { points, high, format, delta, hasImproved } = metric;

  const minDate = new Date(points[0].timestamp);
  const maxDate = new Date(ArrayUtils.last(points).timestamp);

  const xScale = d3
    .scaleTime()
    .domain([minDate, maxDate])
    .range([0, dimensions.width - TREND_CHART_MARGIN.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, high])
    .range([
      dimensions.height - TREND_CHART_MARGIN.top,
      TREND_CHART_MARGIN.bottom,
    ]);

  const lineGenerator = d3
    .line<MetricPoint>()
    .x((d) => xScale(new Date(d.timestamp)))
    .y((d) => yScale(d.value));

  const areaGenerator = d3
    .area<MetricPoint>()
    .x((d) => xScale(new Date(d.timestamp)))
    .y0((d) => dimensions.height - TREND_CHART_MARGIN.bottom)
    .y1((d) => yScale(d.value));

  const linePath = lineGenerator(points);
  const areaPath = areaGenerator(points);

  const lineStrokeColor = useThemeColoring("primaryAction");
  const textColor = useThemeColoring("lightText");

  const midpointX = new Date(
    addDays(
      minDate.valueOf(),
      Math.ceil(getDaysBetween(minDate.valueOf(), maxDate.valueOf()) / 2)
    )
  );
  const xTicks = [minDate, midpointX, maxDate];

  return (
    <View background style={trendChartStyles.container}>
      <View style={trendChartStyles.content}>
        <Text neutral light>
          {title}
        </Text>
        <View style={trendChartStyles.scalar}>
          <Text stat>{format(ArrayUtils.last(points).value)}</Text>
          <TrendDelta delta={delta} format={format} hasImproved={hasImproved} />
          <Text action>in {getTrendDatePeriod(minDate, maxDate)}</Text>
        </View>
        <Svg width={dimensions.width} height={dimensions.height}>
          <Defs>
            <LinearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
              <Stop offset="100%" stopColor={lineStrokeColor} stopOpacity={0} />
              <Stop offset="0%" stopColor={lineStrokeColor} stopOpacity={0.3} />
            </LinearGradient>
          </Defs>
          <G>
            <Path
              d={linePath ?? ""}
              fill="none"
              stroke={lineStrokeColor}
              strokeWidth={4}
            />
            <Path d={areaPath ?? ""} fill="url(#gradient)" stroke="none" />
            <Line
              x1={dimensions.width - TREND_CHART_MARGIN.right}
              y1={dimensions.height - TREND_CHART_MARGIN.bottom}
              x2={0}
              y2={dimensions.height - TREND_CHART_MARGIN.bottom}
              stroke={textColor}
            />
            {xTicks.map((date, index) => (
              <SVGText
                key={index}
                x={xScale(date)}
                y={dimensions.height - TREND_CHART_MARGIN.bottom + 15}
                fontSize={textTheme.small.fontSize}
                stroke={textColor}
                textAnchor={
                  index === 0 ? "start" : index === 2 ? "end" : "middle"
                }
              >
                {d3.timeFormat("%b %d")(date)}
              </SVGText>
            ))}
          </G>
        </Svg>
      </View>
    </View>
  );
}

const trendsPlaceholderStyles = StyleSheet.create({
  placeholder: {
    width: "100%",
    height: "100%",
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    borderRadius: 10,
    paddingHorizontal: "3%",
  },
  container: {
    borderRadius: 10,
    overflow: "hidden",
  },
});

function TrendsPlaceholder() {
  const { width } = useWindowDimensions();
  return (
    <View style={trendsPlaceholderStyles.container}>
      <TrendChart
        width={width * TREND_CHART_WIDTH_MULTIPLER}
        height={TREND_CHART_HEIGHT}
        trend={TrendsApi.generateTrend(
          { completions: getMockCompletions(20), name: MOCK_EXERCISE },
          getDifficultyType(MOCK_EXERCISE)
        )}
      />
      <BlurView
        style={trendsPlaceholderStyles.placeholder}
        experimentalBlurMethod="dimezisBlurView"
      >
        <Text>{TREND_PLACEHOLDER_MESSAGE}</Text>
      </BlurView>
    </View>
  );
}

const trendsCarouselStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
  },
  pagination: {
    alignItems: "center",
  },
});

type TrendsCarouselProps = {
  trends: Trend[];
};

function TrendsCarousel({ trends }: TrendsCarouselProps) {
  const [paginationIndex, setPaginationIndex] = useState(0);
  const { width } = useWindowDimensions();

  const viewabilityConfig: ViewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setPaginationIndex(viewableItems[0].index);
    }
  }, []);

  const trendItemWidth = TREND_ITEM_WIDTH_MULTIPLIER * width;

  return (
    <View style={trendsCarouselStyles.container}>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        data={(trends || []).map(
          (trend) =>
            ({
              height: TREND_CHART_HEIGHT,
              width: width * TREND_CHART_WIDTH_MULTIPLER,
              trend,
            } as TrendChartProps)
        )}
        contentContainerStyle={{ gap: TRENDS_GAP }}
        snapToInterval={trendItemWidth + TRENDS_GAP}
        decelerationRate="fast"
        snapToAlignment="start"
        renderItem={({ item, index }) => (
          <View key={index} style={{ width: trendItemWidth }}>
            <TrendChart {...item} />
          </View>
        )}
      />
      <View style={trendsCarouselStyles.pagination}>
        <Pagination
          totalItemsCount={trends?.length || 0}
          currentIndex={paginationIndex}
        />
      </View>
    </View>
  );
}

const trendsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
  },
});

export function Trends() {
  const [trends, setTrends] = useState<Trend[]>();

  useEffect(() => {
    WorkoutApi.getTrends(
      goBackMonths(truncTime(Date.now()), MONTHS_TO_LOOKBACK)
    )
      .then(setTrends)
      .catch((error) => {
        console.error(error.stack);
      });
  }, []);

  const shouldShowPlaceholder = trends && trends.length === 0;

  return (
    <View style={trendsStyles.container}>
      <Text action>Trends</Text>
      {shouldShowPlaceholder ? (
        <TrendsPlaceholder />
      ) : (
        <TrendsCarousel trends={trends ?? []} />
      )}
    </View>
  );
}
