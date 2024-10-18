import {
  AssistedBodyWeightDifficulty,
  BodyWeightDifficulty,
  Difficulty,
  DifficultyType,
  TimeDifficulty,
  WeightDifficulty,
} from "@/interface";
import { Text } from "@/components/Themed";

type WeightDifficultyTileProps = {
  difficulty: WeightDifficulty;
};

function WeightDifficultyTile({ difficulty }: WeightDifficultyTileProps) {
  const { weight, reps } = difficulty;

  return (
    <Text _type="large">
      {weight} x {reps}
    </Text>
  );
}

type BodyWeightDifficultyTileProps = {
  difficulty: BodyWeightDifficulty;
};

function BodyWeightDifficultyTile({
  difficulty,
}: BodyWeightDifficultyTileProps) {
  const { reps } = difficulty;
  return <Text _type="large">{reps}</Text>;
}

type AssistedBodyWeightDifficultyTileProps = {
  difficulty: AssistedBodyWeightDifficulty;
};

function AssistedBodyWeightDifficultyTile({
  difficulty,
}: AssistedBodyWeightDifficultyTileProps) {
  const { assistanceWeight, reps } = difficulty;
  return (
    <Text _type="large">
      -{assistanceWeight} x {reps}
    </Text>
  );
}

type TimeDifficultyTileProps = {
  difficulty: TimeDifficulty;
};

function TimeDifficultyTile({ difficulty }: TimeDifficultyTileProps) {
  const { duration } = difficulty;
  // todo: add a timer
  return <Text _type="large">{duration} seconds</Text>;
}

type DifficultyTileProps = {
  difficulty: Difficulty;
  type: DifficultyType;
};

export function DifficultyTile({ difficulty, type }: DifficultyTileProps) {
  switch (type) {
    case DifficultyType.WEIGHT:
      return (
        <WeightDifficultyTile difficulty={difficulty as WeightDifficulty} />
      );
    case DifficultyType.WEIGHTED_BODYWEIGHT:
      return (
        <WeightDifficultyTile difficulty={difficulty as WeightDifficulty} />
      );
    case DifficultyType.ASSISTED_BODYWEIGHT:
      return (
        <AssistedBodyWeightDifficultyTile
          difficulty={difficulty as AssistedBodyWeightDifficulty}
        />
      );
    case DifficultyType.BODYWEIGHT:
      return (
        <BodyWeightDifficultyTile
          difficulty={difficulty as BodyWeightDifficulty}
        />
      );
    case DifficultyType.TIME:
      return <TimeDifficultyTile difficulty={difficulty as TimeDifficulty} />;
    default:
      return null;
  }
}
