import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import {
  useCallback,
  useState,
  useEffect,
  forwardRef,
  ForwardedRef,
} from "react";
import { Zap } from "lucide-react-native";
import { useThemeColoring } from "@/components/Themed";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetHandle,
  BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { convertHexToRGBA, tintColor } from "@/util/color";
import { textTheme } from "@/constants/Themes";
import * as Haptics from "expo-haptics";
import { WorkoutApi } from "@/api/workout";
import { Routine } from "@/interface";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

const startWorkoutInitialPromptStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "2%",
    paddingBottom: "4%",
    paddingTop: "2%",
  },
  title: {
    ...StyleUtils.flexRow(),
    paddingLeft: "4%",
    paddingBottom: "2%",
  },
  button: {
    ...StyleUtils.flexRow(10),
    padding: "4%",
    borderRadius: 12,
    alignItems: "center",
  },
  actions: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "4%",
  },
});

type StartWorkoutInitialPromptProps = {
  onQuickStart: () => void;
  onShowRoutines: () => void;
};

function StartWorkoutInitialPrompt({
  onQuickStart,
  onShowRoutines,
}: StartWorkoutInitialPromptProps) {
  const primaryColor = convertHexToRGBA(useThemeColoring("primaryAction"), 0.8);
  const showRoutinesColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.1
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

  return (
    <View style={startWorkoutInitialPromptStyles.container}>
      <View style={startWorkoutInitialPromptStyles.title}>
        <Text large emphasized>
          Start workout
        </Text>
      </View>
      <View style={startWorkoutInitialPromptStyles.actions}>
        <TouchableOpacity
          style={[
            startWorkoutInitialPromptStyles.button,
            { backgroundColor: primaryColor },
          ]}
          onPress={handleQuickStart}
        >
          <Zap
            color={textColor}
            size={textTheme.action.fontSize}
            fill={textColor}
          />
          <Text emphasized>Quickstart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            startWorkoutInitialPromptStyles.button,
            { backgroundColor: showRoutinesColor },
          ]}
          onPress={handleShowRoutines}
        >
          <Text>Select existing routine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const routineSkeletonStyles = StyleSheet.create({
  title: {
    width: "60%",
    height: 16,
    borderRadius: 4,
  },
  subtitle: {
    width: "30%",
    height: 12,
    borderRadius: 4,
  },
});

function RoutineSkeletion() {
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

  const animatedTextStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      backgroundValue.value,
      [0, 1],
      [highlightColor, backgroundColor]
    ),
  }));

  const animatedSubtitleStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      backgroundValue.value,
      [0, 1],
      [highlightColor, backgroundColor]
    ),
  }));

  return (
    <Animated.View
      style={[pickFromRoutinesStyles.routineItem, animatedBackground]}
    >
      <Animated.View style={[routineSkeletonStyles.title, animatedTextStyle]} />
      <Animated.View
        style={[routineSkeletonStyles.subtitle, animatedSubtitleStyle]}
      />
    </Animated.View>
  );
}

const pickFromRoutinesStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingHorizontal: "2%",
    paddingBottom: "4%",
    paddingTop: "2%",
  },
  title: {
    ...StyleUtils.flexRow(),
    paddingLeft: "4%",
    paddingBottom: "2%",
  },
  loadingContainer: {
    ...StyleUtils.flexColumn(),
    padding: "4%",
    alignItems: "center",
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
  routineItem: {
    ...StyleUtils.flexColumn(3),
    padding: "3%",
    borderRadius: 12,
    marginBottom: "2%",
  },
});

type PickFromRoutinesProps = {
  onStartFromRoutine: (routine: Routine) => void;
};

function PickFromRoutines({ onStartFromRoutine }: PickFromRoutinesProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const routineColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.1
  );

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
      <View style={pickFromRoutinesStyles.title}>
        <Text large emphasized>
          Select a routine
        </Text>
      </View>
      {loading ? (
        <View style={pickFromRoutinesStyles.listContainer}>
          {[...Array(3)].map((_, index) => (
            <RoutineSkeletion key={index} />
          ))}
        </View>
      ) : routines.length === 0 ? (
        <View style={pickFromRoutinesStyles.emptyContainer}>
          <Text>No routines found</Text>
        </View>
      ) : (
        <View style={pickFromRoutinesStyles.listContainer}>
          {routines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={[
                pickFromRoutinesStyles.routineItem,
                { backgroundColor: routineColor },
              ]}
              onPress={() => handleStartFromRoutine(routine)}
            >
              <Text emphasized>{routine.name}</Text>
              <Text light small>
                {routine.plan.length} exercises
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const startWorkoutSheetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
  },
  handle: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 0,
  },
  indicator: {
    width: "20%",
    height: 4,
  },
});

type StartWorkoutSheetProps = {
  show: boolean;
  onHide: () => void;
  onQuickStart: () => void;
  onStartFromRoutine: (routine: Routine) => void;
};

export const StartWorkoutSheet = forwardRef(
  (
    { show, onHide, onQuickStart, onStartFromRoutine }: StartWorkoutSheetProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    const sheetColor = useThemeColoring("primaryViewBackground");
    const textColor = useThemeColoring("primaryText");
    const [showRoutines, setShowRoutines] = useState(false);

    const renderBackground = useCallback(
      (props: BottomSheetBackgroundProps) => (
        <View
          {...props}
          style={[props.style, { backgroundColor: sheetColor }]}
        />
      ),
      [sheetColor]
    );

    const handleShowRoutines = useCallback(() => {
      setShowRoutines(true);
    }, []);

    const onHideSheet = useCallback(() => {
      setShowRoutines(false);
      onHide();
    }, [onHide]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const renderHandle = useCallback(
      (props: any) => (
        <BottomSheetHandle
          {...props}
          style={[
            props.style,
            {
              backgroundColor: sheetColor,
              ...startWorkoutSheetStyles.handle,
            },
          ]}
          indicatorStyle={{
            backgroundColor: textColor,
            ...startWorkoutSheetStyles.indicator,
          }}
        />
      ),
      [sheetColor, textColor]
    );

    return (
      <BottomSheet
        ref={ref}
        snapPoints={[]}
        enablePanDownToClose
        enableOverDrag={false}
        onClose={onHideSheet}
        index={show ? 0 : -1}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        backgroundComponent={renderBackground}
      >
        <BottomSheetView
          style={[
            startWorkoutSheetStyles.container,
            { backgroundColor: sheetColor },
          ]}
        >
          {showRoutines ? (
            <PickFromRoutines onStartFromRoutine={onStartFromRoutine} />
          ) : (
            <StartWorkoutInitialPrompt
              onQuickStart={onQuickStart}
              onShowRoutines={handleShowRoutines}
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);
