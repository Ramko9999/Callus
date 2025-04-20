import { View, Text } from "@/components/Themed";
import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { useEffect, useState } from "react";
import {
  BodyWeightDifficulty,
  CompletedExercise,
  DifficultyType,
  TimeDifficulty,
  WeightDifficulty,
} from "@/interface";
import { WorkoutApi } from "@/api/workout";
import {
  DurationMetaIcon,
  RepsMetaIcon,
  WeightMetaIcon,
} from "@/components/theme/icons";
import { ArrayUtils } from "@/util/misc";
import { TabsNavigation } from "@/components/util/tabs-navigation";
import { ChartInsight } from "./chart";
import { HistoryInsight } from "./history";
import { getDifficultyType } from "@/api/exercise";
import { FullBottomSheet } from "@/components/util/popup/sheet/full";

type InsightTab = "History" | "Chart";
const INSIGHT_TABS = ["History", "Chart"] as InsightTab[];

function aggregateWeight(
  type: DifficultyType,
  completions: CompletedExercise[]
) {
  return ArrayUtils.sumBy(completions, (completion) => {
    return ArrayUtils.sumBy(completion.sets, ({ difficulty }) => {
      const { weight, reps } = difficulty as WeightDifficulty;
      return (
        (type === DifficultyType.WEIGHT
          ? weight
          : weight + completion.bodyweight) * reps
      );
    });
  });
}

function aggregateReps(completions: CompletedExercise[]) {
  return ArrayUtils.sumBy(
    completions.flatMap(({ sets }) => sets),
    ({ difficulty }) => (difficulty as BodyWeightDifficulty).reps
  );
}

function aggregateDuration(completions: CompletedExercise[]) {
  return ArrayUtils.sumBy(
    completions.flatMap(({ sets }) => sets),
    ({ difficulty }) => (difficulty as TimeDifficulty).duration
  );
}

function aggregateSets(completions: CompletedExercise[]) {
  return completions.flatMap(({ sets }) => sets).length;
}

const exerciseInsightsLifetimeSummaryStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    paddingTop: "1%",
  },
});

type ExerciseInsightsLifetimeSummaryProps = {
  completions: CompletedExercise[];
  type: DifficultyType;
};

function ExerciseInsightsLifetimeSummary({
  completions,
  type,
}: ExerciseInsightsLifetimeSummaryProps) {
  const hasWeightMeta =
    type === DifficultyType.WEIGHT ||
    type === DifficultyType.WEIGHTED_BODYWEIGHT;
  const hasDurationMeta = type === DifficultyType.TIME;
  const hasRepsMeta =
    type === DifficultyType.WEIGHT ||
    type === DifficultyType.WEIGHTED_BODYWEIGHT ||
    type === DifficultyType.BODYWEIGHT;

  return (
    <View style={exerciseInsightsLifetimeSummaryStyles.container}>
      {hasWeightMeta && (
        <WeightMetaIcon weight={aggregateWeight(type, completions)} />
      )}
      {hasDurationMeta && (
        <DurationMetaIcon
          durationInMillis={aggregateDuration(completions) * 1000}
        />
      )}
      {hasRepsMeta && <RepsMetaIcon reps={aggregateReps(completions)} />}
      <Text light>{`${aggregateSets(completions)} sets`}</Text>
    </View>
  );
}

const exerciseInsightStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "2%",
  },
});

type ExerciseInsightProps = {
  completions: CompletedExercise[];
  type: DifficultyType;
  currentTab: InsightTab;
};

function ExerciseInsight({
  completions,
  type,
  currentTab,
}: ExerciseInsightProps) {
  return (
    <View style={exerciseInsightStyles.container}>
      {currentTab === "History" ? (
        <HistoryInsight completions={completions} type={type} />
      ) : (
        <ChartInsight completions={completions} type={type} />
      )}
    </View>
  );
}

const exerciseInsightsStyles = StyleSheet.create({
  head: {
    ...StyleUtils.flexColumn(5),
    paddingHorizontal: "3%",
  },
  container: {
    ...StyleUtils.flexColumn(5),
    flex: 1,
  },
});

type ExerciseInsightsProps = {
  exerciseName: string;
};

export function ExerciseInsights({ exerciseName }: ExerciseInsightsProps) {
  const [insightsTab, setInsightsTab] = useState<InsightTab>(INSIGHT_TABS[0]);
  const [allCompletions, setAllCompletions] = useState<CompletedExercise[]>();

  useEffect(() => {
    WorkoutApi.getExerciseCompletions(exerciseName).then(setAllCompletions);
  }, []);

  return (
    <View background style={exerciseInsightsStyles.container}>
      <View style={exerciseInsightsStyles.head}>
        <Text extraLarge>{exerciseName}</Text>
        <ExerciseInsightsLifetimeSummary
          completions={allCompletions ?? []}
          type={getDifficultyType(exerciseName)}
        />
        <TabsNavigation
          selectedTab={insightsTab}
          tabs={INSIGHT_TABS}
          onSelect={(tab) => setInsightsTab(tab as InsightTab)}
        />
      </View>
      <ExerciseInsight
        type={getDifficultyType(exerciseName)}
        currentTab={insightsTab}
        completions={allCompletions ?? []}
      />
    </View>
  );
}

type ExerciseInsightsSheetProps = {
  show: boolean;
  hide: () => void;
  exerciseName: string;
};

export function ExerciseInsightsSheet({
  show,
  hide,
  exerciseName,
}: ExerciseInsightsSheetProps) {
  return (
    <FullBottomSheet show={show} onHide={hide}>
      <ExerciseInsights exerciseName={exerciseName} />
    </FullBottomSheet>
  );
}
