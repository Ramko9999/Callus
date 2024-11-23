import { BottomSheet } from "@/components/bottom-sheet";
import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { DangerAction, SignificantAction } from "../../core/actions";

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

type DiscardUnstartedSetsConfirmationProps = {
  show: boolean;
  hide: () => void;
  onDiscard: () => void;
};

export function DiscardUnstartedSetsConfirmation({
  show,
  hide,
  onDiscard,
}: DiscardUnstartedSetsConfirmationProps) {
  return (
    <BottomSheet show={show} hide={hide} onBackdropPress={hide}>
      <View background style={confirmationStyles.container}>
        <View style={confirmationStyles.title}>
          <Text large>Some sets haven't been started</Text>
        </View>
        <View style={confirmationStyles.subtitle}>
          <Text neutral light>
            Do you want to discard them and finish the workout?
          </Text>
        </View>
        <View style={confirmationStyles.actions}>
          <SignificantAction text="Yes, discard them and finish!" onClick={onDiscard} />
        </View>
      </View>
    </BottomSheet>
  );
}
