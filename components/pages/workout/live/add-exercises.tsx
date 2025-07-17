import { View, useThemeColoring } from "@/components/Themed";
import { useRef, useState, useCallback } from "react";
import { Keyboard, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LayoutGrid, List } from "lucide-react-native";
import { HeaderPage } from "@/components/util/header-page";
import { ExerciseAdder } from "@/components/popup/workout/common/exercise/add";
import { FilterExercises } from "@/components/sheets";
import { ExerciseMeta } from "@/interface";
import BottomSheet from "@gorhom/bottom-sheet";
import { useLiveWorkout } from "./context";
import { WorkoutActions } from "@/api/model/workout";
import { BackButton } from "../../common";

function TopActions({ isGridView, onToggleView }: { isGridView: boolean; onToggleView: () => void }) {
  return (
    <TouchableOpacity onPress={onToggleView}>
      {isGridView ? (
        <List size={24} color={useThemeColoring("primaryAction")} />
      ) : (
        <LayoutGrid size={24} color={useThemeColoring("primaryAction")} />
      )}
    </TouchableOpacity>
  );
}

const addExercisesStyles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

export function AddExercises() {
  const navigation = useNavigation();
  const { saveWorkout } = useLiveWorkout();
  const [isFiltering, setIsFiltering] = useState(false);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [exerciseTypeFilters, setExerciseTypeFilters] = useState<string[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const filterExercisesSheetRef = useRef<BottomSheet>(null);

  const onAddExercises = (metas: ExerciseMeta[]) => {
    saveWorkout((workout) => WorkoutActions(workout!).addExercises(metas));
  };

  const onShowFilters = useCallback(() => {
    setIsFiltering(true);
    Keyboard.dismiss();
  }, []);

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={{ height: "100%" }}>
      <HeaderPage
        title="Add Exercises"
        leftAction={
          <BackButton onClick={handleClose} />
        }
        rightAction={
          <TopActions
            isGridView={isGridView}
            onToggleView={() => setIsGridView((prev) => !prev)}
          />
        }
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
            isGridView={isGridView}
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
