import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  DangerAction,
  NeutralAction,
  SignificantAction,
} from "@/components/theme/actions";
import { ProgressRing } from "@/components/util/progress-ring";
import { getDurationDisplay } from "@/util/date";
import * as Haptics from "expo-haptics";
import { TimestampRangeEditor } from "@/components/util/timestamp-editor";
import { SimpleModal } from "../../common";

const modalActionsStyles = StyleSheet.create({
  actions: {
    paddingTop: "3%",
    ...StyleUtils.flexRow(10),
    alignSelf: "center",
  },
});

type WorkoutDeleteConfirmationProps = {
  show: boolean;
  hide: () => void;
  onDelete: () => void;
};

export function WorkoutDeleteConfirmation({
  show,
  hide,
  onDelete,
}: WorkoutDeleteConfirmationProps) {
  return (
    <SimpleModal
      show={show}
      onHide={hide}
      title="Delete workout?"
      description="This workout cannot be recovered after it is deleted."
    >
      <View style={modalActionsStyles.actions}>
        <DangerAction text="Delete" onClick={onDelete} />
      </View>
    </SimpleModal>
  );
}

type RoutineDeleteConfirmationProps = {
  show: boolean;
  hide: () => void;
  onDelete: () => void;
};

export function RoutineDeleteConfirmation({
  show,
  hide,
  onDelete,
}: RoutineDeleteConfirmationProps) {
  return (
    <SimpleModal
      show={show}
      onHide={hide}
      title="Delete routine?"
      description="This routine cannot be recovered after it is deleted"
    >
      <View style={modalActionsStyles.actions}>
        <DangerAction text="Delete" onClick={onDelete} />
      </View>
    </SimpleModal>
  );
}

type RoutineStartConfirmationProps = {
  show: boolean;
  hide: () => void;
  onStart: () => void;
};

export function RoutineStartConfirmation({
  show,
  hide,
  onStart,
}: RoutineStartConfirmationProps) {
  return (
    <SimpleModal
      show={show}
      onHide={hide}
      title="Start routine?"
      description="Are you ready to start this routine?"
    >
      <View style={modalActionsStyles.actions}>
        <SignificantAction text="Start" onClick={onStart} />
      </View>
    </SimpleModal>
  );
}

type RepeatWorkoutConfirmationProps = {
  show: boolean;
  hide: () => void;
  onRepeat: () => void;
};

export function RepeatWorkoutConfirmation({
  show,
  hide,
  onRepeat,
}: RepeatWorkoutConfirmationProps) {
  return (
    <SimpleModal
      show={show}
      onHide={hide}
      title="Repeat workout?"
      description="Do you want to repeat this workout?"
    >
      <View style={modalActionsStyles.actions}>
        <SignificantAction text="Repeat" onClick={onRepeat} />
      </View>
    </SimpleModal>
  );
}

type DiscardSetsAndFinishConfirmationProps = {
  show: boolean;
  hide: () => void;
  onDiscard: () => void;
};

export function DiscardSetsAndFinishConfirmation({
  show,
  hide,
  onDiscard,
}: DiscardSetsAndFinishConfirmationProps) {
  return (
    <SimpleModal
      show={show}
      onHide={hide}
      title="Discard remaining sets and finish workout?"
      description="There are still sets remaining in your workout."
    >
      <View style={modalActionsStyles.actions}>
        <SignificantAction text="Yes" onClick={onDiscard} />
      </View>
    </SimpleModal>
  );
}

type EditRestDurationProps = {
  show: boolean;
  hide: () => void;
  duration: number;
  onUpdateDuration: (duration: number) => void;
};

export function EditRestDuration({
  show,
  hide,
  duration,
  onUpdateDuration,
}: EditRestDurationProps) {
  const { width } = useWindowDimensions();

  return (
    <SimpleModal
      show={show}
      onHide={hide}
      title="Edit rest?"
      description="After each set is completed, the rest timer will automatically start. Add or reduce rest in 15 second increments."
    >
      <ProgressRing dimension={width * 0.7} progress={1}>
        <Text extraLarge>{getDurationDisplay(duration)}</Text>
      </ProgressRing>
      <View style={modalActionsStyles.actions}>
        <NeutralAction
          onClick={() => {
            onUpdateDuration(Math.max(duration - 15, 0));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          }}
          text="-15s"
        />
        <NeutralAction
          onClick={() => {
            onUpdateDuration(duration + 15);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          }}
          text="+15s"
        />
      </View>
    </SimpleModal>
  );
}

type AdjustStartEndTimeProps = {
  show: boolean;
  hide: () => void;
  startTime: number;
  endTime?: number;
  updateStartTime: (startTime: number) => void;
  updateEndTime: (endTime: number) => void;
};

export function AdjustStartEndTime({
  show,
  hide,
  startTime,
  endTime,
  updateStartTime,
  updateEndTime,
}: AdjustStartEndTimeProps) {
  const { width } = useWindowDimensions();
  const description =
    "Adjust when your workout started and ended" +
    (endTime == undefined
      ? " Since you are in a live workout, the end time cannot edited."
      : "");

  return (
    <SimpleModal
      show={show}
      onHide={hide}
      title="Adjust start/end time?"
      description={description}
      containerStyle={{ width: width * 0.8 }}
    >
      <TimestampRangeEditor
        startTime={startTime}
        endTime={endTime}
        onUpdateEndTime={updateEndTime}
        onUpdateStartTime={updateStartTime}
      />
    </SimpleModal>
  );
}
