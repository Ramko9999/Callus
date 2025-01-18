import {
  ExercisingActivity as IExercisingActivity,
  RestingActivity as IRestingActivity,
  WorkoutActivity,
  WorkoutActivityType,
} from "@/interface";
import { View, Text } from "@/components/Themed";
import { StyleSheet, Image, useWindowDimensions } from "react-native";
import { getMeta } from "@/api/exercise";
import { StyleUtils } from "@/util/styles";
import { getDifficultyDescription } from "@/util/workout/display";
import {
  Edit,
  NeutralAction,
  SignificantAction,
} from "@/components/theme/actions";
import { ProgressRing } from "@/components/util/progress-ring";
import { textTheme } from "@/constants/Themes";
import { getDurationDisplay } from "@/util/date";
import * as Haptics from "expo-haptics";

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
  onFinish: () => void;
};

function ExercisingActivity({
  activityData,
  onFinish,
}: ExercisingActivityProps) {
  const { exercise, set } = activityData;
  const meta = getMeta(exercise.name);
  const { width } = useWindowDimensions();

  // todo: use our own graphics
  return (
    <View style={activityStyles.container}>
      <Text extraLarge>{exercise.name}</Text>
      <Text large>
        {getDifficultyDescription(meta.difficultyType, set.difficulty)}
      </Text>
      <Image
        source={{ uri: meta.demoUrl || "" }}
        style={[
          exercisingActivityStyles.demo,
          {
            width: width * DEMO_DIMENSION_MULTIPLIER,
            height: width * DEMO_DIMENSION_MULTIPLIER,
          },
        ]}
      />
      <View style={activityStyles.actions}>
        <SignificantAction text="Done" onClick={onFinish} />
      </View>
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
  onCompleteSet: (setId: string) => void;
  onSkipRest: (setId: string) => void;
  onUpdateRest: (setId: string, duration: number) => void;
  onCompleteWorkout: () => void;
};

export function Activity({
  activity,
  onCompleteSet,
  onSkipRest,
  onUpdateRest,
  onCompleteWorkout,
}: ActivityProps) {
  const { type, activityData } = activity;
  if (type === WorkoutActivityType.EXERCISING) {
    const { set } = activityData as IExercisingActivity;
    return (
      <ExercisingActivity
        activityData={activityData as IExercisingActivity}
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
