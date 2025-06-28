import { View, Text, useThemeColoring } from "@/components/Themed";
import { useRef, forwardRef, useEffect } from "react";
import {
  useWindowDimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  View as RNView,
  Image,
} from "react-native";
import { getExerciseDemonstration, getMeta } from "@/api/exercise";
import { Heatmap } from "@/components/heatmap";
import { Exercise, Workout } from "@/interface";
import { HeaderPage } from "@/components/util/header-page";
import {
  X,
  MoreHorizontal,
  FilePenLine,
  Trash2,
  RotateCw,
  Shuffle,
  Plus,
  ChevronRight,
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
import { Popover, PopoverItem, PopoverRef } from "@/components/util/popover";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  SharedValue,
  withRepeat,
  interpolateColor,
  LinearTransition,
  withTiming,
} from "react-native-reanimated";
import { CompletedWorkoutSheets, CompletedWorkoutSheetsRef } from "./sheets";
import { useCompletedWorkout } from "./context";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

type MusclesToSets = Record<string, number>;

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}m lbs`;
  }
  if (volume >= 1000) {
    return `${Math.round(volume / 1000)}k lbs`;
  }
  return `${Math.round(volume)} lbs`;
}

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
  onClick: () => void;
  progress: SharedValue<number>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MoreButton = forwardRef<RNView, MoreButtonProps>(
  ({ onClick, progress }, ref) => {
    const opacity = useAnimatedStyle(() => {
      return {
        opacity: interpolate(progress.value, [0, 1], [1, 0.7]),
      };
    });

    return (
      <View ref={ref}>
        <AnimatedPressable onPress={onClick} style={opacity}>
          <MoreHorizontal color={useThemeColoring("primaryAction")} />
        </AnimatedPressable>
      </View>
    );
  }
);

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
    marginTop: 10,
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
    marginTop: "3%",
  },
  headerContainer: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2%",
    paddingHorizontal: "3%",
  },
  sectionTitle: {
    fontWeight: "600",
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
  exerciseSkeletonContent: {
    ...StyleUtils.flexColumn(5),
  },
  chevronContainer: {
    ...StyleUtils.flexRowCenterAll(),
    marginLeft: "auto",
    paddingRight: "2%",
  },
  skeletonImage: {
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
});

type ExerciseItemProps = {
  exercise: Exercise;
  onDelete: (exerciseId: string) => void;
  onPress: (exerciseId: string) => void;
};

function ExerciseItem({ exercise, onDelete, onPress }: ExerciseItemProps) {
  const demonstration = getExerciseDemonstration(exercise.name);
  const { width } = useWindowDimensions();
  const lightTextColor = useThemeColoring("lightText");

  const handleDelete = () => {
    onDelete(exercise.id);
  };

  const handlePress = () => {
    onPress(exercise.id);
  };

  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={(_, drag) => (
        <SwipeableDelete drag={drag} onDelete={handleDelete} dimension={80} />
      )}
    >
      <TouchableOpacity onPress={handlePress}>
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
              <Text light italic small numberOfLines={2} ellipsizeMode="tail">
                {exercise.note}
              </Text>
            )}
          </View>
          <View style={exerciseListStyles.chevronContainer}>
            <ChevronRight size={20} color={lightTextColor} />
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

type MoreExercisesButtonProps = {
  onClick: () => void;
};

const MoreExercisesButton = forwardRef<any, MoreExercisesButtonProps>(
  ({ onClick }, ref) => {
    return (
      <TouchableOpacity ref={ref} onPress={onClick}>
        <MoreHorizontal color={useThemeColoring("primaryAction")} />
      </TouchableOpacity>
    );
  }
);

export type ExercisesRef = {
  openExercisesPopover: () => void;
};

type ExercisesProps = {
  exercises: Exercise[];
  exercisesPopoverRef: React.RefObject<PopoverRef | null>;
  onDelete: (exerciseId: string) => void;
  onExercisePress: (exerciseId: string) => void;
};

const Exercises = forwardRef<ExercisesRef, ExercisesProps>(
  ({ exercises, exercisesPopoverRef, onDelete, onExercisePress }, ref) => {
    const moreButtonRef = useRef<any>(null);

    const handleMorePress = () => {
      if (moreButtonRef.current && exercisesPopoverRef.current) {
        moreButtonRef.current.measure(
          (
            x: number,
            y: number,
            width: number,
            height: number,
            pageX: number,
            pageY: number
          ) => {
            exercisesPopoverRef.current?.open(pageX + width + 5, pageY + 20);
          }
        );
      }
    };

    return (
      <View style={exerciseListStyles.container}>
        <View style={exerciseListStyles.headerContainer}>
          <Text header style={exerciseListStyles.sectionTitle}>
            Exercises
          </Text>
          <MoreExercisesButton ref={moreButtonRef} onClick={handleMorePress} />
        </View>
        {exercises.map((exercise, index) => (
          <Animated.View key={exercise.id} layout={LinearTransition}>
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              onDelete={onDelete}
              onPress={onExercisePress}
            />
          </Animated.View>
        ))}
      </View>
    );
  }
);

function ExerciseSkeleton() {
  const skeletonColor = useThemeColoring("primaryAction");
  const animationProgress = useSharedValue(0);
  const pulsateFromColor = convertHexToRGBA(skeletonColor, 0.2);
  const pulsateToColor = convertHexToRGBA(skeletonColor, 0.3);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animationProgress.value,
      [0, 1],
      [pulsateFromColor, pulsateToColor]
    ),
  }));

  return (
    <View style={exerciseListStyles.exerciseItem}>
      <View style={exerciseListStyles.exerciseImage}>
        <Animated.View
          style={[exerciseListStyles.skeletonImage, animatedImageStyle]}
        />
      </View>
      <View style={exerciseListStyles.exerciseSkeletonContent}>
        <TextSkeleton
          text="Bench Press"
          style={{ fontSize: 16, fontWeight: "500" }}
        />
        <TextSkeleton
          text="3 sets • 225 lbs × 8 reps"
          style={{ fontSize: 14 }}
        />
        <TextSkeleton
          text="Great form today, felt strong"
          style={{ fontSize: 12 }}
        />
      </View>
      <View style={exerciseListStyles.chevronContainer}>
        <ChevronRight size={20} color={useThemeColoring("lightText")} />
      </View>
    </View>
  );
}

export function ExercisesSkeleton() {
  return (
    <View style={exerciseListStyles.container}>
      <View style={exerciseListStyles.headerContainer}>
        <Text header style={exerciseListStyles.sectionTitle}>
          Exercises
        </Text>
      </View>
      {Array.from({ length: 5 }).map((_, index) => (
        <ExerciseSkeleton key={index} />
      ))}
    </View>
  );
}

const completedWorkoutInitialStyles = StyleSheet.create({
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

export function CompletedWorkoutInitial() {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const popoverRef = useRef<PopoverRef>(null);
  const moreButtonRef = useRef<RNView>(null);
  const sheetsRef = useRef<CompletedWorkoutSheetsRef>(null);
  const exercisesRef = useRef<ExercisesRef>(null);
  const exercisesPopoverRef = useRef<PopoverRef>(null);
  const popoverProgress = useSharedValue(0);
  const exercisesPopoverProgress = useSharedValue(0);

  const { workout, onSave } = useCompletedWorkout();

  const heatmapContainerColor = tintColor(
    useThemeColoring("appBackground"),
    0.05
  );

  // Compute muscles worked in component body
  const musclesWorked = workout ? getMusclesWorked(workout) : {};

  const handleMorePress = () => {
    if (moreButtonRef.current) {
      moreButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        popoverRef.current?.open(pageX + width + 5, pageY + 20);
      });
    }
  };

  const handleUpdateWorkout = (update: Partial<Workout>) => {
    if (workout) {
      onSave({ ...workout, ...update });
    }
  };

  const handleRepeat = () => {
    popoverRef.current?.close();
    sheetsRef.current?.openRepeat();
  };

  const handleEdit = () => {
    popoverRef.current?.close();
    sheetsRef.current?.openEdit();
  };

  const handleDelete = () => {
    popoverRef.current?.close();
    sheetsRef.current?.openDelete();
  };

  const handleReorderExercises = () => {
    exercisesPopoverRef.current?.close();
    sheetsRef.current?.openReorderExercises();
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (workout) {
      const updatedExercises = workout.exercises.filter(
        (ex) => ex.id !== exerciseId
      );
      const updatedWorkout = { ...workout, exercises: updatedExercises };
      onSave(updatedWorkout);
    }
  };

  const handleExercisePress = (exerciseId: string) => {
    (navigation as any).navigate("setsEditor", { exerciseId });
  };

  return (
    <View style={{ height: "100%" }}>
      <HeaderPage
        title={
          workout ? (
            workout.name
          ) : (
            <TextSkeleton
              text="Completed Workout"
              style={{ fontSize: 18, fontWeight: "600" }}
            />
          )
        }
        subtitle={
          workout ? (
            getDateEditDisplay(workout.startedAt)
          ) : (
            <TextSkeleton
              text="January 1, 2024 at 2:30 PM"
              style={{ fontSize: 16 }}
            />
          )
        }
        leftAction={<CloseButton onClick={navigation.goBack} />}
        rightAction={
          <MoreButton
            ref={moreButtonRef}
            onClick={handleMorePress}
            progress={popoverProgress}
          />
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={completedWorkoutInitialStyles.container}
          contentContainerStyle={
            completedWorkoutInitialStyles.scrollContentContainer
          }
        >
          <View
            style={[
              completedWorkoutInitialStyles.heatmapContainer,
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
              isLoading={workout === undefined}
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
              isLoading={workout === undefined}
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
              isLoading={workout === undefined}
            />
          </View>

          {workout ? (
            <Exercises
              ref={exercisesRef}
              exercises={workout.exercises}
              exercisesPopoverRef={exercisesPopoverRef}
              onDelete={handleDeleteExercise}
              onExercisePress={handleExercisePress}
            />
          ) : (
            <ExercisesSkeleton />
          )}
        </ScrollView>
      </HeaderPage>

      <Popover ref={popoverRef} progress={popoverProgress}>
        <PopoverItem
          label="Repeat Workout"
          icon={<RotateCw size={20} color={useThemeColoring("primaryText")} />}
          onClick={handleRepeat}
        />
        <PopoverItem
          label="Edit Workout"
          icon={
            <FilePenLine size={20} color={useThemeColoring("primaryText")} />
          }
          onClick={handleEdit}
        />
        <PopoverItem
          label={
            <Text style={{ color: useThemeColoring("dangerAction") }}>
              Delete Workout
            </Text>
          }
          icon={<Trash2 size={20} color={useThemeColoring("dangerAction")} />}
          onClick={handleDelete}
        />
      </Popover>

      <Popover ref={exercisesPopoverRef} progress={exercisesPopoverProgress}>
        <PopoverItem
          label="Add Exercise"
          icon={<Plus size={20} color={useThemeColoring("primaryText")} />}
          onClick={() => {
            exercisesPopoverRef.current?.close();
            (navigation as any).navigate("addExercises");
          }}
        />
        <PopoverItem
          label="Reorder Exercises"
          icon={<Shuffle size={20} color={useThemeColoring("primaryText")} />}
          onClick={handleReorderExercises}
        />
      </Popover>
      <CompletedWorkoutSheets
        ref={sheetsRef}
        workout={workout}
        onUpdateWorkout={handleUpdateWorkout}
      />
    </View>
  );
}
