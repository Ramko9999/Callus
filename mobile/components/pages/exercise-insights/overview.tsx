import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleSheet, useWindowDimensions, ScrollView } from "react-native";
import { StyleUtils } from "@/util/styles";
import { convertHexToRGBA, tintColor } from "@/util/color";
import { CompletedExercise, DifficultyType, ExerciseMeta } from "@/interface";
import { Clock, Dumbbell, Trophy } from "lucide-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TextSkeleton } from "@/components/util/loading";
import { ExerciseImage } from "@/components/exercise/image";
import { MuscleDistinction } from "@/components/heatmap";

type ExerciseStats = {
  totalSets: number;
  totalVolume: number;
  totalReps: number;
  totalDuration: number;
};

function aggregateExerciseStats(
  completions: CompletedExercise[],
  difficultyType: DifficultyType
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
        difficultyType === DifficultyType.WEIGHT ||
        difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT
      ) {
        const { weight, reps } = set.difficulty as {
          weight: number;
          reps: number;
        };
        stats.totalVolume += weight * reps;
        stats.totalReps += reps;
      } else if (difficultyType === DifficultyType.BODYWEIGHT) {
        const { reps } = set.difficulty as { reps: number };
        stats.totalReps += reps;
      } else if (difficultyType === DifficultyType.TIME) {
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

const muscleIconStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(8),
    alignItems: "center",
  },
  icon: {
    borderRadius: "50%",
    padding: "8%",
    borderWidth: 1,
    overflow: "hidden",
    ...StyleUtils.flexRowCenterAll(),
  },
});

const musclePillStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(12),
    paddingHorizontal: "2%",
  },
  headerText: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  musclesContainer: {
    ...StyleUtils.flexRow(12),
    flexWrap: "wrap",
    gap: 12,
    marginTop: "2%",
    paddingHorizontal: "1%",
  },
});

type MuscleIconProps = {
  muscle: string;
  size: number;
};

function MuscleIcon({ muscle, size }: MuscleIconProps) {
  const iconContainerColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const iconContainerBorderColor = convertHexToRGBA(
    useThemeColoring("lightText"),
    0.12
  );

  return (
    <View style={muscleIconStyles.container}>
      <View
        style={[
          muscleIconStyles.icon,
          {
            backgroundColor: iconContainerColor,
            borderColor: iconContainerBorderColor,
            width: size,
            height: size,
          },
        ]}
      >
        <MuscleDistinction size={44} muscle={muscle} intensity={1} />
      </View>
      <Text light small style={{ fontSize: 10 }}>
        {muscle}
      </Text>
    </View>
  );
}

type MusclePillsProps = {
  primaryMuscles: string[];
  secondaryMuscles: string[];
};

function MusclePills({ primaryMuscles, secondaryMuscles }: MusclePillsProps) {
  const { width } = useWindowDimensions();
  const muscleIconSize = width * 0.14;

  return (
    <View style={musclePillStyles.container}>
      <View>
        <Text small light style={musclePillStyles.headerText}>
          Primary Muscles
        </Text>
        <View style={musclePillStyles.musclesContainer}>
          {primaryMuscles.map((muscle) => (
            <MuscleIcon key={muscle} muscle={muscle} size={muscleIconSize} />
          ))}
        </View>
      </View>

      {secondaryMuscles.length > 0 && (
        <View>
          <Text small light style={musclePillStyles.headerText}>
            Secondary Muscles
          </Text>
          <View style={musclePillStyles.musclesContainer}>
            {secondaryMuscles.map((muscle) => (
              <MuscleIcon key={muscle} muscle={muscle} size={muscleIconSize} />
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

type PRExplanationProps = {
  difficultyType: DifficultyType;
};

function PRExplanation({ difficultyType }: PRExplanationProps) {
  const accentColor = convertHexToRGBA(useThemeColoring("primaryAction"), 0.1);
  const iconColor = useThemeColoring("primaryAction");
  const iconFill = convertHexToRGBA(iconColor, 0.3);

  let explanation = "";
  switch (difficultyType) {
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

type OverviewProps = {
  meta: ExerciseMeta;
  completions: CompletedExercise[];
  isLoading: boolean;
};

export function Overview({ meta, completions, isLoading }: OverviewProps) {
  const { height } = useWindowDimensions();
  const imageBackgroundColor = tintColor(
    useThemeColoring("appBackground"),
    0.05
  );
  const accentColor = useThemeColoring("primaryAction");

  const stats = aggregateExerciseStats(completions, meta.difficultyType);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={overviewStyles.container}
      contentContainerStyle={overviewStyles.contentContainer}
    >
      <View
        style={[
          overviewStyles.imageContainer,
          { backgroundColor: imageBackgroundColor, height: height * 0.3 },
        ]}
      >
        <ExerciseImage
          metaId={meta.metaId}
          imageStyle={{
            height: height * 0.25,
            width: height * 0.25,
            borderRadius: 10,
          }}
          fallbackSize={height * 0.2}
          fallbackColor={imageBackgroundColor}
        />
      </View>
      {meta.description && <Text light>{meta.description}</Text>}

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

      <PRExplanation difficultyType={meta.difficultyType} />

      <MusclePills
        primaryMuscles={meta.primaryMuscles}
        secondaryMuscles={meta.secondaryMuscles}
      />
    </ScrollView>
  );
}
