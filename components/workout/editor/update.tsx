import { View, Text, TextInput, Icon } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import {
  BodyWeightDifficulty,
  WeightDifficulty,
  AssistedBodyWeightDifficulty,
  TimeDifficulty,
  Difficulty,
  DifficultyType,
  SetStatus,
} from "@/interface";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  updateContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  updateValue: {
    display: "flex",
    flexDirection: "row",
    gap: 2,
  },
  difficultyUpdateContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 20,
  },
  setStatusUpdateValue: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "2%"
  },
});

type NumericUpdateProps = {
  value: number;
  onUpdate: (_: number) => void;
  label: string;
  unit: string;
};

function NumericUpdate({ value, onUpdate, label, unit }: NumericUpdateProps) {
  return (
    <View style={styles.updateContainer}>
      <Text _type="small" numberOfLines={1}>
        {label.padEnd(16)}
      </Text>
      <View style={styles.updateValue}>
        <TextInput
          _type="neutral"
          keyboardType="number-pad"
          value={value.toString()}
          onChangeText={(value) => {
            if (!Number.isNaN(parseInt(value))) {
              onUpdate(parseInt(value));
            } else {
              onUpdate(0);
            }
          }}
        />
        <Text _type="neutral" numberOfLines={1}>
          {" "}
          {unit}
        </Text>
      </View>
    </View>
  );
}

type WeightDifficultyUpdateProps = {
  difficulty: WeightDifficulty;
  onUpdateDifficulty: (newDifficulty: WeightDifficulty) => void;
};

function WeightDifficultyUpdate({
  difficulty,
  onUpdateDifficulty,
}: WeightDifficultyUpdateProps) {
  return (
    <View style={styles.difficultyUpdateContainer}>
      <NumericUpdate
        value={difficulty.weight}
        label="Weight"
        unit="lbs"
        onUpdate={(weight) => onUpdateDifficulty({ ...difficulty, weight })}
      />
      <NumericUpdate
        value={difficulty.reps}
        label="Reps"
        unit="reps"
        onUpdate={(reps) => onUpdateDifficulty({ ...difficulty, reps })}
      />
    </View>
  );
}

type BodyWeightDifficultyUpdateProps = {
  difficulty: BodyWeightDifficulty;
  onUpdateDifficulty: (newDifficulty: BodyWeightDifficulty) => void;
};

function BodyWeightDifficultyUpdate({
  difficulty,
  onUpdateDifficulty,
}: BodyWeightDifficultyUpdateProps) {
  return (
    <View style={styles.difficultyUpdateContainer}>
      <NumericUpdate
        value={difficulty.reps}
        label="Reps"
        unit="reps"
        onUpdate={(reps) => onUpdateDifficulty({ ...difficulty, reps })}
      />
    </View>
  );
}

type AssistedBodyWeightDifficultyUpdateProps = {
  difficulty: AssistedBodyWeightDifficulty;
  onUpdateDifficulty: (newDifficulty: AssistedBodyWeightDifficulty) => void;
};

function AssistedBodyWeightDifficultyUpdate({
  difficulty,
  onUpdateDifficulty,
}: AssistedBodyWeightDifficultyUpdateProps) {
  return (
    <View style={styles.difficultyUpdateContainer}>
      <NumericUpdate
        value={difficulty.assistanceWeight}
        label="Weight Assistance"
        unit="lbs"
        onUpdate={(assistanceWeight) =>
          onUpdateDifficulty({ ...difficulty, assistanceWeight })
        }
      />
      <NumericUpdate
        value={difficulty.reps}
        label="Reps"
        unit="reps"
        onUpdate={(reps) => onUpdateDifficulty({ ...difficulty, reps })}
      />
    </View>
  );
}

type TimeDifficultyUpdateProps = {
  difficulty: TimeDifficulty;
  onUpdateDifficulty: (newDifficulty: TimeDifficulty) => void;
};

function TimeDifficultyUpdate({
  difficulty,
  onUpdateDifficulty,
}: TimeDifficultyUpdateProps) {
  return (
    <View style={styles.difficultyUpdateContainer}>
      <NumericUpdate
        value={difficulty.duration}
        label="Duration"
        unit="seconds"
        onUpdate={(duration) => onUpdateDifficulty({ ...difficulty, duration })}
      />
    </View>
  );
}

type DifficultyUpdateProps = {
  type: DifficultyType;
  difficulty: Difficulty;
  onUpdateDifficulty: (newDifficulty: Difficulty) => void;
};

export function DifficultyUpdate({
  type,
  difficulty,
  onUpdateDifficulty,
}: DifficultyUpdateProps) {
  switch (type as DifficultyType) {
    case DifficultyType.WEIGHT:
      return (
        <WeightDifficultyUpdate
          difficulty={difficulty as WeightDifficulty}
          onUpdateDifficulty={onUpdateDifficulty}
        />
      );
    case DifficultyType.WEIGHTED_BODYWEIGHT:
      return (
        <WeightDifficultyUpdate
          difficulty={difficulty as WeightDifficulty}
          onUpdateDifficulty={onUpdateDifficulty}
        />
      );
    case DifficultyType.ASSISTED_BODYWEIGHT:
      return (
        <AssistedBodyWeightDifficultyUpdate
          difficulty={difficulty as AssistedBodyWeightDifficulty}
          onUpdateDifficulty={onUpdateDifficulty}
        />
      );
    case DifficultyType.BODYWEIGHT:
      return (
        <BodyWeightDifficultyUpdate
          difficulty={difficulty as BodyWeightDifficulty}
          onUpdateDifficulty={onUpdateDifficulty}
        />
      );
    case DifficultyType.TIME:
      return (
        <TimeDifficultyUpdate
          difficulty={difficulty as TimeDifficulty}
          onUpdateDifficulty={onUpdateDifficulty}
        />
      );
    default:
      return null;
  }
}

type SetStatusUpdateProps = {
  status: SetStatus;
  onToggle: () => void;
};

export function SetStatusUpdate({ status, onToggle }: SetStatusUpdateProps) {
  let statusText = "Unstarted";
  if (status === SetStatus.FINISHED) {
    statusText = "Done";
  } else if (status === SetStatus.RESTING) {
    statusText = "Resting";
  }
  statusText = statusText.padEnd(10);

  return (
    <View style={styles.updateContainer}>
      <Text _type="small" numberOfLines={1}>
        {statusText}
      </Text>
      <TouchableOpacity onPress={onToggle}>
        <View style={styles.setStatusUpdateValue}>
          {status === SetStatus.FINISHED ? (
            <Icon name="circle" size={textTheme.neutral.fontSize} />
          ) : (
            <Icon name="circle-o" size={textTheme.neutral.fontSize} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
