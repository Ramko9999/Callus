import { StyleUtils } from "@/util/styles";
import { SimpleModal } from "../../common";
import {
  StyleSheet,
  View as DefaultView,
  TouchableOpacity,
} from "react-native";
import { View, Text } from "@/components/Themed";
import React, { useEffect, useRef, useState } from "react";
import { Popover, PopoverAnchor } from "@/components/util/popup/popover";
import { DISPLAY_EXERCISE_TYPES, MUSCLE_GROUPS } from "@/api/exercise";
import { ExercisesFilterDropdown } from "./dropdown";

const FILTER_WIDTH = 100;

const exercisesFilterStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(15),
  },
  filter: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
  },
});

type ExercisesFilterProps = {
  show: boolean;
  hide: () => void;
  muscleFilter?: string;
  exerciseTypeFilter?: string;
  onUpdateMuscleFilter: (filter?: string) => void;
  onUpdateExerciseTypeFilter: (filter?: string) => void;
};

export function ExercisesFilter({
  show,
  hide,
  muscleFilter,
  exerciseTypeFilter,
  onUpdateMuscleFilter,
  onUpdateExerciseTypeFilter,
}: ExercisesFilterProps) {
  const muscleFilterRef = useRef<DefaultView>(null);
  const exerciseTypeFilterRef = useRef<DefaultView>(null);

  const [showMuscleFilter, setShowMuscleFilter] = useState(false);
  const [showExercisesFilter, setShowExercisesFilter] = useState(false);

  const [muscleFilterAnchor, setMuscleFilterAnchor] = useState<PopoverAnchor>({
    x: 0,
    y: 0,
  });
  const [exercisesFilterAnchor, setExercisesFilterAnchor] =
    useState<PopoverAnchor>({ x: 0, y: 0 });

  useEffect(() => {
    if (show) {
      muscleFilterRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setMuscleFilterAnchor({
          x: pageX + width - FILTER_WIDTH,
          y: pageY,
        });
      });

      exerciseTypeFilterRef.current?.measure(
        (x, y, width, height, pageX, pageY) => {
          setExercisesFilterAnchor({
            x: pageX + width - FILTER_WIDTH,
            y: pageY,
          });
        }
      );
    }
  }, [show]);

  return (
    <>
      <SimpleModal
        show={show}
        onHide={hide}
        title="Filter exercises?"
        description="Filter exercises by muscle group or exercise type"
      >
        <View style={exercisesFilterStyles.container}>
          <View style={exercisesFilterStyles.filter} ref={muscleFilterRef}>
            <Text>Muscle</Text>
            <TouchableOpacity onPress={() => setShowMuscleFilter(true)}>
              <Text light>{muscleFilter ?? "All"}</Text>
            </TouchableOpacity>
          </View>
          <View
            style={exercisesFilterStyles.filter}
            ref={exerciseTypeFilterRef}
          >
            <Text>Exercise Type</Text>
            <TouchableOpacity onPress={() => setShowExercisesFilter(true)}>
              <Text light>{exerciseTypeFilter ?? "All"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SimpleModal>
      <Popover
        show={showMuscleFilter}
        onHide={() => setShowMuscleFilter(false)}
        anchor={muscleFilterAnchor}
        contentStyle={{ width: FILTER_WIDTH }}
      >
        <ExercisesFilterDropdown
          selectedValue={muscleFilter}
          values={MUSCLE_GROUPS}
          onSelect={(value) => {
            onUpdateMuscleFilter(value);
            setShowMuscleFilter(false);
          }}
          onDeselect={() => {
            onUpdateMuscleFilter(undefined);
            setShowMuscleFilter(false);
          }}
        />
      </Popover>
      <Popover
        show={showExercisesFilter}
        onHide={() => setShowExercisesFilter(false)}
        anchor={exercisesFilterAnchor}
        contentStyle={{ width: FILTER_WIDTH }}
      >
        <ExercisesFilterDropdown
          selectedValue={exerciseTypeFilter}
          values={DISPLAY_EXERCISE_TYPES}
          onSelect={(value) => {
            onUpdateExerciseTypeFilter(value);
            setShowExercisesFilter(false);
          }}
          onDeselect={() => {
            onUpdateExerciseTypeFilter(undefined);
            setShowExercisesFilter(false);
          }}
        />
      </Popover>
    </>
  );
}
