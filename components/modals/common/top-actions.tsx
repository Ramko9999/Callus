import { View } from "@/components/Themed";
import { topActionsStyles } from "./styles";
import { Back } from "@/components/theme/actions";

type AddExercisesTopActionsProps = {
  onBack: () => void;
};

export function AddExercisesTopActions({
  onBack,
}: AddExercisesTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Back onClick={onBack} />
    </View>
  );
}

type ExerciseInsightTopActionsProps = {
  onBack: () => void;
};

export function ExerciseInsightTopActions({
  onBack,
}: ExerciseInsightTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Back onClick={onBack} />
    </View>
  );
}
