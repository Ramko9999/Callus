import { BottomSheet } from "@/components/util/sheets";
import { View, Text } from "@/components/Themed";
import {
  hasUnstartedSets,
  useWorkout,
  wrapUpSets,
} from "@/context/WorkoutContext";
import {
  ExercisingActivity,
  RestingActivity,
  Workout,
  WorkoutActivity,
  WorkoutActivityType,
  WorkoutMetadata,
} from "@/interface";
import { StyleUtils, WORKOUT_PLAYER_EDITOR_HEIGHT } from "@/util/styles";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  ExercisingActivityTile,
  FinishWorkoutActivityTile,
  RestingActivityTile,
} from "./WorkoutActivityTile";
import { useStopwatch } from "@/components/hooks/use-stopwatch";
import { getTimePeriodDisplay } from "@/util/date";
import { Close, Edit, SignificantAction } from "@/components/theme/actions";
import { useState } from "react";
import { LiveEditor } from "../editor/live";
import { DiscardUnstartedSetsConfirmation } from "../editor/confirmations";

const livePlayerActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "3%",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    justifyContent: "center",
    alignItems: "center",
    paddingRight: "3%",
  },
});

type LivePlayerActionsProps = {
  onExit: () => void;
  onEdit: () => void;
  onFinish: () => void;
};

function LivePlayerActions({
  onExit,
  onEdit,
  onFinish,
}: LivePlayerActionsProps) {
  return (
    <View style={livePlayerActionsStyles.container}>
      <Close onClick={onExit} />
      <View style={livePlayerActionsStyles.rightActions}>
        <Edit onClick={onEdit} />
        <SignificantAction text="Finish" onClick={onFinish} />
      </View>
    </View>
  );
}

const livePlayerStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  content: {
    ...StyleUtils.flexColumn(10),
  },
  timer: {
    alignSelf: "center",
  },
});

type LivePlayerProps = {
  hide: () => void;
  onEdit: () => void;
};

function LivePlayer({ hide, onEdit }: LivePlayerProps) {
  const { activity, actions, metadata, editor } = useWorkout();
  const { elapsedMs } = useStopwatch({
    startTimeMs: (metadata as WorkoutMetadata).startedAt,
  });

  const { workout, actions: editorActions } = editor;
  const { updateWorkout } = editorActions;

  const [isFinishing, setIsFinishing] = useState(false);

  const { type, activityData } = activity as WorkoutActivity;

  const { height } = useWindowDimensions();
  const getWorkoutActivityTile = () => {
    switch (type) {
      case WorkoutActivityType.EXERCISING:
        const exercisingData = activityData as unknown as ExercisingActivity;
        return (
          <ExercisingActivityTile
            activityData={exercisingData}
            onFinish={() => actions.completeSet(exercisingData.set.id)}
          />
        );
      case WorkoutActivityType.RESTING:
        const restingData = activityData as unknown as RestingActivity;
        return (
          <RestingActivityTile
            activityData={activityData as unknown as RestingActivity}
            onFinish={() => actions.completeRest(restingData.set.id)}
            onUpdateRestDuration={(duration) =>
              actions.updateRestDuration(restingData.set.id, duration)
            }
          />
        );
      case WorkoutActivityType.FINISHED:
        return <FinishWorkoutActivityTile onFinish={actions.finishWorkout} />;
      default:
        null;
    }
  };

  return (
    <>
      <View
        background
        style={[
          livePlayerStyles.container,
          { height: height * WORKOUT_PLAYER_EDITOR_HEIGHT },
        ]}
      >
        <LivePlayerActions
          onEdit={onEdit}
          onExit={hide}
          onFinish={() => {
            if (hasUnstartedSets(workout as Workout)) {
              setIsFinishing(true);
            } else {
              updateWorkout(wrapUpSets(workout as Workout));
            }
          }}
        />
        <View background style={livePlayerStyles.content}>
          {getWorkoutActivityTile()}
          <View style={livePlayerStyles.timer}>
            <Text large>{getTimePeriodDisplay(elapsedMs)}</Text>
          </View>
        </View>
      </View>
      <DiscardUnstartedSetsConfirmation
        show={isFinishing}
        hide={() => setIsFinishing(false)}
        onDiscard={() => {
          updateWorkout(wrapUpSets(workout as Workout));
          setIsFinishing(false);
        }}
      />
    </>
  );
}

type LiveProps = {
  hide: () => void;
};

export function Live({ hide }: LiveProps) {
  const [isEditing, setIsEditing] = useState(false);

  return isEditing ? (
    <LiveEditor back={() => setIsEditing(false)} />
  ) : (
    <LivePlayer hide={hide} onEdit={() => setIsEditing(true)} />
  );
}
