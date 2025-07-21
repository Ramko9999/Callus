import React from "react";
import {
  CompletedExercise,
  DifficultyType,
  Set,
  WeightDifficulty,
  BodyWeightDifficulty,
  TimeDifficulty,
} from "@/interface";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { ArrayUtils } from "@/util/misc";
import { getDurationDisplay, getLongDateDisplay, truncTime } from "@/util/date";
import { StyleSheet, FlatList } from "react-native";
import { StyleUtils } from "@/util/styles";
import { convertHexToRGBA, tintColor } from "@/util/color";
import { getToplineMetric } from "@/api/metric";
import { Trophy } from "lucide-react-native";
import { TextSkeleton } from "@/components/util/loading";

type SetSummary = {
  sets: number;
  weight?: number;
  reps?: number;
  duration?: number;
  averageRest: number | undefined;
  isPR?: boolean;
};

type HistoryLineItem = {
  day: number;
  summaries: SetSummary[];
  notes: string[];
  hasPR: boolean;
};

function computeSummaries(
  completions: CompletedExercise[],
  type: DifficultyType,
  prSet?: Set
): SetSummary[] {
  let difficultyToAggregate = [];
  if (
    type === DifficultyType.WEIGHT ||
    type === DifficultyType.WEIGHTED_BODYWEIGHT
  ) {
    difficultyToAggregate = ["weight", "reps"];
  } else if (type === DifficultyType.BODYWEIGHT) {
    difficultyToAggregate = ["reps"];
  } else {
    difficultyToAggregate = ["duration"];
  }

  const difficultyExtractor = ({ difficulty }: Set) => {
    const diff = difficulty as
      | WeightDifficulty
      | BodyWeightDifficulty
      | TimeDifficulty;
    return difficultyToAggregate
      .map((difficultyMeta) => {
        const value = diff[
          difficultyMeta as keyof (
            | WeightDifficulty
            | BodyWeightDifficulty
            | TimeDifficulty
          )
        ] as number | undefined;
        return value !== undefined ? value.toString() : "";
      })
      .join("-");
  };

  const getAverageRest = (sets: Set[]): number | undefined => {
    const setsWithRest = sets.filter(
      ({ restStartedAt, restEndedAt }) =>
        restStartedAt != undefined && restEndedAt != undefined
    );
    if (setsWithRest.length === 0) {
      return undefined;
    }
    const totalRest = ArrayUtils.sumBy(
      setsWithRest,
      ({ restStartedAt, restEndedAt }) =>
        (restEndedAt as number) - (restStartedAt as number)
    );
    return Math.ceil(totalRest / setsWithRest.length);
  };

  const summaries = ArrayUtils.groupBy(
    completions.flatMap(({ sets }) => sets),
    difficultyExtractor
  ).map(({ items: commonSets }) => {
    const setSummary: Partial<SetSummary> = {
      sets: commonSets.length,
      averageRest: undefined,
    };

    difficultyToAggregate.forEach((difficultyMeta) => {
      const diff = commonSets[0].difficulty as
        | WeightDifficulty
        | BodyWeightDifficulty
        | TimeDifficulty;
      const value = diff[difficultyMeta as keyof typeof diff];
      if (value !== undefined) {
        if (
          difficultyMeta === "weight" ||
          difficultyMeta === "reps" ||
          difficultyMeta === "duration"
        ) {
          setSummary[difficultyMeta] = value as number;
        }
      }
    });

    const restAverage = getAverageRest(commonSets);
    if (restAverage !== undefined) {
      setSummary.averageRest = restAverage;
    }

    // If we have a PR set, check if this summary matches its difficulty
    if (prSet) {
      const prDiff = difficultyExtractor(prSet);
      const summaryDiff = difficultyExtractor(commonSets[0]);
      setSummary.isPR = prDiff === summaryDiff;
    }

    return setSummary as SetSummary;
  });

  return summaries;
}

function computeHistory(
  completions: CompletedExercise[],
  type: DifficultyType
): HistoryLineItem[] {
  let currentPR = 0;
  const historySummaries = ArrayUtils.sortBy(
    ArrayUtils.groupBy(completions, ({ workoutStartedAt }) =>
      truncTime(workoutStartedAt)
    ),
    ({ key: day }) => day
  ).map(({ key: day, items: dayCompletions }): HistoryLineItem => {
    const notes = dayCompletions
      .filter(({ note }) => note != undefined)
      .map(({ note }) => note as string);

    // Find the best set for this day
    const metricConfig = getToplineMetric(type);
    let hasPR = false;
    let prSet: Set | undefined = undefined;

    dayCompletions.forEach((completion) => {
      const result = metricConfig.metricGeneration(completion);
      if (result && result.metric > currentPR) {
        currentPR = result.metric;
        hasPR = true;
        if (result.bestSetId) {
          // Find the actual set with this ID
          const matchingSet = completion.sets.find(
            (set) => set.id === result.bestSetId
          );
          if (matchingSet) {
            prSet = matchingSet;
          }
        }
      }
    });

    const summaries = computeSummaries(dayCompletions, type, prSet);
    return { day, notes, summaries, hasPR };
  });

  return ArrayUtils.sortBy(historySummaries, ({ day }) => -day);
}

