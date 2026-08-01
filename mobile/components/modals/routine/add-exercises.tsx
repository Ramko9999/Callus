import { useCallback, useEffect, useRef } from "react";
import { Keyboard, StyleSheet } from "react-native";
import { View } from "@/components/Themed";
import {
  ExerciseAdder,
  ExerciseAdderRef,
} from "@/components/popup/workout/common/exercise/add";
import { ExerciseMeta } from "@/interface";
import { ExercisePlanActions } from "@/api/model/routine";
import { FilterExercisesSheet } from "@/components/sheets";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { useRoutine } from "./context";
import { useRoutineSheets } from "./sheets";
import { RoutineTabParamList } from "./index";

const addExercisesStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type AddExercisesProps = MaterialTopTabScreenProps<
  RoutineTabParamList,
  "AddExercises"
>;

export function AddExercises({ navigation }: AddExercisesProps) {
  const { routine, onSave } = useRoutine();
  const {
    muscleFilters,
    exerciseTypeFilters,
    onUpdateMuscleFilters,
    onUpdateExerciseTypeFilters,
  } = useRoutineSheets();

  const filterExercisesSheetRef = useRef<BottomSheetModal>(null);
  const exerciseAdderRef = useRef<ExerciseAdderRef>(null);

  const clear = useCallback(() => {
    exerciseAdderRef.current?.clear();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", clear);

    return () => {
      navigation.removeListener("blur", unsubscribe);
    };
  }, [navigation, clear]);

  const onAddExercises = useCallback(
    (metas: ExerciseMeta[]) => {
      onSave(ExercisePlanActions(routine).add(metas));
    },
    [routine, onSave]
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
        onUpdateMuscleFilters={onUpdateMuscleFilters}
        onUpdateExerciseTypeFilters={onUpdateExerciseTypeFilters}
      />
      <FilterExercisesSheet
        ref={filterExercisesSheetRef}
        muscleFilters={muscleFilters}
        exerciseTypeFilters={exerciseTypeFilters}
        onUpdateMuscleFilters={onUpdateMuscleFilters}
        onUpdateExerciseTypeFilters={onUpdateExerciseTypeFilters}
      />
    </View>
  );
}
