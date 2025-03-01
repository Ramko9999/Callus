import { useSound } from "@/components/sounds";
import {
  SetStatusInput,
  DifficultyInput,
} from "@/components/popup/workout/common/inputs";
import { View, Text } from "@/components/Themed";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import {
  Difficulty,
  DifficultyType,
  Set,
  SetPlan,
  SetStatus,
} from "@/interface";
import { EDITOR_SET_HEIGHT, StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export type SetProps = {
  index: number;
  set: Set | SetPlan;
  difficultyType: DifficultyType;
  onTrash: (setId: string) => void;
  onUpdate: (setId: string, update: Partial<Set>) => void;
};

const setStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
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

export function CompletedWorkoutSet({
  index,
  set,
  difficultyType,
  onTrash,
  onUpdate,
}: SetProps) {
  const { play } = useSound();
  const completedWorkoutSet = set as Set;

  const setAnimationSize = useSharedValue(1);

  const onFinishAnimation = () => {
    setAnimationSize.value = withSequence(
      withTiming(1.05, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: setAnimationSize.value }],
  }));

  return (
    <Swipeable
      renderRightActions={(_, drag) => (
        <SwipeableDelete
          drag={drag}
          onDelete={() => onTrash(completedWorkoutSet.id)}
          dimension={EDITOR_SET_HEIGHT}
        />
      )}
      overshootRight={false}
    >
      <Animated.View style={[setStyles.container, animatedStyle]}>
        <View style={setStyles.meta}>
          <View style={setStyles.index}>
            <Text light>Set</Text>
            <Text large>{index + 1}</Text>
          </View>
          <DifficultyInput
            id={completedWorkoutSet.id}
            difficulty={completedWorkoutSet.difficulty}
            type={difficultyType}
            onUpdate={(difficulty: Difficulty) =>
              onUpdate(completedWorkoutSet.id, { difficulty })
            }
          />
        </View>
        <SetStatusInput
          isActive={completedWorkoutSet.status !== SetStatus.UNSTARTED}
          onToggle={() => {
            if (completedWorkoutSet.status === SetStatus.FINISHED) {
              onUpdate(completedWorkoutSet.id, {
                status: SetStatus.UNSTARTED,
                restStartedAt: undefined,
                restEndedAt: undefined,
              });
            } else if (completedWorkoutSet.status === SetStatus.RESTING) {
              onUpdate(completedWorkoutSet.id, {
                status: SetStatus.FINISHED,
                restEndedAt: Date.now(),
              });
              play("positive_ring");
              onFinishAnimation();
            } else {
              onUpdate(completedWorkoutSet.id, {
                status: SetStatus.FINISHED,
              });
              play("positive_ring");
              onFinishAnimation();
            }
          }}
        />
      </Animated.View>
    </Swipeable>
  );
}

export function RoutineSet({
  index,
  set,
  difficultyType,
  onTrash,
  onUpdate,
}: SetProps) {
  const routineSet = set as SetPlan;
  return (
    <Swipeable
      renderRightActions={(_, drag) => (
        <SwipeableDelete
          drag={drag}
          onDelete={() => onTrash(routineSet.id)}
          dimension={EDITOR_SET_HEIGHT}
        />
      )}
      overshootRight={false}
    >
      <View style={setStyles.container}>
        <View style={setStyles.meta}>
          <View style={setStyles.index}>
            <Text light>Set</Text>
            <Text large>{index + 1}</Text>
          </View>
          <DifficultyInput
            id={routineSet.id}
            difficulty={routineSet.difficulty}
            type={difficultyType}
            onUpdate={(difficulty: Difficulty) =>
              onUpdate(routineSet.id, { difficulty })
            }
          />
        </View>
      </View>
    </Swipeable>
  );
}

export function LiveWorkoutSet({
  index,
  set,
  difficultyType,
  onTrash,
  onUpdate,
}: SetProps) {
  const { play } = useSound();
  // todo: add the flow for live workout when toggling
  const liveWorkoutSet = set as Set;

  const setAnimationSize = useSharedValue(1);

  const onFinishAnimation = () => {
    setAnimationSize.value = withSequence(
      withTiming(1.05, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: setAnimationSize.value }],
  }));

  return (
    <Swipeable
      renderRightActions={(_, drag) => (
        <SwipeableDelete
          drag={drag}
          onDelete={() => onTrash(liveWorkoutSet.id)}
          dimension={EDITOR_SET_HEIGHT}
        />
      )}
      overshootRight={false}
    >
      <Animated.View style={[setStyles.container, animatedStyle]}>
        <View style={setStyles.meta}>
          <View style={setStyles.index}>
            <Text light>Set</Text>
            <Text large>{index + 1}</Text>
          </View>
          <DifficultyInput
            id={liveWorkoutSet.id}
            difficulty={liveWorkoutSet.difficulty}
            type={difficultyType}
            onUpdate={(difficulty: Difficulty) =>
              onUpdate(liveWorkoutSet.id, { difficulty })
            }
          />
        </View>
        <SetStatusInput
          isActive={liveWorkoutSet.status !== SetStatus.UNSTARTED}
          onToggle={() => {
            if (liveWorkoutSet.status === SetStatus.FINISHED) {
              onUpdate(liveWorkoutSet.id, {
                status: SetStatus.UNSTARTED,
                restStartedAt: undefined,
                restEndedAt: undefined,
              });
            } else if (liveWorkoutSet.status === SetStatus.RESTING) {
              onUpdate(liveWorkoutSet.id, {
                status: SetStatus.FINISHED,
                restEndedAt: Date.now(),
              });
              onFinishAnimation();
              play("positive_ring");
            } else {
              onUpdate(liveWorkoutSet.id, {
                status: SetStatus.FINISHED,
              });
              onFinishAnimation();
              play("positive_ring");
            }
          }}
        />
      </Animated.View>
    </Swipeable>
  );
}
