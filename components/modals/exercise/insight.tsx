import { ExerciseInsights } from "@/components/popup/exercises/insights";
import { View } from "@/components/Themed";
import { RootStackParamList } from "@/layout/types";
import { StackScreenProps } from "@react-navigation/stack";
import { contentStyles, topActionsStyles } from "../common/styles";
import { Close } from "@/components/theme/actions";
import { ModalWrapper } from "../common";

type ExerciseInsightsTopActionsProps = {
  onClose: () => void;
};

function ExerciseInsightsTopActions({
  onClose,
}: ExerciseInsightsTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Close onClick={onClose} />
    </View>
  );
}

type ExerciseInsightsModalProps = StackScreenProps<
  RootStackParamList,
  "exerciseInsight"
>;

export function ExerciseInsightsOverviewModal({
  route,
  navigation,
}: ExerciseInsightsModalProps) {
  return (
    <ModalWrapper>
      <View style={contentStyles.container}>
        <ExerciseInsightsTopActions onClose={navigation.goBack} />
        <ExerciseInsights exerciseName={route.params.name} />
      </View>
    </ModalWrapper>
  );
}
