import { RoutineActions } from "@/api/model/routine";
import { WorkoutActions } from "@/api/model/workout";
import { WorkoutApi } from "@/api/workout";
import { RoutineEditorSheet } from "@/components/popup/routine";
import { useLiveIndicator } from "@/components/popup/workout/live";
import { Add } from "@/components/theme/actions";
import { useThemeColoring, View, Text } from "@/components/Themed";
import { DynamicHeaderPage } from "@/components/util/dynamic-header-page";
import { useTabBar } from "@/components/util/tab-bar/context";
import { textTheme } from "@/constants/Themes";
import { useWorkout } from "@/context/WorkoutContext";
import { Routine } from "@/interface";
import { PLACEHOLDER_ROUTINE } from "@/util/mock";
import { StyleUtils } from "@/util/styles";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

const savedRoutineStyles = StyleSheet.create({
  container: {
    paddingHorizontal: "3%",
    paddingVertical: "3%",
    ...StyleUtils.flexColumn(),
  },
  exercises: {
    ...StyleUtils.flexColumn(5),
  },
  summary: {
    ...StyleUtils.flexRow(10),
    paddingTop: "1%",
  },
});

type SavedRoutineProps = {
  onClick: () => void;
  routine: Routine;
};

function SavedRoutine({ onClick, routine }: SavedRoutineProps) {
  return (
    <TouchableOpacity
      style={[
        savedRoutineStyles.container,
        { backgroundColor: useThemeColoring("primaryViewBackground") },
      ]}
      onPress={onClick}
    >
      <Text neutral>{routine.name}</Text>
      <View style={savedRoutineStyles.summary}>
        <Text light>{`${routine.plan.length} exercises`}</Text>
      </View>
    </TouchableOpacity>
  );
}

const savedRoutinesStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
  },
});

type SavedRoutinesProps = {
  onClick: (routine: Routine) => void;
  routines: Routine[];
};

function SavedRoutines({ onClick, routines }: SavedRoutinesProps) {
  return (
    <View style={savedRoutinesStyles.container}>
      {routines.map((routine, index) => (
        <SavedRoutine
          onClick={() => onClick(routine)}
          routine={routine}
          key={index}
        />
      ))}
    </View>
  );
}

const routinesStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  header: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "baseline",
  },
});

export function Routines() {
  const tabBarActions = useTabBar();
  const liveIndicatorActions = useLiveIndicator();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine>();
  const { actions, isInWorkout } = useWorkout();

  useEffect(() => {
    if (selectedRoutine) {
      tabBarActions.close();
      liveIndicatorActions.hide();
    } else {
      tabBarActions.open();
      liveIndicatorActions.show();
    }

    WorkoutApi.getRoutines().then((savedRoutines) => {
      setRoutines(savedRoutines);
    });
  }, [selectedRoutine]);

  const onCreateRoutine = () => {
    const createdRoutine = RoutineActions.makeEmptyRoutine();
    WorkoutApi.saveRoutine(createdRoutine).then(() =>
      setSelectedRoutine(createdRoutine)
    );
  };

  return (
    <>
      <DynamicHeaderPage
        title={"Routines"}
        renderLargeHeader={
          <View style={routinesStyles.header}>
            <Text emphasized extraLarge>
              Routines
            </Text>
            <Add
              iconSize={textTheme.extraLarge.fontSize}
              onClick={onCreateRoutine}
            />
          </View>
        }
      >
        <View style={routinesStyles.container}>
          <SavedRoutines
            onClick={(routine) => setSelectedRoutine(routine)}
            routines={routines}
          />
        </View>
      </DynamicHeaderPage>
      <RoutineEditorSheet
        show={selectedRoutine != undefined}
        onHide={() => setSelectedRoutine(undefined)}
        routine={selectedRoutine ?? PLACEHOLDER_ROUTINE}
        canStart={!isInWorkout}
        onStart={() =>
          actions.startWorkout(
            WorkoutActions.createFromRoutine(selectedRoutine as Routine)
          )
        }
        onSave={(routine) =>
          WorkoutApi.saveRoutine(routine).then(() =>
            setSelectedRoutine(routine)
          )
        }
        onTrash={() =>
          WorkoutApi.deleteRoutine((selectedRoutine as Routine).id)
        }
      />
    </>
  );
}
