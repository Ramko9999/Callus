import {
  Difficulty,
  DifficultyType,
  ExercisingActivity as IExercisingActivity,
  RestingActivity as IRestingActivity,
  WorkoutActivity,
  WorkoutActivityType,
} from "@/interface";
import { View, Text, useThemeColoring } from "@/components/Themed";
import {
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import {
  getDifficultyType,
  getExerciseDemonstration,
} from "@/api/exercise";
import { EDITOR_SET_HEIGHT, StyleUtils } from "@/util/styles";
import { Set } from "@/interface";
import {
  Edit,
  NeutralAction,
  SignificantAction,
} from "@/components/theme/actions";
import { ProgressRing } from "@/components/util/progress-ring";
import { textTheme } from "@/constants/Themes";
import { getDurationDisplay } from "@/util/date";
import * as Haptics from "expo-haptics";
import { useSound } from "@/components/sounds";
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { DifficultyInput } from "../../common/inputs";
import { Check } from "lucide-react-native";
import { SetIndex } from "../../common/inputs";
import React from "react";

type ExerciseActivityDoneProps = {
  onStartAnimation: () => void;
  onDoneAnimation: () => void;
};

const exerciseActivityDoneStyles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
  check: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: 5,
    height: EDITOR_SET_HEIGHT - 20,
    width: EDITOR_SET_HEIGHT - 20,
    alignSelf: "flex-end",
  },
});
function ExerciseActivityDone({
  onStartAnimation,
  onDoneAnimation,
}: ExerciseActivityDoneProps) {
  const setColor = useSharedValue(0);
  const notStartedColor = useThemeColoring("calendarDayBackground");
  const finishedColor = useThemeColoring("primaryAction");

  const animatedStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        setColor.value,
        [0, 1],
        [notStartedColor, finishedColor]
      ),
    }),
    []
  );

  const onClick = () => {
    onStartAnimation();
    setColor.value = withTiming(1, {}, (done) => {
      if (done) {
        runOnJS(onDoneAnimation)();
      }
    });
  };

  return (
    <TouchableOpacity
      onPress={onClick}
      style={exerciseActivityDoneStyles.container}
    >
      <Animated.View style={[exerciseActivityDoneStyles.check, animatedStyle]}>
        <Check color={useThemeColoring("primaryText")} strokeWidth={3} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const exercisingActivitySetCompletionStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    width: "90%",
    paddingHorizontal: "3%",
    height: EDITOR_SET_HEIGHT,
  },
  meta: {
    ...StyleUtils.flexRow(30),
    alignItems: "baseline",
  },
  index: {
    ...StyleUtils.flexColumn(3),
  },
});

type ExercisingActivitySetCompletionProps = {
  set: Set;
  difficultyType: DifficultyType;
  setIndex: number;
  onUpdate: (setId: string, update: Partial<Set>) => void;
  onFinish: () => void;
};

function ExercisingActivitySetCompletion({
  set,
  difficultyType,
  setIndex,
  onUpdate,
  onFinish,
}: ExercisingActivitySetCompletionProps) {
  const { play } = useSound();
  const setAnimationSize = useSharedValue(1);

  const onStartAnimation = () => {
    play("positive_ring");
    setAnimationSize.value = withSequence(
      withTiming(1.05, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
  };

  const onDoneAnimation = () => {
    onFinish();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: setAnimationSize.value }],
  }));

  return (
    <Animated.View
      style={[exercisingActivitySetCompletionStyles.container, animatedStyle]}
    >
      <View style={exercisingActivitySetCompletionStyles.meta}>
        <SetIndex index={setIndex} />
        <DifficultyInput
          id={set.id}
          difficulty={set.difficulty}
          type={difficultyType}
          onUpdate={(difficulty: Difficulty) =>
            onUpdate(set.id, { difficulty })
          }
        />
      </View>
      <ExerciseActivityDone
        onStartAnimation={onStartAnimation}
        onDoneAnimation={onDoneAnimation}
      />
    </Animated.View>
  );
}

const DEMO_DIMENSION_MULTIPLIER = 0.9;

const activityStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
    paddingTop: "3%",
    alignItems: "center",
    flex: 1,
  },
  actions: {
    ...StyleUtils.flexRow(30),
    paddingHorizontal: "5%",
    justifyContent: "center",
  },
});

const exercisingActivityStyles = StyleSheet.create({
  demo: {
    borderRadius: 10,
  },
});

type ExercisingActivityProps = {
  activityData: IExercisingActivity;
  onUpdate: (setId: string, update: Partial<Set>) => void;
  onFinish: () => void;
};

