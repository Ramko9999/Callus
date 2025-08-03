import { View, Text, useThemeColoring } from "@/components/Themed";
import {
  useRef,
  forwardRef,
  useEffect,
  useState,
  useImperativeHandle,
} from "react";
import {
  useWindowDimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { Heatmap } from "@/components/heatmap";
import { Exercise, ExerciseMeta, Workout } from "@/interface";
import { HeaderPage } from "@/components/util/header-page";
import {
  FilePenLine,
  Trash2,
  RotateCw,
  Shuffle,
  Plus,
  ChevronRight,
} from "lucide-react-native";
import { CloseButton, MoreButton } from "@/components/pages/common";
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
  SharedValue,
  withRepeat,
  interpolateColor,
  LinearTransition,
  withTiming,
} from "react-native-reanimated";
import { useCompletedWorkout } from "./context";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useUserDetails } from "@/components/user-details";
import { WorkoutApi } from "@/api/workout";
import { WorkoutCreation } from "@/api/model/workout";
import {
  RepeatWorkoutConfirmation,
  WorkoutDeleteConfirmation,
} from "@/components/sheets";
import { EditWorkout } from "@/components/sheets/edit-workout";
import { ReorderExercisesSheet } from "@/components/sheets/reorder-exercises";
import { useLiveWorkout } from "../live/context";
import { ExerciseImage } from "@/components/exercise/image";
import { ExerciseStoreSelectors, useExercisesStore } from "@/components/store";
import { useShallow } from "zustand/shallow";

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
function getMusclesWorked(
  workout: Workout,
  exerciseMetas: ExerciseMeta[]
): MusclesToSets {
  const musclesToSets: MusclesToSets = {};

  for (const exercise of workout.exercises) {
    const exerciseMeta = exerciseMetas.find(
      (meta) => meta.metaId === exercise.metaId
    )!;

    const setCount = exercise.sets.length;

    for (const muscle of exerciseMeta.primaryMuscles) {
      if (musclesToSets[muscle]) {
        musclesToSets[muscle] += setCount;
      } else {
        musclesToSets[muscle] = setCount;
      }
    }

    for (const muscle of exerciseMeta.secondaryMuscles) {
      const halfSetCount = setCount * 0.5;
      if (musclesToSets[muscle]) {
        musclesToSets[muscle] += halfSetCount;
      } else {
        musclesToSets[muscle] = halfSetCount;
      }
    }
  }

  return musclesToSets;
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
  emptyContainer: {
    flex: 1,
    ...StyleUtils.flexRowCenterAll(),
  },
});

type ExerciseItemProps = {
  exercise: Exercise;
  onDelete: (exerciseId: string) => void;
  onPress: (exerciseId: string) => void;
};

function ExerciseItem({ exercise, onDelete, onPress }: ExerciseItemProps) {
  const { width } = useWindowDimensions();
  const lightTextColor = useThemeColoring("lightText");
  const exerciseName = useExercisesStore(
    (state) => ExerciseStoreSelectors.getExercise(exercise.metaId, state).name
  );
  const difficultyType = useExercisesStore(
    (state) =>
      ExerciseStoreSelectors.getExercise(exercise.metaId, state).difficultyType
  );

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
            <ExerciseImage
              metaId={exercise.metaId}
              imageStyle={{ width: width * 0.15, height: width * 0.15, borderRadius: 5 }}
              fallbackSize={width * 0.15}
              fallbackColor={lightTextColor}
            />
          </View>
          <View style={exerciseListStyles.exerciseContent}>
            <Text>{exerciseName}</Text>
            <Text light sneutral>
              {getHistoricalExerciseDescription({
                difficulties: exercise.sets.map((set) => set.difficulty),
                difficultyType,
              })}
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

export type ExercisesRef = {
  openExercisesPopover: () => void;
};

type ExercisesProps = {
  exercises: Exercise[];
  exercisesPopoverRef: React.RefObject<PopoverRef | null>;
  onDelete: (exerciseId: string) => void;
  onExercisePress: (exerciseId: string) => void;
  exercisesPopoverProgress: SharedValue<number>;
};

const Exercises = forwardRef<ExercisesRef, ExercisesProps>(
  (
    {
      exercises,
      exercisesPopoverRef,
      onDelete,
      onExercisePress,
      exercisesPopoverProgress,
    },
    ref
  ) => {
    const moreButtonRef = useRef<any>(null);
    const { height } = useWindowDimensions();

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
          <MoreButton
            ref={moreButtonRef}
            onClick={handleMorePress}
            progress={exercisesPopoverProgress}
          />
        </View>
        {exercises.length === 0 ? (
          <View
            style={[
              exerciseListStyles.emptyContainer,
              { height: height * 0.3 },
            ]}
          >
            <Text light>No exercises</Text>
          </View>
        ) : (
          exercises.map((exercise, index) => (
            <Animated.View key={exercise.id} layout={LinearTransition}>
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                onDelete={onDelete}
                onPress={onExercisePress}
              />
            </Animated.View>
          ))
        )}
      </View>
    );
  }
);