type SetSummaryProps = SetSummary & {
  isPR?: boolean;
};

function SetSummaryDisplay({
  sets,
  weight,
  reps,
  duration,
  averageRest,
  isPR,
}: SetSummaryProps) {
  const accentColor = useThemeColoring("primaryAction");

  return (
    <Text light>
      <Text style={isPR ? { color: accentColor } : undefined}>
        {`${sets} sets`}
      </Text>
      {weight && (
        <>
          {" "}
          of{" "}
          <Text
            style={isPR ? { color: accentColor } : undefined}
          >{`${weight} lbs`}</Text>
        </>
      )}
      {reps && (
        <>
          {" "}
          for{" "}
          <Text
            style={isPR ? { color: accentColor } : undefined}
          >{`${reps} reps`}</Text>
        </>
      )}
      {duration && (
        <>
          {" "}
          for{" "}
          <Text
            style={isPR ? { color: accentColor } : undefined}
          >{`${getDurationDisplay(duration)}`}</Text>
        </>
      )}
      {averageRest && (
        <>
          {" "}
          with{" "}
          <Text style={isPR ? { color: accentColor } : undefined}>
            {getDurationDisplay(Math.floor(averageRest / 1000))}
          </Text>{" "}
          rest
        </>
      )}
    </Text>
  );
}

const historyItemStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    marginBottom: 15,
    padding: "3%",
    borderRadius: 5,
  },
  content: {
    ...StyleUtils.flexColumn(5),
  },
  note: {
    marginBottom: 5,
  },
  header: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3%",
  },
});

type HistoryItemProps = HistoryLineItem;

function HistoryItem({ day, summaries, notes, hasPR }: HistoryItemProps) {
  const bgColor = tintColor(useThemeColoring("appBackground"), 0.05);
  const accentColor = useThemeColoring("primaryAction");
  const fillColor = convertHexToRGBA(useThemeColoring("primaryAction"), 0.3);
  const prBgColor = convertHexToRGBA(useThemeColoring("primaryAction"), 0.1);

  return (
    <View
      style={[
        historyItemStyles.container,
        { backgroundColor: hasPR ? prBgColor : bgColor },
      ]}
    >
      <View style={historyItemStyles.header}>
        <Text light>{getLongDateDisplay(day)}</Text>
        {hasPR && (
          <Trophy
            size={18}
            color={accentColor}
            fill={fillColor}
            strokeWidth={2}
          />
        )}
      </View>
      {notes.length > 0 && (
        <Text light italic style={historyItemStyles.note}>
          {notes.join(". ")}
        </Text>
      )}
      <View style={[historyItemStyles.content]}>
        {summaries.map((summary, index) => (
          <SetSummaryDisplay key={index} {...summary} />
        ))}
      </View>
    </View>
  );
}


function HistoryItemSkeleton() {
  const bgColor = tintColor(useThemeColoring("appBackground"), 0.05);

  return (
    <View style={[historyItemStyles.container, { backgroundColor: bgColor }]}>
      <View style={historyItemStyles.header}>
        <TextSkeleton text="Monday, January 1" />
      </View>
      <View style={[historyItemStyles.content]}>
        <TextSkeleton text="3 sets of 225 lbs for 5 reps with 2 min rest" />
        <TextSkeleton text="3 sets of 135 lbs for 12 reps with 1 min rest" />
      </View>
    </View>
  );
}

const historyStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
    paddingTop: "4%",
    flex: 1,
  },
  list: {
    paddingHorizontal: "3%",
  },
  contentContainer: {
    paddingBottom: "20%",
  },
  emptyContainer: {
    ...StyleUtils.flexColumnCenterAll(),
    flex: 1,
  },
});

type HistoryProps = {
  completions: CompletedExercise[];
  difficultyType: DifficultyType;
  isLoading: boolean;
  name: string;
};

export function History({ completions, difficultyType, isLoading, name }: HistoryProps) {
  const historyItems = computeHistory(completions, difficultyType);

  const renderItem = ({ item }: { item: HistoryLineItem }) => (
    <HistoryItem {...item} />
  );

  const renderSkeletonItem = ({ index }: { index: number }) => (
    <HistoryItemSkeleton key={index} />
  );

  return (
    <View style={historyStyles.container}>
      {isLoading ? (
        <FlatList
          data={[...Array(10)]}
          renderItem={renderSkeletonItem}
          keyExtractor={(_, index) => `skeleton-${index}`}
          showsVerticalScrollIndicator={false}
          style={historyStyles.list}
          contentContainerStyle={historyStyles.contentContainer}
        />
      ) : completions.length === 0 ? (
        <View style={historyStyles.emptyContainer}>
          <Text light>No history found</Text>
        </View>
      ) : (
        <FlatList
          data={historyItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.day.toString()}
          showsVerticalScrollIndicator={false}
          style={historyStyles.list}
          contentContainerStyle={historyStyles.contentContainer}
        />
      )}
    </View>
  );
}
