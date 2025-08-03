import { View } from "@/components/Themed";
import { useRef, useState, useCallback } from "react";
import { Keyboard, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { HeaderPage } from "@/components/util/header-page";
import { ExerciseAdder } from "@/components/popup/workout/common/exercise/add";
import { FilterExercises } from "@/components/sheets";
import { useCompletedWorkout } from "./context";
import { WorkoutActions } from "@/api/model/workout";
import { ExerciseMeta } from "@/interface";
import BottomSheet from "@gorhom/bottom-sheet";
import React from "react";
import { BackButton, PlusButton } from "../../common";

const addExercisesStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export function AddExercises() {
  const navigation = useNavigation();
  const { workout, onSave } = useCompletedWorkout();
  const [isFiltering, setIsFiltering] = useState(false);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [exerciseTypeFilters, setExerciseTypeFilters] = useState<string[]>([]);
  const filterExercisesSheetRef = useRef<BottomSheet>(null);

  const onAddExercises = (metas: ExerciseMeta[]) => {
    if (workout) {
      const updatedWorkout = WorkoutActions(workout).addExercises(metas);
      onSave(updatedWorkout);
    }
  };

  const onShowFilters = useCallback(() => {
    setIsFiltering(true);
    Keyboard.dismiss();
  }, []);

  const handleClose = () => {
    navigation.goBack();
  };

  const onAddCustomExercise = () => {
    // @ts-ignore
    navigation.navigate("createExerciseSheet");
  };

  return (
    <View style={{ height: "100%" }}>
      <HeaderPage
        title="Add Exercises"
        leftAction={<BackButton onClick={handleClose} />}
        rightAction={<PlusButton onClick={onAddCustomExercise} />}
      >
        <View style={addExercisesStyles.container}>
          <ExerciseAdder
            onClose={handleClose}
            onAdd={onAddExercises}
            muscleFilters={muscleFilters}
            exerciseTypeFilters={exerciseTypeFilters}
            onShowFilters={onShowFilters}
            onUpdateMuscleFilters={setMuscleFilters}
            onUpdateExerciseTypeFilters={setExerciseTypeFilters}
          />
        </View>
      </HeaderPage>
      <FilterExercises
        ref={filterExercisesSheetRef}
        show={isFiltering}
        hide={() => filterExercisesSheetRef.current?.close()}
        onHide={() => setIsFiltering(false)}
        muscleFilters={muscleFilters}
        exerciseTypeFilters={exerciseTypeFilters}
        onUpdateMuscleFilters={setMuscleFilters}
        onUpdateExerciseTypeFilters={setExerciseTypeFilters}
      />
    </View>
  );
}
