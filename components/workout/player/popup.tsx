import { BottomSheet } from "@/components/bottom-sheet";
import { View, Text } from "@/components/Themed";
import { useWorkout } from "@/context/WorkoutContext";
import {
  ExercisingActivity,
  RestingActivity,
  Workout,
  WorkoutActivity,
  WorkoutActivityType,
  WorkoutMetadata,
} from "@/interface";
import { StyleUtils, WORKOUT_PLAYER_EDITOR_HEIGHT } from "@/util/styles";
import { Dimensions, StyleSheet } from "react-native";
import {
  ExercisingActivityTile,
  FinishWorkoutActivityTile,
  RestingActivityTile,
} from "./WorkoutActivityTile";
import { useStopwatch } from "@/components/hooks/use-stopwatch";
import { getTimePeriodDisplay } from "@/util";
import { Close, Edit, SignificantAction } from "../core/actions";
import { useState } from "react";
import { Editor } from "../editor/editor";

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
  const { activity, actions, metadata } = useWorkout();
  const { elapsedMs } = useStopwatch({
    startTimeMs: (metadata as WorkoutMetadata).startedAt,
  });

  const { type, activityData } = activity as WorkoutActivity;

  const getWorkoutActivityTile = () => {
    switch (type) {
      case WorkoutActivityType.EXERCISING:
        const exercisingData = activityData as unknown as ExercisingActivity;
        return (
          <ExercisingActivityTile
            activityData={exercisingData}
            onFinish={() => actions.completeSet(exercisingData.setId)}
          />
        );
      case WorkoutActivityType.RESTING:
        const restingData = activityData as unknown as RestingActivity;
        return (
          <RestingActivityTile
            activityData={activityData as unknown as RestingActivity}
            onFinish={() => actions.completeRest(restingData.setId)}
            onUpdateRestDuration={(duration) =>
              actions.updateRestDuration(restingData.setId, duration)
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
    <View background style={livePlayerStyles.container}>
      <LivePlayerActions onEdit={onEdit} onExit={hide} onFinish={() => {}} />
      <View
        background
        style={[
          livePlayerStyles.content,
          {
            height:
              Dimensions.get("screen").height * WORKOUT_PLAYER_EDITOR_HEIGHT,
          },
        ]}
      >
        {getWorkoutActivityTile()}
        <View style={livePlayerStyles.timer}>
          <Text large>{getTimePeriodDisplay(elapsedMs)}</Text>
        </View>
      </View>
    </View>
  );
}

type LiveEditorProps = {
  hide: () => void;
};

function LiveEditor({ hide }: LiveEditorProps) {
  const { editor } = useWorkout();
  const { workout, actions } = editor;
  return (
    <Editor
      workout={workout as Workout}
      hide={hide}
      onSaveWorkout={actions.updateWorkout}
      onDelete={() => {}}
    />
  );
}

type LivePlayerPopupProps = {
  show: boolean;
  hide: () => void;
};

export function LivePlayerPopup({ show, hide }: LivePlayerPopupProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <BottomSheet show={show} hide={hide} onBackdropPress={hide}>
      {isEditing ? (
        <LiveEditor hide={() => setIsEditing(false)} />
      ) : (
        <LivePlayer hide={hide} onEdit={() => setIsEditing(true)} />
      )}
    </BottomSheet>
  );
}
