import { useNavigation, useRoute } from "@react-navigation/native";
import { ExerciseStoreSelectors, useExercisesStore } from "@/components/store";
import { ModifyExercise } from "@/components/exercise/modify-exercise";

type RouteParams = {
  id: string;
};

export function EditExercise() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id: exerciseId } = route.params as RouteParams;

  const exerciseMeta = useExercisesStore((state) =>
    ExerciseStoreSelectors.getExercise(exerciseId, state)
  );

  return (
    <ModifyExercise
      exerciseMeta={exerciseMeta}
      isEditingCreatedExercise={true}
      onBack={navigation.goBack}
      title={`Edit ${exerciseMeta.name}`}
    />
  );
}
