import { View, Text, useThemeColoring } from "@/components/Themed";
import { useState, useEffect, useRef } from "react";
import {
  useWindowDimensions,
  StyleSheet,
  Image,
  ScrollView,
  GestureResponderEvent,
  TouchableOpacity,
} from "react-native";
import { WorkoutApi } from "@/api/workout";
import { getMeta, getExerciseDemonstration } from "@/api/exercise";
import { Heatmap } from "@/components/heatmap";
import { Workout, Exercise } from "@/interface";
import { HeaderPage } from "@/components/util/header-page";
import {
  X,
  MoreHorizontal,
  FilePenLine,
  Trash2,
  RotateCw,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import {
  getDateEditDisplay,
  getTimePeriodDisplay,
  roundToNearestMinute,
} from "@/util/date";
import { tintColor, convertHexToRGBA } from "@/util/color";
import { Clock } from "lucide-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getWorkoutSummary } from "@/context/WorkoutContext";
import { StyleUtils } from "@/util/styles";
import { TextSkeleton } from "@/components/util/loading";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import {
  Popover,
  PopoverItem,
  PopoverRef,
  PopoverSection,
} from "@/components/util/popover";

type MusclesToSets = Record<string, number>;

// Helper function to get muscles worked from a workout object
function getMusclesWorked(workout: Workout): MusclesToSets {
  const musclesToSets: MusclesToSets = {};

  // Iterate through each exercise in the workout
  for (const exercise of workout.exercises) {
    try {
      // Get the exercise meta to find which muscles it targets
      const exerciseMeta = getMeta(exercise.name);

      // Count the number of sets for this exercise
      const setCount = exercise.sets.length;

      // Add full set count to primary muscles
      for (const muscle of exerciseMeta.primaryMuscles) {
        if (musclesToSets[muscle]) {
          musclesToSets[muscle] += setCount;
        } else {
          musclesToSets[muscle] = setCount;
        }
      }

      // Add half set count to secondary muscles
      for (const muscle of exerciseMeta.secondaryMuscles) {
        const halfSetCount = setCount * 0.5;
        if (musclesToSets[muscle]) {
          musclesToSets[muscle] += halfSetCount;
        } else {
          musclesToSets[muscle] = halfSetCount;
        }
      }
    } catch (error) {
      // If we can't find the exercise meta, skip it
      console.warn(`Could not find meta for exercise: ${exercise.name}`);
    }
  }

  return musclesToSets;
}

type CloseButtonProps = {
  onClick: () => void;
};

function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <X color={useThemeColoring("primaryAction")} />
    </TouchableOpacity>
  );
}

type MoreButtonProps = {
  onClick: (event: GestureResponderEvent) => void;
};

function MoreButton({ onClick }: MoreButtonProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <MoreHorizontal color={useThemeColoring("primaryAction")} />
    </TouchableOpacity>
  );
}

