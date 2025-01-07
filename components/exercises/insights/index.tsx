import { View, Text } from "../../Themed";
import { StyleSheet, useWindowDimensions } from "react-native";
import { BottomSheet } from "../../util/popup/sheet";
import { StyleUtils, EXERCISE_INSIGHTS_HEIGHT } from "@/util/styles";
import { Close } from "../../theme/actions";
import { useEffect, useState } from "react";
import {
  BodyWeightDifficulty,
  DifficultyType,
  Exercise,
  Set as ISet,
  TimeDifficulty,
  WeightDifficulty,
} from "@/interface";
import { WorkoutApi } from "@/api/workout";
import { BW } from "@/constants";
import {
  DurationMetaIconProps,
  RepsMetaIcon,
  WeightMetaIcon,
} from "../../theme/icons";
import { ArrayUtils } from "@/util/misc";
import { TabsNavigation } from "../../util/tabs-navigation";
import { ChartInsight } from "./chart";
import { HistoryInsight } from "./history";
import { getDifficultyType } from "@/api/exercise";
import { useTabBar } from "@/components/util/tab-bar/context";

type InsightTab = "History" | "Chart";
const INSIGHT_TABS = ["History", "Chart"] as InsightTab[];

const exerciseInsightsHeaderStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
  },
});

type ExerciseInsightsHeaderProps = {
  onClose: () => void;
};

function ExerciseInsightsHeader({ onClose }: ExerciseInsightsHeaderProps) {
  return (
    <View style={exerciseInsightsHeaderStyles.container}>
      <Close onClick={onClose} />
    </View>
  );
}

function aggregateWeight(type: DifficultyType, sets: ISet[], bw: number) {
  return ArrayUtils.sumBy(
    sets,
    ({ difficulty }) =>
      (difficulty as WeightDifficulty).weight +
      (type === DifficultyType.WEIGHTED_BODYWEIGHT ? bw : 0)
  );
}

const exerciseInsightsLifetimeSummaryStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    paddingTop: "1%",
  },
});

type ExerciseInsightsLifetimeSummaryProps = {
  completions: Exercise[];
  type: DifficultyType;
};

function ExerciseInsightsLifetimeSummary({
  completions,
  type,
}: ExerciseInsightsLifetimeSummaryProps) {
  const allSets = completions.flatMap(({ sets }) => sets);

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
        <WeightMetaIcon weight={aggregateWeight(type, allSets, BW)} />
      )}
      {hasDurationMeta && (
        <DurationMetaIconProps
          durationInMillis={ArrayUtils.sumBy(
            allSets,
            ({ difficulty }) => (difficulty as TimeDifficulty).duration * 1000
          )}
        />
      )}
      {hasRepsMeta && (
        <RepsMetaIcon
          reps={ArrayUtils.sumBy(
            allSets,
            ({ difficulty }) => (difficulty as BodyWeightDifficulty).reps
          )}
        />
      )}
      <Text light>{`${allSets.length} sets`}</Text>
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
  completions: Exercise[];
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
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
  },
  head: {
    ...StyleUtils.flexColumn(5),
    paddingHorizontal: "3%",
  },
  content: {
    ...StyleUtils.flexColumn(5),
    flex: 1,
  },
});

type ExerciseInsightsProps = {
  onClose: () => void;
  exerciseName: string;
};

// todo: add a default when there aren't any sets logged
export function ExerciseInsights({
  onClose,
  exerciseName,
}: ExerciseInsightsProps) {
  const [insightsTab, setInsightsTab] = useState<InsightTab>(INSIGHT_TABS[0]);
  const [allCompletions, setAllCompletions] = useState<Exercise[]>();

  useEffect(() => {
    WorkoutApi.getExerciseCompletions(exerciseName).then(setAllCompletions);
  }, []);

  const { height } = useWindowDimensions();
  return (
    <View
      background
      style={[
        exerciseInsightsStyles.container,
        { height: height * EXERCISE_INSIGHTS_HEIGHT },
      ]}
    >
      <ExerciseInsightsHeader onClose={onClose} />
      <View style={exerciseInsightsStyles.content}>
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
    </View>
  );
}

type ExerciseInsightsPopupProps = {
  show: boolean;
  hide: () => void;
  exerciseName: string;
};

export function ExerciseInsightsPopup({
  show,
  hide,
  exerciseName,
}: ExerciseInsightsPopupProps) {
  const tabBarActions = useTabBar();

  useEffect(() => {
    if (show) {
      tabBarActions.close();
    } else {
      tabBarActions.open();
    }
  }, [show]);

  return (
    <BottomSheet show={show} hide={hide} onBackdropPress={hide}>
      <ExerciseInsights onClose={hide} exerciseName={exerciseName} />
    </BottomSheet>
  );
}
