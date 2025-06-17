import { View, Text, useThemeColoring } from "@/components/Themed";
import {
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { StyleUtils } from "@/util/styles";
import {
  getExerciseDemonstration,
  NAME_TO_EXERCISE_META,
  getDifficultyType,
} from "@/api/exercise";
import { convertHexToRGBA, tintColor } from "@/util/color";
import { CompletedExercise, DifficultyType, ExerciseMeta } from "@/interface";
import { Clock, Dumbbell, Trophy } from "lucide-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TextSkeleton } from "@/components/util/loading";

type OverviewProps = {
  name: string;
  completions: CompletedExercise[];
  isLoading: boolean;
};

type ExerciseStats = {
  totalSets: number;
  totalVolume: number;
  totalReps: number;
  totalDuration: number;
};

function aggregateExerciseStats(
  completions: CompletedExercise[],
  meta: ExerciseMeta
): ExerciseStats {
  const stats: ExerciseStats = {
    totalSets: 0,
    totalVolume: 0,
    totalReps: 0,
    totalDuration: 0,
  };

  stats.totalSets = completions.reduce(
    (total, exercise) => total + exercise.sets.length,
    0
  );

  completions.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      if (
        meta.difficultyType === DifficultyType.WEIGHT ||
        meta.difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT
      ) {
        const { weight, reps } = set.difficulty as {
          weight: number;
          reps: number;
        };
        stats.totalVolume += weight * reps;
        stats.totalReps += reps;
      } else if (meta.difficultyType === DifficultyType.BODYWEIGHT) {
        const { reps } = set.difficulty as { reps: number };
        stats.totalReps += reps;
      } else if (meta.difficultyType === DifficultyType.TIME) {
        const { duration } = set.difficulty as { duration: number };
        stats.totalDuration += duration;
      }
    });
  });

  return stats;
}

function formatVolume(volume: number): string {
  if (volume >= 10000000) {
    // 10M or more
    return `${Math.floor(volume / 1000000)}m`;
  } else if (volume >= 1000000) {
    // 1M to 9.9M
    return `${(volume / 1000000).toFixed(1)}m`;
  } else if (volume >= 10000) {
    // 10k or more
    return `${Math.floor(volume / 1000)}k`;
  }
  return volume.toString();
}

const lifetimeSummaryStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    padding: "5%",
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
  },
});

type LifetimeSummaryStatProps = {
  value: string;
  label: string;
  icon: React.ReactNode;
  isLoading: boolean;
};

function LifetimeSummaryStat({
  value,
  label,
  icon,
  isLoading,
}: LifetimeSummaryStatProps) {
  const accentColor = convertHexToRGBA(useThemeColoring("primaryAction"), 0.1);

  return (
    <View
      style={[
        lifetimeSummaryStyles.container,
        { backgroundColor: accentColor },
      ]}
    >
      {icon}
      {isLoading ? (
        <TextSkeleton text={value} style={lifetimeSummaryStyles.value} />
      ) : (
        <Text style={lifetimeSummaryStyles.value}>{value}</Text>
      )}
      <Text light style={lifetimeSummaryStyles.label}>
        {label}
      </Text>
    </View>
  );
}

const musclePillStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
  },
  pillsRow: {
    ...StyleUtils.flexRow(10),
    paddingVertical: "2%",
    alignItems: "center",
    flexWrap: "wrap",
  },
  groupLabel: {
    marginBottom: 5,
  },
  pill: {
    paddingHorizontal: "4%",
    paddingVertical: "2%",
    borderRadius: 10,
    ...StyleUtils.flexRowCenterAll(),
  },
});

type MusclePillsProps = {
  primaryMuscles: string[];
  secondaryMuscles: string[];
};

