import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import {
  useCallback,
  useState,
  useEffect,
  forwardRef,
  ForwardedRef,
  useMemo,
} from "react";
import { Zap } from "lucide-react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { convertHexToRGBA, tintColor } from "@/util/color";
import * as Haptics from "expo-haptics";
import { WorkoutApi } from "@/api/workout";
import { Routine, Workout } from "@/interface";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import { TextSkeleton } from "@/components/util/loading";
import {
  SheetArrowLeft,
  SheetProps,
  SheetX,
  commonSheetStyles,
} from "./common";

const startWorkoutInitialPromptStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "2%",
    paddingBottom: "4%",
  },
  title: {
    ...StyleUtils.flexRow(),
    paddingLeft: "4%",
    paddingBottom: "2%",
  },
  quickStartButton: {
    ...StyleUtils.flexRow(10),
    marginBottom: "2%",
    paddingHorizontal: "3%",
    justifyContent: "space-between",
  },
  neutralButton: {
    marginBottom: "2%",
  },
  actions: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "4%",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

type StartWorkoutInitialPromptProps = {
  hasCompletedWorkouts: boolean;
  hide: () => void;
  onQuickStart: () => void;
  onShowRoutines: () => void;
  onShowWorkouts: () => void;
};

function StartWorkoutInitialPrompt({
  hasCompletedWorkouts,
  hide,
  onQuickStart,
  onShowRoutines,
  onShowWorkouts,
}: StartWorkoutInitialPromptProps) {
  const primaryColor = useThemeColoring("primaryAction");
  const neutralColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.05
  );

  const textColor = useThemeColoring("primaryText");

  const handleQuickStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onQuickStart();
  }, [onQuickStart]);

  const handleShowRoutines = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShowRoutines();
  }, [onShowRoutines]);

  const handleShowWorkouts = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShowWorkouts();
  }, [onShowWorkouts]);

  return (
    <View style={startWorkoutInitialPromptStyles.container}>
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          Start workout
        </Text>
        <TouchableOpacity onPress={hide}>
          <SheetX />
        </TouchableOpacity>
      </View>
      <View style={startWorkoutInitialPromptStyles.actions}>
        <TouchableOpacity
          style={[
            commonSheetStyles.sheetButton,
            startWorkoutInitialPromptStyles.quickStartButton,
            { backgroundColor: primaryColor },
          ]}
          onPress={handleQuickStart}
        >
          <Zap color={textColor} size={16} fill={textColor} />
          <Text emphasized>Quickstart</Text>
          <View />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonSheetStyles.sheetButton,
            startWorkoutInitialPromptStyles.neutralButton,
            { backgroundColor: neutralColor },
          ]}
          onPress={handleShowRoutines}
        >
          <Text emphasized>Select existing routine</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonSheetStyles.sheetButton,
            startWorkoutInitialPromptStyles.neutralButton,
            { backgroundColor: neutralColor },
            !hasCompletedWorkouts &&
              startWorkoutInitialPromptStyles.disabledButton,
          ]}
          disabled={!hasCompletedWorkouts}
          onPress={hasCompletedWorkouts ? handleShowWorkouts : undefined}
        >
          <Text emphasized>Select from recent workouts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const pickableRoutineStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(3),
    padding: "3%",
    borderRadius: 12,
    marginBottom: "2%",
  },
});

type PickableRoutineProps = {
  routine: Routine;
  onClick: (routine: Routine) => void;
};

function PickableRoutine({ routine, onClick }: PickableRoutineProps) {
  const routineColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.1
  );

  return (
    <TouchableOpacity
      key={routine.id}
      style={[
        pickableRoutineStyles.container,
        { backgroundColor: routineColor },
      ]}
      onPress={() => onClick(routine)}
    >
      <Text emphasized>{routine.name}</Text>
      <Text light small>
        {routine.plan.length} exercises
      </Text>
    </TouchableOpacity>
  );
}

const pickableSkeletonStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(3),
    padding: "3%",
    borderRadius: 12,
    marginBottom: "2%",
  },
  titleContainer: {
    width: "40%",
  },
  subtitleContainer: {
    width: "60%",
  },
  title: {
    height: 16,
    borderRadius: 4,
  },
  subtitle: {
    height: 12,
    borderRadius: 4,
  },
});

function PickableSkeleton() {
  const backgroundValue = useSharedValue(0);
  const backgroundColor = useThemeColoring("primaryViewBackground");
  const highlightColor = convertHexToRGBA(
    useThemeColoring("primaryAction"),
    0.1
  );

  useEffect(() => {
    backgroundValue.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedBackground = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      backgroundValue.value,
      [0, 1],
      [backgroundColor, highlightColor]
    ),
  }));

  return (
    <Animated.View
      style={[pickableSkeletonStyles.container, animatedBackground]}
    >
      <View style={pickableSkeletonStyles.titleContainer}>
        <TextSkeleton
          text="Workout Title"
          style={pickableSkeletonStyles.title}
        />
      </View>
      <View style={pickableSkeletonStyles.subtitleContainer}>
        <TextSkeleton
          text="Subtitle goes here"
          style={pickableSkeletonStyles.subtitle}
        />
      </View>
    </Animated.View>
  );
}

const pickFromRoutinesStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "2%",
    paddingBottom: "4%",
  },
  title: {
    ...StyleUtils.flexRow(),
    paddingLeft: "4%",
    paddingBottom: "2%",
  },
  emptyContainer: {
    ...StyleUtils.flexColumn(),
    padding: "4%",
    alignItems: "center",
  },
  listContainer: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "4%",
  },
});

type PickFromRoutinesProps = {
  onStartFromRoutine: (routine: Routine) => void;
  onBack: () => void;
};

function PickFromRoutines({
  onStartFromRoutine,
  onBack,
}: PickFromRoutinesProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    WorkoutApi.getRoutines()
      .then(setRoutines)
      .finally(() => setLoading(false));
  }, []);

  const handleStartFromRoutine = useCallback(
    (routine: Routine) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onStartFromRoutine(routine);
    },
    [onStartFromRoutine]
  );

  return (
    <View style={pickFromRoutinesStyles.container}>
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          Select a routine
        </Text>
        <TouchableOpacity onPress={onBack}>
          <SheetArrowLeft />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={pickFromRoutinesStyles.listContainer}>
          {[...Array(3)].map((_, index) => (
            <PickableSkeleton key={index} />
          ))}
        </View>
      ) : routines.length === 0 ? (
        <View style={pickFromRoutinesStyles.emptyContainer}>
          <Text>No routines found</Text>
        </View>
      ) : (
        <View style={pickFromRoutinesStyles.listContainer}>
          {routines.map((routine) => (
            <PickableRoutine
              key={routine.id}
              routine={routine}
              onClick={handleStartFromRoutine}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const pickableWorkoutStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(3),
    padding: "3%",
    borderRadius: 12,
    marginBottom: "2%",
  },
});

type PickableWorkoutProps = {
  workout: Workout;
  onClick: (workout: Workout) => void;
};

function PickableWorkout({ workout, onClick }: PickableWorkoutProps) {
  const workoutColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.1
  );

  const formattedDate = useMemo(() => {
    const date = new Date(workout.startedAt);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, [workout.startedAt]);

  return (
    <TouchableOpacity
      key={workout.id}
      style={[
        pickableWorkoutStyles.container,
        { backgroundColor: workoutColor },
      ]}
      onPress={() => onClick(workout)}
    >
      <Text emphasized>{workout.name}</Text>
      <Text light small>
        {formattedDate} · {workout.exercises.length} exercises
      </Text>
    </TouchableOpacity>
  );
}

const pickFromWorkoutsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "2%",
    paddingBottom: "4%",
  },
  title: {
    ...StyleUtils.flexRow(),
    paddingLeft: "4%",
    paddingBottom: "2%",
  },
  emptyContainer: {
    ...StyleUtils.flexColumn(),
    padding: "4%",
    alignItems: "center",
  },
  listContainer: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "4%",
  },
});

