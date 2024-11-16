import { BottomSheet } from "@/components/bottom-sheet";
import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { DangerAction, NeutralAction } from "../../core/actions";

const confirmationStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingVertical: "3%",
  },
  title: {
    ...StyleUtils.flexRow(),
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
  },
  subtitle: {
    alignSelf: "center",
  },
  actions: {
    paddingTop: "3%",
    ...StyleUtils.flexRow(10),
    alignSelf: "center",
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
    <BottomSheet show={show} hide={hide} onBackdropPress={hide}>
      <View background style={confirmationStyles.container}>
        <View style={confirmationStyles.title}>
          <Text large>Are you sure?</Text>
        </View>
        <View style={confirmationStyles.subtitle}>
          <Text neutral light>
            This workout will be permanently deleted.
          </Text>
        </View>
        <View style={confirmationStyles.actions}>
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
