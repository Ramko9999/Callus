import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import {
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import {
  DangerAction,
  SignificantAction,
} from "@/components/theme/actions";
import { ProgressRing } from "@/components/util/progress-ring";
import { getDurationDisplay } from "@/util/date";
import * as Haptics from "expo-haptics";
import { SimpleModal } from "../../common";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import { forwardRef, ForwardedRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";

const modalActionsStyles = StyleSheet.create({
  actions: {
    paddingTop: "3%",
    ...StyleUtils.flexRow(10),
    alignSelf: "center",
  },
  container: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  description: {
    marginBottom: 20,
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

const editRestDurationStyles = StyleSheet.create({
  container: {
    paddingBottom: "5%"
  },
  action: {
    aspectRatio: 1,
    padding: "2%",
    borderRadius: "50%",
    ...StyleUtils.flexRowCenterAll(),
  },
  duration: {
    fontSize: 80,
  },
});

type EditRestDurationProps = {
  show: boolean;
  hide: () => void;
  duration: number;
  onUpdateDuration: (duration: number) => void;
};

export const EditRestDuration = forwardRef(
  (
    { show, hide, duration, onUpdateDuration }: EditRestDurationProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    const { width } = useWindowDimensions();
    const actionBackgroundColor = useThemeColoring("calendarDayBackground");

    return (
      <PopupBottomSheet ref={ref} show={show} onHide={hide}>
        <View style={editRestDurationStyles.container}>
          <ProgressRing dimension={width * 0.7} progress={1}>
            <Text style={editRestDurationStyles.duration}>
              {getDurationDisplay(duration)}
            </Text>
          </ProgressRing>
          <View style={modalActionsStyles.actions}>
            <TouchableOpacity
              style={[
                editRestDurationStyles.action,
                { backgroundColor: actionBackgroundColor },
              ]}
              onPress={() => {
                onUpdateDuration(Math.max(duration - 15, 0));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
              }}
            >
              <Text large>-15s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                editRestDurationStyles.action,
                { backgroundColor: actionBackgroundColor },
              ]}
              onPress={() => {
                onUpdateDuration(duration + 15);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
              }}
            >
              <Text large>+15s</Text>
            </TouchableOpacity>
          </View>
        </View>
      </PopupBottomSheet>
    );
  }
);
