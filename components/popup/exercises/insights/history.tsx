import { CompletedExercise, DifficultyType, Set } from "@/interface";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { ArrayUtils } from "@/util/misc";
import { getDurationDisplay, getLongDateDisplay, truncTime } from "@/util/date";
import { ScrollView, StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { useRef } from "react";
import { getMockCompletions, MOCK_EXERCISE } from "@/api/exercise/mock";
import { getDifficultyType } from "@/api/exercise";
import { BlurView } from "expo-blur";

const HISTORY_PLACEHOLDER_MESSAGE =
  "Log this exercise in a workout to view your history";

type SetSummary = {
  sets: number;
  weight?: number;
  reps?: number;
  duration?: number;
  averageRest?: number;
};

type HistoryLineItem = {
  day: number;
  summaries: SetSummary[];
  notes: string[];
};

// todo: unify with what we have in WorkoutContext
function getSetSummaryDisplay({
  weight,
  reps,
  duration,
  averageRest,
  sets,
}: SetSummary) {
  const display = [`${sets} sets`];

  if (weight) {
    display.push(`of ${weight} lbs`);
  }
  if (reps) {
    display.push(`for ${reps} reps`);
  }
  if (duration) {
    display.push(`for ${getDurationDisplay(duration)}`);
  }
  if (averageRest) {
    display.push(
      `with ${getDurationDisplay(Math.floor(averageRest / 1000))} of rest`
    );
  }
  return display.join(" ");
}

const historyItemStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
  },
  content: {
    paddingLeft: "2%",
    borderLeftWidth: 1,
    ...StyleUtils.flexColumn(5),
  },
});

type HistoryItemProps = HistoryLineItem;

function HistoryItem({ day, summaries, notes }: HistoryItemProps) {
  return (
    <View style={historyItemStyles.container}>
      <Text action>{getLongDateDisplay(day)}</Text>
      <View
        style={[
          historyItemStyles.content,
          { borderColor: useThemeColoring("primaryText") },
        ]}
      >
        {summaries.map((summary, index) => (
          <Text key={index} light>
            {getSetSummaryDisplay(summary)}
          </Text>
        ))}
        {notes.length > 0 && (
          <Text light italic>
            {notes.join(". ")}
          </Text>
        )}
      </View>
    </View>
  );
}

function computeSummaries(
  completions: CompletedExercise[],
  type: DifficultyType
) {
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
    return (
      difficultyToAggregate
        // @ts-ignore
        .map((difficultyMeta) => difficulty[difficultyMeta])
        .join("-")
    );
  };

  const getAverageRest = (sets: Set[]) => {
    const setsWithRest = sets.filter(
      ({ restStartedAt, restEndedAt }) =>
        restStartedAt != undefined && restEndedAt != undefined
    );
    if (setsWithRest.length === 0) {
      return;
    }
    return Math.ceil(
      ArrayUtils.sumBy(
        setsWithRest,
        ({ restStartedAt, restEndedAt }) =>
          (restEndedAt as number) - (restStartedAt as number)
      ) / setsWithRest.length
    );
  };

  return ArrayUtils.groupBy(
    completions.flatMap(({ sets }) => sets),
    difficultyExtractor
  ).map(({ items: commonSets }) => {
    let setSummary: any = {};
    difficultyToAggregate.forEach(
      (difficultyMeta: string) =>
        // @ts-ignore
        (setSummary[difficultyMeta] = commonSets[0].difficulty[difficultyMeta])
    );
    setSummary.averageRest = getAverageRest(commonSets);
    setSummary.sets = commonSets.length;
    return setSummary as SetSummary;
  });
}

function computeHistory(
  completions: CompletedExercise[],
  type: DifficultyType
): HistoryLineItem[] {
  const historySummaries = ArrayUtils.groupBy(
    completions,
    ({ workoutStartedAt }) => truncTime(workoutStartedAt)
  ).map(({ key: day, items: completions }) => {
    const notes = completions
      .filter(({ note }) => note != undefined)
      .map(({ note }) => note as string);
    const summaries = computeSummaries(completions, type);
    return { day, notes, summaries };
  });

  return ArrayUtils.sortBy(historySummaries, ({ day }) => day);
}

const historyStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(30),
    paddingBottom: "3%",
    paddingHorizontal: "3%",
  },
  scroll: {
    flex: 1,
  },
});

type HistoryProps = {
  completions: CompletedExercise[];
  type: DifficultyType;
};

function History({ completions, type }: HistoryProps) {
  const scrollRef = useRef<ScrollView>(null);
  const hasInitiallyScrolledToEndRef = useRef<boolean>(false);

  return (
    <ScrollView ref={scrollRef} style={historyStyles.scroll}>
      <View
        style={historyStyles.container}
        onLayout={() => {
          if (!hasInitiallyScrolledToEndRef.current) {
            hasInitiallyScrolledToEndRef.current = true;
            scrollRef.current?.scrollToEnd({ animated: false });
          }
        }}
      >
        {computeHistory(completions, type).map((item, index) => (
          <HistoryItem key={index} {...item} />
        ))}
      </View>
    </ScrollView>
  );
}

const historyPlaceholderStyles = StyleSheet.create({
  placeholder: {
    width: "100%",
    height: "100%",
    ...StyleUtils.flexRow(),
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  mock: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

function HistoryPlaceholder() {
  return (
    <View style={historyPlaceholderStyles.container}>
      <View style={historyPlaceholderStyles.mock}>
        <History
          completions={getMockCompletions(10)}
          type={getDifficultyType(MOCK_EXERCISE)}
        />
      </View>
      <BlurView style={historyPlaceholderStyles.placeholder}>
        <Text>{HISTORY_PLACEHOLDER_MESSAGE}</Text>
      </BlurView>
    </View>
  );
}

type HistoryInsightProps = HistoryProps;

export function HistoryInsight({ completions, type }: HistoryInsightProps) {
  if (completions.length === 0) {
    return <HistoryPlaceholder />;
  }
  return <History completions={completions} type={type} />;
}