function ExercisingActivity({
  activityData,
  onUpdate,
  onFinish,
}: ExercisingActivityProps) {
  const { exercise, set } = activityData;

  const setIndex = exercise.sets.findIndex((s) => s.id === set.id);
  const trueDemo = getExerciseDemonstration(exercise.name);

  const { width } = useWindowDimensions();

  return (
    <View style={activityStyles.container}>
      <Text extraLarge>{exercise.name}</Text>
      <Image
        alt={exercise.name}
        source={trueDemo}
        style={[
          exercisingActivityStyles.demo,
          {
            width: width * DEMO_DIMENSION_MULTIPLIER,
            height: width * DEMO_DIMENSION_MULTIPLIER,
          },
        ]}
      />
      <ExercisingActivitySetCompletion
        set={set}
        difficultyType={getDifficultyType(exercise.name)}
        setIndex={setIndex}
        onUpdate={onUpdate}
        onFinish={onFinish}
      />
    </View>
  );
}

const noMoreActivitesStyles = StyleSheet.create({
  content: {
    ...StyleUtils.flexColumn(),
    justifyContent: "space-between",
    paddingHorizontal: "3%",
  },
  addMoreMessage: {
    ...StyleUtils.flexRow(),
    alignItems: "baseline",
  },
  inlineEdit: {
    marginHorizontal: -15,
  },
});

function NoMoreActivites() {
  return (
    <View style={activityStyles.container}>
      <Text extraLarge>Are you finished?</Text>
      <View style={noMoreActivitesStyles.content}>
        <Text>
          There aren't anymore exercises for you to complete in this workout.
        </Text>
        <View>
          <View style={noMoreActivitesStyles.addMoreMessage}>
            <Text>You can add more exercises by clicking '</Text>
            <Edit
              iconSize={textTheme.neutral.fontSize}
              style={noMoreActivitesStyles.inlineEdit}
            />
            <Text>'</Text>
          </View>
        </View>
        <Text>Otherwise, you can finish your workout. Great work!</Text>
      </View>
    </View>
  );
}

const restingActivityStyles = StyleSheet.create({
  timer: {
    ...StyleUtils.flexColumn(),
    alignItems: "center",
  },
});

type RestingActivityProps = {
  activityData: IRestingActivity;
  onUpdate: (duration: number) => void;
  onSkip: () => void;
};

function RestingActivity({
  activityData,
  onUpdate,
  onSkip,
}: RestingActivityProps) {
  const { restDuration, restStartedAt } = activityData.set;
  const durationInMs = restDuration * 1000;
  const remaining = Math.max(
    (restStartedAt as number) + durationInMs - Date.now(),
    0
  );
  const progress = remaining / durationInMs;

  return (
    <View style={activityStyles.container}>
      <Text extraLarge>Rest</Text>
      <ProgressRing progress={progress}>
        <View style={restingActivityStyles.timer}>
          <Text style={{ ...textTheme.timer }}>
            {getDurationDisplay(Math.ceil(remaining / 1000))}
          </Text>
          <Text large light>
            {getDurationDisplay(restDuration)}
          </Text>
        </View>
      </ProgressRing>
      <View style={activityStyles.actions}>
        <NeutralAction
          text="-15s"
          onClick={() => {
            onUpdate(Math.max(restDuration - 15, 0));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          }}
        />
        <SignificantAction
          text="Skip"
          onClick={() => {
            onSkip();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          }}
        />
        <NeutralAction
          text="+15s"
          onClick={() => {
            onUpdate(restDuration + 15);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          }}
        />
      </View>
    </View>
  );
}

type ActivityProps = {
  activity: WorkoutActivity;
  onUpdateSet: (setId: string, update: Partial<Set>) => void;
  onCompleteSet: (setId: string) => void;
  onSkipRest: (setId: string) => void;
  onUpdateRest: (setId: string, duration: number) => void;
};

export function Activity({
  activity,
  onCompleteSet,
  onUpdateSet,
  onSkipRest,
  onUpdateRest,
}: ActivityProps) {
  const { type, activityData } = activity;
  if (type === WorkoutActivityType.EXERCISING) {
    const { set } = activityData as IExercisingActivity;
    return (
      <ExercisingActivity
        activityData={activityData as IExercisingActivity}
        onUpdate={onUpdateSet}
        onFinish={() => onCompleteSet(set.id)}
      />
    );
  } else if (type === WorkoutActivityType.RESTING) {
    const { set } = activityData as IRestingActivity;
    return (
      <RestingActivity
        activityData={activityData as IRestingActivity}
        onUpdate={(duration) => onUpdateRest(set.id, duration)}
        onSkip={() => onSkipRest(set.id)}
      />
    );
  } else {
    return <NoMoreActivites />;
  }
}