type PickFromWorkoutsProps = {
  onStartFromWorkout: (workout: Workout) => void;
  onBack: () => void;
};

function PickFromWorkouts({
  onStartFromWorkout,
  onBack,
}: PickFromWorkoutsProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    WorkoutApi.getRecentlyCompletedWorkouts()
      .then(setWorkouts)
      .finally(() => setLoading(false));
  }, []);

  const handleStartFromWorkout = useCallback(
    (workout: Workout) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onStartFromWorkout(workout);
    },
    [onStartFromWorkout]
  );

  return (
    <View style={pickFromWorkoutsStyles.container}>
      <View style={commonSheetStyles.sheetHeader}>
        <Text action style={{ fontWeight: 600 }}>
          Recent workouts
        </Text>
        <TouchableOpacity onPress={onBack}>
          <SheetArrowLeft />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={pickFromWorkoutsStyles.listContainer}>
          {[...Array(3)].map((_, index) => (
            <PickableSkeleton key={index} />
          ))}
        </View>
      ) : workouts.length === 0 ? (
        <View style={pickFromWorkoutsStyles.emptyContainer}>
          <Text>No recent workouts found</Text>
        </View>
      ) : (
        <View style={pickFromWorkoutsStyles.listContainer}>
          {workouts.map((workout) => (
            <PickableWorkout
              key={workout.id}
              workout={workout}
              onClick={handleStartFromWorkout}
            />
          ))}
        </View>
      )}
    </View>
  );
}

type StartWorkoutSheetProps = SheetProps & {
  onQuickStart: () => void;
  onStartFromRoutine: (routine: Routine) => void;
  onStartFromWorkout: (workout: Workout) => void;
};

export const StartWorkoutSheet = forwardRef(
  (
    {
      show,
      hide,
      onHide,
      onQuickStart,
      onStartFromRoutine,
      onStartFromWorkout,
    }: StartWorkoutSheetProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    const sheetColor = useThemeColoring("primaryViewBackground");
    const [showRoutines, setShowRoutines] = useState(false);
    const [showWorkouts, setShowWorkouts] = useState(false);
    const [hasCompletedWorkouts, setHasCompletedWorkouts] = useState(false);

    useEffect(() => {
      if (show) {
        setHasCompletedWorkouts(false);
        WorkoutApi.getCompletedWorkoutsBefore(Date.now()).then((count) => {
          setHasCompletedWorkouts(count > 0);
        });
      }
    }, [show]);

    const handleShowRoutines = useCallback(() => {
      setShowRoutines(true);
      setShowWorkouts(false);
    }, []);

    const handleShowWorkouts = useCallback(() => {
      setShowWorkouts(true);
      setShowRoutines(false);
    }, []);

    const onHideSheet = useCallback(() => {
      setShowRoutines(false);
      setShowWorkouts(false);
      onHide();
    }, [onHide]);

    const handleBack = useCallback(() => {
      setShowRoutines(false);
      setShowWorkouts(false);
    }, []);

    return (
      <PopupBottomSheet ref={ref} show={show} onHide={onHideSheet}>
        {showRoutines ? (
          <PickFromRoutines
            onStartFromRoutine={onStartFromRoutine}
            onBack={handleBack}
          />
        ) : showWorkouts ? (
          <PickFromWorkouts
            onStartFromWorkout={onStartFromWorkout}
            onBack={handleBack}
          />
        ) : (
          <StartWorkoutInitialPrompt
            hasCompletedWorkouts={hasCompletedWorkouts}
            onQuickStart={onQuickStart}
            onShowRoutines={handleShowRoutines}
            onShowWorkouts={handleShowWorkouts}
            hide={hide}
          />
        )}
      </PopupBottomSheet>
    );
  }
);