type CompletedWorkoutProps = {
  route: {
    params: {
      id: string;
    };
  };
};

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}m lbs`;
  }
  if (volume >= 1000) {
    return `${Math.round(volume / 1000)}k lbs`;
  }
  return `${Math.round(volume)} lbs`;
}

const workoutSummaryStyles = StyleSheet.create({
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
  statsContainer: {
    ...StyleUtils.flexRow(15),
    justifyContent: "space-around",
    marginTop: 20,
  },
});

type WorkoutSummaryStatProps = {
  value: string;
  label: string;
  icon: React.ReactNode;
  isLoading: boolean;
};

function WorkoutSummaryStat({
  value,
  label,
  icon,
  isLoading,
}: WorkoutSummaryStatProps) {
  const accentColor = convertHexToRGBA(useThemeColoring("primaryAction"), 0.1);

  return (
    <View
      style={[workoutSummaryStyles.container, { backgroundColor: accentColor }]}
    >
      {icon}
      {isLoading ? (
        <TextSkeleton text={value} style={workoutSummaryStyles.value} />
      ) : (
        <Text style={workoutSummaryStyles.value}>{value}</Text>
      )}
      <Text light style={workoutSummaryStyles.label}>
        {label}
      </Text>
    </View>
  );
}

const exerciseListStyles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  exerciseItem: {
    ...StyleUtils.flexRow(15),
    paddingVertical: "3%",
    paddingHorizontal: "3%",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    minHeight: 80,
    alignItems: "center",
  },
  exerciseImage: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: 8,
  },
  exerciseContent: {
    ...StyleUtils.flexColumn(5),
    flex: 1,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 10,
    paddingHorizontal: "3%",
  },
});

type ExerciseItemProps = {
  exercise: Exercise;
};

function ExerciseItem({ exercise }: ExerciseItemProps) {
  const demonstration = getExerciseDemonstration(exercise.name);

  const { width } = useWindowDimensions();

  return (
    <View style={exerciseListStyles.exerciseItem}>
      <View style={[exerciseListStyles.exerciseImage]}>
        {demonstration && (
          <Image
            source={demonstration}
            style={{ width: width * 0.15, height: width * 0.15 }}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={exerciseListStyles.exerciseContent}>
        <Text>{exercise.name}</Text>
        <Text light sneutral>
          {getHistoricalExerciseDescription(exercise)}
        </Text>
        {exercise.note && (
          <Text light italic small>
            {exercise.note}
          </Text>
        )}
      </View>
    </View>
  );
}

const completedWorkoutStyles = StyleSheet.create({
  container: {
    padding: "3%",
  },
  heatmapContainer: {
    padding: "3%",
    borderRadius: 10,
  },
  scrollContentContainer: {
    paddingBottom: "30%",
  },
});

export function CompletedWorkout({ route }: CompletedWorkoutProps) {
  const { id } = route.params;
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const popoverRef = useRef<PopoverRef>(null);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [musclesWorked, setMusclesWorked] = useState<MusclesToSets>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);

  const heatmapContainerColor = tintColor(
    useThemeColoring("appBackground"),
    0.05
  );

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const workoutData = await WorkoutApi.getWorkout(id);
        setWorkout(workoutData);

        const muscles = getMusclesWorked(workoutData);
        setMusclesWorked(muscles);
      } catch (err) {
        console.error("Failed to load workout:", err);
        setError("Failed to load workout");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadWorkout();
    }
  }, [id]);

  const handleMorePress = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    popoverRef.current?.open(pageX, pageY);
  };

  return (
    <View style={{ height: "100%", backgroundColor: "red" }}>
      <HeaderPage
        title={workout?.name || "Completed Workout"}
        subtitle={workout ? getDateEditDisplay(workout.startedAt) : ""}
        leftAction={<CloseButton onClick={navigation.goBack} />}
        rightAction={<MoreButton onClick={handleMorePress} />}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={completedWorkoutStyles.container}
          contentContainerStyle={completedWorkoutStyles.scrollContentContainer}
        >
          <View
            style={[
              completedWorkoutStyles.heatmapContainer,
              { backgroundColor: heatmapContainerColor },
            ]}
          >
            <Heatmap
              width={width * 0.9}
              height={height * 0.25}
              musclesToSets={musclesWorked}
            />
          </View>

          <View style={workoutSummaryStyles.statsContainer}>
            <WorkoutSummaryStat
              value={
                workout
                  ? formatVolume(getWorkoutSummary(workout).totalWeightLifted)
                  : "0 lbs"
              }
              label="Total Volume"
              icon={
                <MaterialCommunityIcons
                  name="weight"
                  size={20}
                  color={useThemeColoring("primaryAction")}
                />
              }
              isLoading={loading}
            />

            <WorkoutSummaryStat
              value={workout ? `${getWorkoutSummary(workout).totalReps}` : "0"}
              label="Total Reps"
              icon={
                <MaterialCommunityIcons
                  name="arm-flex"
                  size={20}
                  color={useThemeColoring("primaryAction")}
                />
              }
              isLoading={loading}
            />

            <WorkoutSummaryStat
              value={
                workout
                  ? getTimePeriodDisplay(
                      roundToNearestMinute(
                        getWorkoutSummary(workout).totalDuration
                      )
                    )
                  : "0m"
              }
              label="Duration"
              icon={
                <Clock size={20} color={useThemeColoring("primaryAction")} />
              }
              isLoading={loading}
            />
          </View>

          {workout && (
            <View style={exerciseListStyles.container}>
              <Text header style={exerciseListStyles.sectionTitle}>
                Exercises
              </Text>
              {workout.exercises.map((exercise, index) => (
                <ExerciseItem key={exercise.id || index} exercise={exercise} />
              ))}
            </View>
          )}
        </ScrollView>
      </HeaderPage>

      <Popover ref={popoverRef}>
        <PopoverSection>
          <PopoverItem
            label="Repeat Workout"
            icon={
              <RotateCw size={20} color={useThemeColoring("primaryText")} />
            }
            onClick={() => {
              /* Handle Repeat */
            }}
          />
          <PopoverItem
            label="Edit Workout"
            icon={
              <FilePenLine size={20} color={useThemeColoring("primaryText")} />
            }
            onClick={() => {
              /* Handle Edit */
            }}
          />
          <PopoverItem
            label={
              <Text style={{ color: useThemeColoring("dangerAction") }}>
                Delete Workout
              </Text>
            }
            icon={<Trash2 size={20} color={useThemeColoring("dangerAction")} />}
            onClick={() => {
              /* Handle Delete */
            }}
          />
        </PopoverSection>
      </Popover>
    </View>
  );
}
