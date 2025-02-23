import { View } from "@/components/Themed";
import { topActionsStyles } from "./styles";
import { Back, Filter } from "@/components/theme/actions";

type AddExercisesTopActionsProps = {
  onBack: () => void;
  hasFilters: boolean;
  onFilter: () => void;
};

export function AddExercisesTopActions({
  hasFilters,
  onBack,
  onFilter,
}: AddExercisesTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Back onClick={onBack} />
      <View style={topActionsStyles.rightActions}>
        <Filter onClick={onFilter} hasFilters={hasFilters} />
      </View>
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
