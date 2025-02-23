import {
  Add,
  Back,
  Close,
  Edit,
  Finish,
  Progress,
  Timer,
} from "@/components/theme/actions";
import { topActionsStyles } from "../../common/styles";
import { View } from "@/components/Themed";

type PlayerTopActionsProps = {
  onClose: () => void;
  onEdit: () => void;
  onFinish: () => void;
};

export function PlayerTopActions({
  onClose,
  onEdit,
  onFinish,
}: PlayerTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Close onClick={onClose} />
      <View style={topActionsStyles.rightActions}>
        <Edit onClick={onEdit} />
        <Finish onClick={onFinish} />
      </View>
    </View>
  );
}

type ExerciseEditorTopActionsProps = {
  onBack: () => void;
  onAdd: () => void;
  onFinish: () => void;
};

export function ExercisesEditorTopActions({
  onBack,
  onAdd,
  onFinish,
}: ExerciseEditorTopActionsProps) {
  return (
    <View style={topActionsStyles.container}>
      <Back onClick={onBack} />
      <View style={topActionsStyles.rightActions}>
        <Add onClick={onAdd} />
        <Finish onClick={onFinish} />
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