function MusclePills({ primaryMuscles, secondaryMuscles }: MusclePillsProps) {
  const pillColor = tintColor(useThemeColoring("appBackground"), 0.05);

  return (
    <View style={musclePillStyles.container}>
      <View>
        <Text light style={musclePillStyles.groupLabel}>
          Primary Muscles
        </Text>
        <View style={musclePillStyles.pillsRow}>
          {primaryMuscles.map((muscle) => (
            <View
              key={muscle}
              style={[musclePillStyles.pill, { backgroundColor: pillColor }]}
            >
              <Text sneutral>{muscle}</Text>
            </View>
          ))}
        </View>
      </View>

      {secondaryMuscles.length > 0 && (
        <View>
          <Text light style={musclePillStyles.groupLabel}>
            Secondary Muscles
          </Text>
          <View style={musclePillStyles.pillsRow}>
            {secondaryMuscles.map((muscle) => (
              <View
                key={muscle}
                style={[musclePillStyles.pill, { backgroundColor: pillColor }]}
              >
                <Text sneutral>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const prExplanationStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(20),
    padding: "5%",
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    flex: 1,
  },
  iconContainer: {
    marginTop: 2,
  },
});

function PRExplanation({ name }: { name: string }) {
  const type = getDifficultyType(name);
  const accentColor = convertHexToRGBA(useThemeColoring("primaryAction"), 0.1);
  const iconColor = useThemeColoring("primaryAction");
  const iconFill = convertHexToRGBA(iconColor, 0.3);

  let explanation = "";
  switch (type) {
    case DifficultyType.WEIGHT:
    case DifficultyType.WEIGHTED_BODYWEIGHT:
      explanation =
        "PRs for this exercise are determined by the estimated 1-REP maximum.";
      break;
    case DifficultyType.BODYWEIGHT:
      explanation =
        "PRs for this exercise are determined by the average number of reps completed per set across a workout.";
      break;
    case DifficultyType.TIME:
      explanation =
        "PRs for this exercise are determined by the average duration of hold time per set across a workout.";
      break;
    default:
      explanation = "";
  }

  if (!explanation) return null;

  return (
    <View
      style={[prExplanationStyles.container, { backgroundColor: accentColor }]}
    >
      <View style={prExplanationStyles.iconContainer}>
        <Trophy size={20} color={iconColor} fill={iconFill} />
      </View>
      <Text light style={prExplanationStyles.text}>
        {explanation}
      </Text>
    </View>
  );
}

const overviewStyles = StyleSheet.create({
  container: {
    padding: "3%",
  },
  contentContainer: {
    ...StyleUtils.flexColumn(20),
    paddingBottom: "30%",
  },
  imageContainer: {
    borderRadius: 10,
    padding: "5%",
    alignItems: "center",
  },
  statsContainer: {
    ...StyleUtils.flexRow(15),
    justifyContent: "space-around",
  },
});

export function Overview({ name, completions, isLoading }: OverviewProps) {
  const { height } = useWindowDimensions();
  const demonstration = getExerciseDemonstration(name);
  const meta = NAME_TO_EXERCISE_META.get(name) as ExerciseMeta;
  const imageBackgroundColor = tintColor(
    useThemeColoring("appBackground"),
    0.05
  );
  const accentColor = useThemeColoring("primaryAction");

  const stats = aggregateExerciseStats(completions, meta);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={overviewStyles.container}
      contentContainerStyle={overviewStyles.contentContainer}
    >
      <View
        style={[
          overviewStyles.imageContainer,
          { backgroundColor: imageBackgroundColor },
        ]}
      >
        {demonstration && (
          <Image
            source={demonstration}
            style={{ height: height * 0.3 }}
            resizeMode="contain"
          />
        )}
      </View>
      <Text light>{meta.description}</Text>

      <View style={overviewStyles.statsContainer}>
        <LifetimeSummaryStat
          value={`${stats.totalSets}`}
          label="Total Sets"
          icon={<Dumbbell size={20} color={accentColor} />}
          isLoading={isLoading}
        />

        {(meta.difficultyType === DifficultyType.WEIGHT ||
          meta.difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) && (
          <LifetimeSummaryStat
            value={`${formatVolume(stats.totalVolume)} lbs`}
            label="Total Volume"
            icon={
              <MaterialCommunityIcons
                name="weight"
                size={20}
                color={accentColor}
              />
            }
            isLoading={isLoading}
          />
        )}

        {(meta.difficultyType === DifficultyType.BODYWEIGHT ||
          meta.difficultyType === DifficultyType.WEIGHT ||
          meta.difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) && (
          <LifetimeSummaryStat
            value={`${stats.totalReps}`}
            label="Total Reps"
            icon={
              <MaterialCommunityIcons
                name="arm-flex"
                size={20}
                color={accentColor}
              />
            }
            isLoading={isLoading}
          />
        )}

        {meta.difficultyType === DifficultyType.TIME && (
          <LifetimeSummaryStat
            value={`${Math.round(stats.totalDuration / 60)}m`}
            label="Total Time"
            icon={<Clock size={20} color={accentColor} />}
            isLoading={isLoading}
          />
        )}
      </View>

      <PRExplanation name={name} />

      <MusclePills
        primaryMuscles={meta.primaryMuscles}
        secondaryMuscles={meta.secondaryMuscles}
      />
    </ScrollView>
  );
}
