import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { View } from "@/components/Themed";
import { Back, Grid, List } from "@/components/theme/actions";

const topActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
    paddingHorizontal: "3%",
    paddingVertical: "3%",
  },
});

type AddExercisesTopActionsProps = {
  onBack: () => void;
  isGridView: boolean;
  onToggleView: () => void;
};

export function AddExercisesTopActions({
  onBack,
  isGridView,
  onToggleView,
}: AddExercisesTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Back onClick={onBack} />
      {isGridView ? (
        <List onClick={onToggleView} />
      ) : (
        <Grid onClick={onToggleView} />
      )}
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
