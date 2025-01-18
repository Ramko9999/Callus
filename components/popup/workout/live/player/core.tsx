import { View, Text } from "@/components/Themed";
import { Workout, WorkoutActivity } from "@/interface";
import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { getTimePeriodDisplay } from "@/util/date";
import { Close, Edit, SignificantAction } from "@/components/theme/actions";
import React from "react";
import { Activity } from "./activity";
import {
  DiscardSetsAndFinishConfirmation,
  ModalProps,
} from "../../common/modals";

const topActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    paddingRight: "3%",
  },
});

type PlayerTopActionsProps = {
  onClose: () => void;
  onEdit: () => void;
  onFinish: () => void;
};

function PlayerTopActions({
  onClose,
  onEdit,
  onFinish,
}: PlayerTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Close onClick={onClose} />
      <View style={topActionsStyles.rightActions}>
        <Edit onClick={onEdit} />
        <SignificantAction text="Finish" onClick={onFinish} />
      </View>
    </View>
  );
}

const playerContentStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
  },
  timer: {
    ...StyleUtils.flexRowCenterAll(),
  },
});

type PlayerContentProps = {
  workout: Workout;
  activity: WorkoutActivity;
  onCompleteSet: (setId: string) => void;
  onSkipRest: (setId: string) => void;
  onUpdateRest: (setId: string, duration: number) => void;
  onFinish: () => void;
  onEdit: () => void;
  onClose: () => void;
};

export function PlayerContent({
  workout,
  activity,
  onCompleteSet,
  onSkipRest,
  onUpdateRest,
  onFinish,
  onEdit,
  onClose,
}: PlayerContentProps) {
  return (
    <>
      <PlayerTopActions onEdit={onEdit} onClose={onClose} onFinish={onFinish} />
      <View background style={playerContentStyles.container}>
        <Activity
          activity={activity}
          onCompleteSet={onCompleteSet}
          onSkipRest={onSkipRest}
          onUpdateRest={onUpdateRest}
          onCompleteWorkout={onFinish}
        />
        <View style={playerContentStyles.timer}>
          <Text large>
            {getTimePeriodDisplay(Date.now() - workout.startedAt)}
          </Text>
        </View>
      </View>
    </>
  );
}

type PlayerModalsProps = {
  finish: () => void;
  finishConfirmation: ModalProps;
};

export function PlayerModals({
  finish,
  finishConfirmation,
}: PlayerModalsProps) {
  return (
    <>
      <DiscardSetsAndFinishConfirmation
        {...finishConfirmation}
        onDiscard={() => {
          finishConfirmation.hide();
          finish();
        }}
      />
    </>
  );
}
