import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  LinearTransition,
  FadeInUp,
  FadeOutDown,
} from "react-native-reanimated";
import { StyleUtils } from "@/util/styles";
import { Workout } from "@/interface";
import { EditField } from "@/components/pages/workout/common";
import { useNavigation } from "@react-navigation/native";
import { WorkoutApi } from "@/api/workout";
import { useLiveWorkoutSheets } from "./sheets";

import { LiveProgress } from "@/components/workout/live";
import { SetCard, CompletionCard } from "./set-card";
import {
  useCurrentSet,
  useLiveWorkout,
} from "@/components/pages/workout/live/context";
import { SetActions, WorkoutActions, WorkoutQuery } from "@/api/model/workout";
import { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";
import { LiveWorkoutTabParamList } from ".";

const exerciseCardsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
  },
});

type ExerciseCardsProps = {
  workout: Workout;
  onEditSet?: (exerciseId: string, setId: string, field: EditField) => void;
  onAddMore: () => void;
  navigation: any;
};

function ExercisesCards({
  workout,
  onEditSet,
  onAddMore,
  navigation,
}: ExerciseCardsProps) {
  const { saveWorkout } = useLiveWorkout();
  const currentPair = useCurrentSet();

  const handleCompleteSet = (setId: string) => {
    saveWorkout((workout) => SetActions(workout!, setId).rest());
  };

  const handleSkipRest = (setId: string) => {
    saveWorkout((workout) => SetActions(workout!, setId).finish());
  };

  const nextPair = WorkoutQuery.getNextUnstartedSet(
    workout!,
    currentPair?.set.id ?? ""
  );

  const nextNextPair = WorkoutQuery.getNextUnstartedSet(
    workout!,
    nextPair?.set?.id ?? ""
  );

  // Check if all exercises are finished
  const allExercisesFinished = !nextPair && !nextNextPair;

  return (
    <Animated.View
      style={exerciseCardsStyles.container}
      layout={LinearTransition.springify().damping(20).stiffness(150)}
    >
      {/* Current Exercise Card */}
      {currentPair && (
        <Animated.View
          key={`${currentPair.set.id}`}
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(300)}
          layout={LinearTransition.springify().damping(20).stiffness(150)}
          style={exerciseCardsStyles.container}
        >
          <SetCard
            onSkipRest={() => handleSkipRest(currentPair.set.id)}
            exercise={currentPair.exercise}
            set={currentPair.set}
            onCompleteSet={handleCompleteSet}
            onUpdateWorkout={saveWorkout}
            workout={workout}
            onEditSet={onEditSet}
          />
        </Animated.View>
      )}

      {/* Next Exercise Card */}
      {nextPair && (
        <Animated.View
          key={`${nextPair.set.id}`}
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(300)}
          layout={LinearTransition.springify().damping(20).stiffness(150)}
          style={exerciseCardsStyles.container}
        >
          <SetCard
            onSkipRest={() => {}}
            exercise={nextPair.exercise}
            set={nextPair.set}
            onCompleteSet={() => {}} // No action for next card
            onUpdateWorkout={saveWorkout}
            workout={workout}
            onEditSet={onEditSet}
          />
        </Animated.View>
      )}

      {/* Next Next Exercise Card */}
      {nextNextPair && (
        <Animated.View
          key={`${nextNextPair.set.id}`}
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(300)}
          layout={LinearTransition.springify().damping(20).stiffness(150)}
          style={exerciseCardsStyles.container}
        >
          <SetCard
            onSkipRest={() => {}}
            exercise={nextNextPair.exercise}
            set={nextNextPair.set}
            onCompleteSet={() => {}} // No action for next next card
            onUpdateWorkout={saveWorkout}
            workout={workout}
            onEditSet={onEditSet}
          />
        </Animated.View>
      )}

      {/* Completion Card - Shows when all exercises are finished */}
      {allExercisesFinished && (
        <Animated.View
          key="completion-card"
          entering={FadeInUp.duration(300)}
          layout={LinearTransition.springify().damping(20).stiffness(150)}
          style={exerciseCardsStyles.container}
        >
          <CompletionCard
            workout={workout}
            onAddExercises={onAddMore}
            onFinishWorkout={() => {
              WorkoutApi.saveWorkout(WorkoutActions(workout!).finish()).then(
                () => {
                  navigation.goBack();
                  // @ts-ignore
                  navigation.navigate("completedWorkoutSheet", {
                    id: workout.id,
                  });
                  saveWorkout(undefined);
                }
              );
            }}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

type PlayerProps = MaterialTopTabScreenProps<
  LiveWorkoutTabParamList,
  "AddExercises"
>;

export function Player({ navigation: tabNavigation }: PlayerProps) {
  const navigation = useNavigation();
  const { workout } = useLiveWorkout();
  const { openEditSet } = useLiveWorkoutSheets();

  const handleEditSet = useCallback(
    (exerciseId: string, setId: string, field?: EditField) => {
      openEditSet(exerciseId, setId, field);
    },
    [openEditSet]
  );

  return (
    <>
      {workout && <LiveProgress workout={workout} />}

      {workout && (
        <ExercisesCards
          workout={workout!}
          onEditSet={handleEditSet}
          navigation={navigation}
          onAddMore={() => {
            tabNavigation.navigate("Edit");
          }}
        />
      )}
    </>
  );
}
