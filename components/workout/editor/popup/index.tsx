import { BottomSheet } from "@/components/util/sheets";
import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import {
  DangerAction,
  NeutralAction,
  SignificantAction,
} from "@/components/theme/actions";
import { ProgressRing } from "@/components/util/progress-ring";
import { getDurationDisplay } from "@/util/date";
import * as Haptics from "expo-haptics";

const popupStyles = StyleSheet.create({
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
      <View background style={popupStyles.container}>
        <View style={popupStyles.title}>
          <Text large>Are you sure?</Text>
        </View>
        <View style={popupStyles.subtitle}>
          <Text neutral light>
            This workout will be permanently deleted.
          </Text>
        </View>
        <View style={popupStyles.actions}>
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
      <View background style={popupStyles.container}>
        <View style={popupStyles.title}>
          <Text large>Some sets haven't been started</Text>
        </View>
        <View style={popupStyles.subtitle}>
          <Text neutral light>
            Do you want to discard them and finish the workout?
          </Text>
        </View>
        <View style={popupStyles.actions}>
          <SignificantAction
            text="Yes, discard them and finish!"
            onClick={onDiscard}
          />
        </View>
      </View>
    </BottomSheet>
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
  return (
    <BottomSheet show={show} hide={hide} onBackdropPress={hide}>
      <View background style={popupStyles.container}>
        <View style={popupStyles.title}>
          <Text large>Edit rest duration</Text>
        </View>
        <ProgressRing progress={1}>
          <Text extraLarge light>
            {getDurationDisplay(duration)}
          </Text>
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
      </View>
    </BottomSheet>
  );
}
