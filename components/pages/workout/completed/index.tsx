import { createStackNavigator } from "@react-navigation/stack";
import { CompletedWorkoutInitial } from "./initial";
import { CompletedWorkoutProvider } from "./context";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { useRef, useState, useCallback } from "react";
import { Keyboard, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  LayoutGrid,
  List,
} from "lucide-react-native";
import { HeaderPage } from "@/components/util/header-page";
import { ExerciseAdder } from "@/components/popup/workout/common/exercise/add";
import { FilterExercises } from "@/components/sheets";
import { useCompletedWorkout } from "./context";
import { addExercise } from "@/context/WorkoutContext";
import { ExerciseMeta } from "@/interface";
import BottomSheet from "@gorhom/bottom-sheet";
import React from "react";

const addExercisesStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type TopActionsProps = {
  isGridView: boolean;
  onToggleView: () => void;
};

function TopActions({ isGridView, onToggleView }: TopActionsProps) {
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

export function AddExercises() {
  const navigation = useNavigation();
  const { workout, onSave } = useCompletedWorkout();
  const [isFiltering, setIsFiltering] = useState(false);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [exerciseTypeFilters, setExerciseTypeFilters] = useState<string[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const filterExercisesSheetRef = useRef<BottomSheet>(null);

  const onAddExercises = (metas: ExerciseMeta[]) => {
    let updatedWorkout = JSON.parse(JSON.stringify(workout));
    metas.forEach((meta) => {
      updatedWorkout = addExercise(meta, updatedWorkout);
    });
    onSave(updatedWorkout);
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
          <TouchableOpacity onPress={handleClose}>
            <ChevronLeft color={useThemeColoring("primaryAction")} />
          </TouchableOpacity>
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

const Stack = createStackNavigator();

export function CompletedWorkout({ route }: { route: any }) {
  return (
    <CompletedWorkoutProvider workoutId={route.params.id}>
      <Stack.Navigator
        initialRouteName="initial"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="initial" component={CompletedWorkoutInitial} />
        <Stack.Screen name="addExercises" component={AddExercises} />
      </Stack.Navigator>
    </CompletedWorkoutProvider>
  );
}
