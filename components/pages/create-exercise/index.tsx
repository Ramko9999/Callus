import { useNavigation } from "@react-navigation/native";
import { ModifyExercise } from "@/components/exercise/modify-exercise";
import { DifficultyType } from "@/interface";
import { generateCustomExerciseId } from "@/api/model/util";

export function CreateExercise() {
  const navigation = useNavigation();

  const defaultExerciseMeta = {
    metaId: generateCustomExerciseId(),
    name: "",
    description: "",
    difficultyType: DifficultyType.WEIGHT,
    primaryMuscles: [],
    secondaryMuscles: [],
    image: undefined,
  };

  return (
    <ModifyExercise
      exerciseMeta={defaultExerciseMeta}
      onBack={navigation.goBack}
      title="Create Exercise"
      isEditingCreatedExercise={false}
    />
  );
}
