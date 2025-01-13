import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StyleSheet, useWindowDimensions, ViewStyle } from "react-native";
import {
  DangerAction,
  NeutralAction,
  SignificantAction,
} from "@/components/theme/actions";
import { ProgressRing } from "@/components/util/progress-ring";
import { getDurationDisplay } from "@/util/date";
import * as Haptics from "expo-haptics";
import { Modal } from "@/components/util/popup/modal";
import { TimestampRangeEditor } from "@/components/util/timestamp-editor";

const popupStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingVertical: "2%",
    paddingHorizontal: "2%",
  },
  title: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    alignSelf: "center",
  },
  description: {
    alignSelf: "center",
  },
  actions: {
    paddingTop: "3%",
    ...StyleUtils.flexRow(10),
    alignSelf: "center",
  },
});

export type ModalProps = {
  show: boolean;
  hide: () => void;
};

type EditorPopupProps = {
  show: boolean;
  onHide: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
};

function EditorPopup({
  show,
  onHide,
  title,
  description,
  children,
  containerStyle,
}: EditorPopupProps) {
  return (
    <Modal show={show} onHide={onHide}>
      <View style={[popupStyles.container, containerStyle]}>
        <View style={popupStyles.title}>
          <Text action>{title}</Text>
        </View>
        {description && (
          <View style={popupStyles.description}>
            <Text light>{description}</Text>
          </View>
        )}
        {children}
      </View>
    </Modal>
  );
}

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
    <EditorPopup
      show={show}
      onHide={hide}
      title="Delete Workout?"
      description="This workout cannot be recovered after it is deleted."
    >
      <View style={popupStyles.actions}>
        <DangerAction text="Delete" onClick={onDelete} />
      </View>
    </EditorPopup>
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
    <EditorPopup
      show={show}
      onHide={hide}
      title="Repeat Workout?"
      description="Do you want to repeat this workout?"
    >
      <View style={popupStyles.actions}>
        <SignificantAction text="Repeat" onClick={onRepeat} />
      </View>
    </EditorPopup>
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
    <EditorPopup
      show={show}
      onHide={hide}
      title="Discard pending sets and finish workout?"
      description="There are still sets pending in your workout."
    >
      <View style={popupStyles.actions}>
        <SignificantAction text="Yes" onClick={onDiscard} />
      </View>
    </EditorPopup>
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
    <EditorPopup
      show={show}
      onHide={hide}
      title="Edit Rest Duration"
      description="After each set is completed, the rest timer will automatically start. Add or reduce rest in 15 second increments."
    >
      <ProgressRing dimension={width * 0.7} progress={1}>
        <Text extraLarge>{getDurationDisplay(duration)}</Text>
      </ProgressRing>
      <View style={popupStyles.actions}>
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
    </EditorPopup>
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
    <EditorPopup
      show={show}
      onHide={hide}
      title="Adjust Start/End Time"
      description={description}
      containerStyle={{ width: width * 0.8 }}
    >
      <TimestampRangeEditor
        startTime={startTime}
        endTime={endTime}
        onUpdateEndTime={updateEndTime}
        onUpdateStartTime={updateStartTime}
      />
    </EditorPopup>
  );
}
