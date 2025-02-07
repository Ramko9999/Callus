import { RoutineActions } from "@/api/model/routine";
import { WorkoutActions } from "@/api/model/workout";
import { WorkoutApi } from "@/api/workout";
import { useDebounce } from "@/components/hooks/use-debounce";
import { RoutineEditorSheet } from "@/components/popup/routine";
import { useLiveIndicator } from "@/components/popup/workout/live";
import { useThemeColoring, View, Text } from "@/components/Themed";
import { useUserDetails } from "@/components/user-details";
import { HeaderPage } from "@/components/util/header-page";
import { useTabBar } from "@/components/util/tab-bar/context";
import { useWorkout } from "@/context/WorkoutContext";
import { Routine } from "@/interface";
import { PLACEHOLDER_ROUTINE } from "@/util/mock";
import { StyleUtils, TAB_BAR_HEIGHT } from "@/util/styles";
import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

const savedRoutineStyles = StyleSheet.create({
  container: {
    paddingHorizontal: "3%",
    paddingVertical: "3%",
    borderRadius: 10,
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
    ...StyleUtils.flexColumn(10),
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

type CreateRoutineActionProps = {
  onClick: () => void;
};

function CreateRoutineAction({ onClick }: CreateRoutineActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <Plus color={useThemeColoring("primaryAction")} />
    </TouchableOpacity>
  );
}

const routinesStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingBottom: TAB_BAR_HEIGHT,
  },
  scroll: {
    flex: 1,
    marginTop: "3%",
    paddingHorizontal: "3%",
  },
});

export function Routines() {
  const tabBarActions = useTabBar();
  const liveIndicatorActions = useLiveIndicator();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine>();
  const { actions, isInWorkout } = useWorkout();
  const { userDetails } = useUserDetails();
  const { invoke } = useDebounce({ delay: 200 });

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
      <HeaderPage
        title={"Routines"}
        rightAction={<CreateRoutineAction onClick={onCreateRoutine} />}
      >
        <ScrollView
          style={routinesStyles.scroll}
          contentContainerStyle={routinesStyles.container}
        >
          <SavedRoutines
            onClick={(routine) => setSelectedRoutine(routine)}
            routines={routines}
          />
        </ScrollView>
      </HeaderPage>
      <RoutineEditorSheet
        show={selectedRoutine != undefined}
        onHide={() => setSelectedRoutine(undefined)}
        routine={selectedRoutine ?? PLACEHOLDER_ROUTINE}
        canStart={!isInWorkout}
        onStart={() =>
          actions.startWorkout(
            WorkoutActions.createFromRoutine(
              selectedRoutine as Routine,
              userDetails?.bodyweight as number
            )
          )
        }
        onSave={(routine) => {
          setSelectedRoutine(routine);
          //@ts-ignore
          invoke(WorkoutApi.saveRoutine)(routine);
        }}
        onTrash={() =>
          WorkoutApi.deleteRoutine((selectedRoutine as Routine).id)
        }
      />
    </>
  );
}
