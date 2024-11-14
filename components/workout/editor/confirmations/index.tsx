import { BottomSheet } from "@/components/bottom-sheet";
import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { DangerAction, NeutralAction } from "../../core/actions";

const confirmationStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingVertical: "5%",
    alignItems: "center",
  },
  actions: {
    ...StyleUtils.flexRow(10),
  },
  action: {
    flex: 1,
  },
});

type WorkoutDeleteConfirmationProps = {
  show: boolean;
  onDelete: () => void;
  hide: () => void;
};

export function WorkoutDeleteConfirmation({
  show,
  onDelete,
  hide,
}: WorkoutDeleteConfirmationProps) {
  return (
    <BottomSheet show={show} hide={hide} onBackdropPress={hide} id='workout-delete'>
      <View background style={confirmationStyles.container}>
        <Text large>Are you sure?</Text>
        <Text neutral light>
          This workout will permanently deleted.
        </Text>
        <View style={confirmationStyles.actions}>
          <NeutralAction text="No" onClick={hide} />
          <DangerAction text="Yes, delete it!" onClick={onDelete} />
        </View>
      </View>
    </BottomSheet>
  );
}

type FinishNotCompletedWorkoutConfirmationProps = {
  show: boolean;
  hide: () => void;
  onDiscard: () => void;
  onMarkCompleted: () => void;
};

export function FinishNotCompletedWorkoutConfirmation({
  show,
  hide,
  onDiscard,
  onMarkCompleted,
}: FinishNotCompletedWorkoutConfirmationProps) {
  return (
    <BottomSheet show={show} hide={hide} onBackdropPress={hide}>
      <View background style={confirmationStyles.container}>
        <Text large>There are some sets which haven't been started</Text>
        <Text neutral light>
          What do you want to do with them?
        </Text>
        <View style={confirmationStyles.actions}>
          <NeutralAction text="JI" onClick={hide} />
        </View>
      </View>
    </BottomSheet>
  );
}
