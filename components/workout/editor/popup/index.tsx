import { View, Text } from "@/components/Themed";
import {
  StyleUtils,
  WORKOUT_PLAYER_EDITOR_HEIGHT, // todo: centralize a common height for the bottom sheet
} from "@/util/styles";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  DangerAction,
  NeutralAction,
  SignificantAction,
} from "@/components/theme/actions";
import { ProgressRing } from "@/components/util/progress-ring";
import { getDurationDisplay } from "@/util/date";
import * as Haptics from "expo-haptics";
import { Modal } from "@/components/util/popup/modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

type EditorPopupProps = {
  show: boolean;
  onHide: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
};

function EditorPopup({
  show,
  onHide,
  title,
  description,
  children,
}: EditorPopupProps) {
  // all these popups are rendering from a bottom sheet and need to be adjusted to be in the center of the screen
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const adjustment =
    -1 * (height * (1 - WORKOUT_PLAYER_EDITOR_HEIGHT) - insets.bottom);

  return (
    <Modal
      show={show}
      onHide={onHide}
      customBackdropStyle={{ marginTop: adjustment }}
    >
      <View style={popupStyles.container}>
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
