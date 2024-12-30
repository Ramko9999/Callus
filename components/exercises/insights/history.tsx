import { DifficultyType, Exercise, Set } from "@/interface";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { ArrayUtils } from "@/util/misc";
import { getDurationDisplay, getLongDateDisplay, truncTime } from "@/util/date";
import { ScrollView, StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { useRef } from "react";

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
    paddingBottom: "3%",
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

function computeSummaries(completions: Exercise[], type: DifficultyType) {
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
    setSummary.averageRest = Math.ceil(
      ArrayUtils.sumBy(
        commonSets,
        ({ restStartedAt, restEndedAt }) =>
          (restEndedAt as number) - (restStartedAt as number)
      ) / commonSets.length
    );
    setSummary.sets = commonSets.length;
    return setSummary as SetSummary;
  });
}

// todo: consider whether we should use set startedAt or restEndedAt for determining when a exercise was begun
function computeHistory(
  completions: Exercise[],
  type: DifficultyType
): HistoryLineItem[] {
  return ArrayUtils.groupBy(completions, ({ sets }) =>
    truncTime(sets[0].restEndedAt as number)
  ).map(({ key: day, items: completions }) => {
    const notes = completions
      .filter(({ note }) => note != undefined)
      .map(({ note }) => note as string);
    const summaries = computeSummaries(completions, type);
    return { day, notes, summaries };
  });
}

const historyInsightStyles = StyleSheet.create({
  container: {
    paddingHorizontal: "3%",
  },
  scroll: {
    flex: 1,
  },
});

type HistoryInsightProps = {
  completions: Exercise[];
  type: DifficultyType;
};

export function HistoryInsight({ completions, type }: HistoryInsightProps) {
  const scrollRef = useRef<ScrollView>(null);
  const hasInitiallyScrolledToEndRef = useRef<boolean>(false);

  return (
    <ScrollView
      ref={scrollRef}
      style={historyInsightStyles.scroll}
      contentContainerStyle={historyInsightStyles.container}
      onContentSizeChange={(w, h) => {
        if (h > 0 && !hasInitiallyScrolledToEndRef.current) {
          hasInitiallyScrolledToEndRef.current = true;
          scrollRef.current?.scrollToEnd({ animated: false });
        }
      }}
    >
      <View>
        {computeHistory(completions, type).map((item, index) => (
          <HistoryItem key={index} {...item} />
        ))}
      </View>
    </ScrollView>
  );
}
