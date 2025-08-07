import { View } from "@/components/Themed";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import {
  ExerciseAdder,
  ExerciseAdderRef,
} from "@/components/popup/workout/common/exercise/add";
import { ExerciseMeta } from "@/interface";
import { useLiveWorkout } from "./context";
import { WorkoutActions } from "@/api/model/workout";
import { FilterExercisesSheet } from "@/components/sheets";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { LiveWorkoutTabParamList } from ".";

const addExercisesStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type AddExercisesProps = MaterialTopTabScreenProps<
  LiveWorkoutTabParamList,
  "AddExercises"
>;

export function AddExercises({ navigation }: AddExercisesProps) {
  const { saveWorkout } = useLiveWorkout();

  const filterExercisesSheetRef = useRef<BottomSheetModal>(null);
  const exerciseAdderRef = useRef<ExerciseAdderRef>(null);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [exerciseTypeFilters, setExerciseTypeFilters] = useState<string[]>([]);

  const clear = useCallback(() => {
    exerciseAdderRef.current?.clear();
    setMuscleFilters([]);
    setExerciseTypeFilters([]);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", clear);

    return () => {
      navigation.removeListener("blur", unsubscribe);
    };
  }, [navigation, clear]);

  const onAddExercises = useCallback(
    (metas: ExerciseMeta[]) => {
      saveWorkout((workout) => WorkoutActions(workout!).addExercises(metas));
    },
    [saveWorkout]
  );

  const onShowFilters = useCallback(() => {
    filterExercisesSheetRef.current?.present();
    Keyboard.dismiss();
  }, []);

  const handleClose = useCallback(() => {
    navigation.navigate("Edit");
  }, [navigation]);

  return (
    <View style={addExercisesStyles.container}>
      <ExerciseAdder
        ref={exerciseAdderRef}
        onClose={handleClose}
        onAdd={onAddExercises}
        muscleFilters={muscleFilters}
        exerciseTypeFilters={exerciseTypeFilters}
        onShowFilters={onShowFilters}
        onUpdateMuscleFilters={setMuscleFilters}
        onUpdateExerciseTypeFilters={setExerciseTypeFilters}
      />
      <FilterExercisesSheet
        ref={filterExercisesSheetRef}
        muscleFilters={muscleFilters}
        exerciseTypeFilters={exerciseTypeFilters}
        onUpdateMuscleFilters={setMuscleFilters}
        onUpdateExerciseTypeFilters={setExerciseTypeFilters}
      />
    </View>
  );
}
