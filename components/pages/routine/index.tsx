import { RoutineActions } from "@/api/model/routine";
import { WorkoutApi } from "@/api/workout";
import { useThemeColoring, View, Text } from "@/components/Themed";
import { HeaderPage } from "@/components/util/header-page";
import { Routine } from "@/interface";
import { StyleUtils, TAB_BAR_HEIGHT } from "@/util/styles";
import { useNavigation } from "@react-navigation/native";
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
  const navigation = useNavigation();
  const [routines, setRoutines] = useState<Routine[]>([]);

  // todo: reload based on path
  useEffect(() => {
    WorkoutApi.getRoutines().then((savedRoutines) => {
      setRoutines(savedRoutines);
    });
  }, []);

  const onCreateRoutine = () => {
    const createdRoutine = RoutineActions.makeEmptyRoutine();
    WorkoutApi.saveRoutine(createdRoutine).then(() =>
      //@ts-ignore
      navigation.navigate("routine", { id: createdRoutine.id })
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
            onClick={(routine) => {
              //@ts-ignore
              navigation.navigate("routine", { id: routine.id });
            }}
            routines={routines}
          />
        </ScrollView>
      </HeaderPage>
    </>
  );
}
