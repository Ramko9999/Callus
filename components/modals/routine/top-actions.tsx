import { View } from "@/components/Themed";
import {
  Close,
  Add,
  Trash,
  Back,
  Progress,
  Filter,
  Start,
  Timer,
} from "@/components/theme/actions";
import { topActionsStyles } from "../common/styles";

type ExerciseEditorTopActionsProps = {
  onClose: () => void;
  onAdd: () => void;
  onTrash: () => void;
  onStart: () => void;
};

export function ExercisesEditorTopActions({
  onClose,
  onAdd,
  onTrash,
  onStart,
}: ExerciseEditorTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Close onClick={onClose} />
      <View style={topActionsStyles.rightActions}>
        <Add onClick={onAdd} />
        <Start onClick={onStart} />
        <Trash onClick={onTrash} />
      </View>
    </View>
  );
}

type SetsEditorTopActionsProps = {
  onAdd: () => void;
  onBack: () => void;
  onViewProgress: () => void;
  onEditRest: () => void;
};

export function SetsEditorTopActions({
  onAdd,
  onBack,
  onViewProgress,
  onEditRest,
}: SetsEditorTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Back onClick={onBack} />
      <View style={topActionsStyles.rightActions}>
        <Progress onClick={onViewProgress} />
        <Timer onClick={onEditRest} />
        <Add onClick={onAdd} />
      </View>
    </View>
  );
}

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