function ExerciseSkeleton() {
  const skeletonColor = useThemeColoring("primaryAction");
  const animationProgress = useSharedValue(0);
  const pulsateFromColor = convertHexToRGBA(skeletonColor, 0.2);
  const pulsateToColor = convertHexToRGBA(skeletonColor, 0.3);
  const { width } = useWindowDimensions();

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
          style={[
            exerciseListStyles.skeletonImage,
            animatedImageStyle,
            { width: width * 0.15, height: width * 0.15 },
          ]}
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
  const sheetsRef = useRef<CompletedWorkoutInitialSheetsRef>(null);
  const exercisesRef = useRef<ExercisesRef>(null);
  const exercisesPopoverRef = useRef<PopoverRef>(null);
  const popoverProgress = useSharedValue(0);
  const exercisesPopoverProgress = useSharedValue(0);
  const allExerciseMetas = useExercisesStore((state) => state.exercises);
  const metaIdToDifficultyType = useExercisesStore(
    useShallow(ExerciseStoreSelectors.getMetaIdToDifficultyType)
  );

  const { workout, onSave } = useCompletedWorkout();

  const heatmapContainerColor = tintColor(
    useThemeColoring("appBackground"),
    0.05
  );

  // Compute muscles worked in component body
  // todo: this is nasty
  const musclesWorked = workout
    ? getMusclesWorked(workout, allExerciseMetas)
    : {};

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
                  ? formatVolume(
                      getWorkoutSummary(workout, metaIdToDifficultyType)
                        .totalWeightLifted
                    )
                  : "0 lbs"
              }
              label="Volume"
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
              value={
                workout
                  ? `${
                      getWorkoutSummary(workout, metaIdToDifficultyType)
                        .totalReps
                    }`
                  : "0"
              }
              label="Reps"
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
                        getWorkoutSummary(workout, metaIdToDifficultyType)
                          .totalDuration
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
              exercisesPopoverProgress={exercisesPopoverProgress}
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
          label="Edit Name & Time"
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
      <CompletedWorkoutInitialSheets
        ref={sheetsRef}
        workout={workout}
        onUpdateWorkout={handleUpdateWorkout}
      />
    </View>
  );
}

type CompletedWorkoutInitialSheetsProps = {
  workout?: Workout;
  onUpdateWorkout: (update: Partial<Workout>) => void;
};

type CompletedWorkoutInitialSheetsRef = {
  openDelete: () => void;
  openEdit: () => void;
  openRepeat: () => void;
  openReorderExercises: () => void;
};

const CompletedWorkoutInitialSheets = forwardRef<
  CompletedWorkoutInitialSheetsRef,
  CompletedWorkoutInitialSheetsProps
>(({ workout, onUpdateWorkout }, ref) => {
  const navigation = useNavigation();
  const { isInWorkout, saveWorkout } = useLiveWorkout();
  const { userDetails } = useUserDetails();

  const workoutDeleteConfirmationSheetRef = useRef<any>(null);
  const editCompletedWorkoutSheetRef = useRef<any>(null);
  const repeatWorkoutConfirmationSheetRef = useRef<any>(null);
  const reorderExercisesSheetRef = useRef<any>(null);

  const [isTrashingWorkout, setIsTrashingWorkout] = useState(false);
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isReorderingExercises, setIsReorderingExercises] = useState(false);

  const openDelete = () => {
    setIsTrashingWorkout(true);
  };

  const openEdit = () => {
    setIsEditingWorkout(true);
  };

  const openRepeat = () => {
    setIsRepeating(true);
  };

  const openReorderExercises = () => {
    setIsReorderingExercises(true);
  };

  useImperativeHandle(ref, () => ({
    openDelete,
    openEdit,
    openRepeat,
    openReorderExercises,
  }));

  const handleDeleteConfirm = () => {
    setIsTrashingWorkout(false);
    if (workout) {
      WorkoutApi.deleteWorkout(workout.id).then(navigation.goBack);
    }
  };

  const handleRepeatConfirm = () => {
    if (!workout) return;
    setIsRepeating(false);

    saveWorkout(
      WorkoutCreation.createFromWorkout(
        workout,
        userDetails?.bodyweight as number
      )
    );
    navigation.goBack();
    //@ts-ignore
    navigation.navigate("liveWorkoutSheet");
  };

  const handleWorkoutUpdate = async (
    update: Partial<{ name: string; startedAt: number; endedAt: number }>
  ) => {
    if (!workout) return;

    // Update the workout with the new data
    const updatedWorkout = { ...workout, ...update };
    onUpdateWorkout(updatedWorkout);
  };

  const handleExercisesReorder = async (newExercises: Exercise[]) => {
    if (!workout) return;

    const updatedWorkout = { ...workout, exercises: newExercises };
    onUpdateWorkout(updatedWorkout);
  };

  return (
    <>
      {workout ? (
        <>
          <WorkoutDeleteConfirmation
            ref={workoutDeleteConfirmationSheetRef}
            show={isTrashingWorkout}
            hide={() => workoutDeleteConfirmationSheetRef.current?.close()}
            onHide={() => setIsTrashingWorkout(false)}
            onDelete={handleDeleteConfirm}
          />
          <EditWorkout
            ref={editCompletedWorkoutSheetRef}
            show={isEditingWorkout}
            onHide={() => setIsEditingWorkout(false)}
            workout={workout}
            onUpdate={handleWorkoutUpdate}
            hide={() => editCompletedWorkoutSheetRef.current?.close()}
          />
          <RepeatWorkoutConfirmation
            ref={repeatWorkoutConfirmationSheetRef}
            show={isRepeating}
            hide={() => repeatWorkoutConfirmationSheetRef.current?.close()}
            onHide={() => setIsRepeating(false)}
            isInWorkout={isInWorkout}
            onRepeat={handleRepeatConfirm}
          />
          <ReorderExercisesSheet
            ref={reorderExercisesSheetRef}
            show={isReorderingExercises}
            onHide={() => setIsReorderingExercises(false)}
            exercises={workout.exercises}
            onReorder={handleExercisesReorder}
            hide={() => reorderExercisesSheetRef.current?.close()}
          />
        </>
      ) : null}
    </>
  );
});
