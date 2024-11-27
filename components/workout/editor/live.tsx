import { View, Text } from "@/components/Themed";
import {
  removeExercise,
  addExercise,
  updateWorkout,
  duplicateLastSet,
  removeSet,
  updateSet,
  useWorkout,
  wrapUpSets,
  hasUnstartedSets,
  getCurrentWorkoutActivity,
} from "@/context/WorkoutContext";
import {
  Workout,
  Exercise,
  ExerciseMeta,
  WorkoutMetadata,
  Set,
} from "@/interface";
import { useState } from "react";
import {
  Done,
  Shuffle,
  Add,
  Back,
  SignificantAction,
} from "@/components/theme/actions";
import { StyleSheet, useWindowDimensions } from "react-native";
import { StyleUtils, WORKOUT_PLAYER_EDITOR_HEIGHT } from "@/util/styles";
import * as Haptics from "expo-haptics";
import { DiscardUnstartedSetsConfirmation } from "./confirmations";
import { TimestampRangeEdit } from "@/components/util/daterange-picker";
import { NAME_TO_EXERCISE_META, EXERCISE_REPOSITORY } from "@/constants";
import { ExerciseLevelEditor } from "./common/exercise";
import { ExerciseFinder } from "./common/exercise/finder";
import { SetLevelEditor } from "./common/set";
import { MetaEditor } from "./common/meta";

const liveEditorTopActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    justifyContent: "center",
    alignItems: "center",
    paddingRight: "3%",
  },
});

type LiveEditorTopActionsProps = {
  isReordering: boolean;
  onClose: () => void;
  onStartReordering: () => void;
  onDoneReordering: () => void;
  onAdd: () => void;
  onFinish: () => void;
};

function LiveEditorTopActions({
  isReordering,
  onClose,
  onStartReordering,
  onDoneReordering,
  onAdd,
  onFinish,
}: LiveEditorTopActionsProps) {
  return (
    <View style={liveEditorTopActionsStyles.container}>
      <Back onClick={onClose} />
      <View style={liveEditorTopActionsStyles.rightActions}>
        {isReordering ? (
          <Done onClick={onDoneReordering} />
        ) : (
          <Shuffle onClick={onStartReordering} />
        )}
        <Add onClick={onAdd} />
        <SignificantAction onClick={onFinish} text="Finish" />
      </View>
    </View>
  );
}

const liveSetEditorTopActionsStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
    paddingRight: "3%",
  },
});

type LiveSetEditorTopActionsProps = {
  onClose: () => void;
  onAdd: () => void;
};

function LiveSetEditorTopActions({
  onClose,
  onAdd,
}: LiveSetEditorTopActionsProps) {
  return (
    <View style={liveSetEditorTopActionsStyles.container}>
      <Back onClick={onClose} />
      <View style={liveSetEditorTopActionsStyles.rightActions}>
        <Add onClick={onAdd} />
      </View>
    </View>
  );
}

const liveEditorStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
  },
  content: {
    ...StyleUtils.flexColumn(),
  },
});

type LiveEditorProps = {
  back: () => void;
};

export function LiveEditor({ back }: LiveEditorProps) {
  const { editor } = useWorkout();
  const { updateWorkout: onSave } = editor.actions;
  const workout = editor.workout as Workout;

  const [exerciseId, setExerciseId] = useState<string>();
  const [isFinishing, setIsFinishing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditingDates, setIsEditingDate] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const isEditingExercise = exerciseId != undefined;
  const exerciseInEdit = workout.exercises.find(({ id }) => id === exerciseId);

  const { height } = useWindowDimensions();

  const onRemoveExercise = (exerciseId: string) => {
    onSave(removeExercise(exerciseId, workout));
  };

  const onAddExercise = (meta: ExerciseMeta) => {
    onSave(addExercise(meta, workout));
  };

  const onReorderExercises = (exercises: Exercise[]) => {
    onSave({ ...workout, exercises });
  };

  const onUpdateMeta = (meta: Partial<WorkoutMetadata>) => {
    onSave(updateWorkout({ ...meta }, workout));
  };

  const onAddSet = () => {
    onSave(duplicateLastSet(exerciseId as string, workout));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const onRemoveSet = (setId: string) => {
    onSave(removeSet(setId, workout));
  };

  const onUpdateSet = (setId: string, update: Partial<Set>) => {
    onSave(updateSet(setId, update, workout));
  };

  return (
    <>
      <View
        background
        style={[
          liveEditorStyles.container,
          { height: height * WORKOUT_PLAYER_EDITOR_HEIGHT },
        ]}
      >
        {isEditingExercise ? (
          <>
            <LiveSetEditorTopActions
              onAdd={onAddSet}
              onClose={() => setExerciseId(undefined)}
            />
            <View style={[liveEditorStyles.content, { paddingLeft: "3%" }]}>
              <Text extraLarge>{(exerciseInEdit as Exercise).name}</Text>
              <SetLevelEditor
                sets={(exerciseInEdit as Exercise).sets}
                currentSet={getCurrentWorkoutActivity(workout).activityData.set}
                difficultyType={
                  (
                    NAME_TO_EXERCISE_META.get(
                      (exerciseInEdit as Exercise).name
                    ) as ExerciseMeta
                  ).difficultyType
                }
                onRemove={onRemoveSet}
                onEdit={onUpdateSet}
                back={() => setExerciseId(undefined)}
              />
            </View>
          </>
        ) : (
          <>
            <LiveEditorTopActions
              isReordering={isReordering}
              onClose={back}
              onStartReordering={() => {
                setIsReordering(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              onDoneReordering={() => {
                setIsReordering(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              onAdd={() => {
                setIsSearching(true);
              }}
              onFinish={() => {
                if (hasUnstartedSets(workout)) {
                  setIsFinishing(true);
                } else {
                  onSave(wrapUpSets(workout));
                }
              }}
            />
            <View style={liveEditorStyles.content}>
              <MetaEditor
                workout={workout}
                onUpdateMeta={onUpdateMeta}
                onDateClick={() => setIsEditingDate(true)}
              />
              <ExerciseLevelEditor
                currentExerciseId={
                  getCurrentWorkoutActivity(workout).activityData.exercise?.id
                }
                isReordering={isReordering}
                exercises={workout.exercises}
                onRemove={(exerciseId) => {
                  onRemoveExercise(exerciseId);
                }}
                onEdit={(exercise) => {
                  setExerciseId(exercise.id);
                }}
                onReorder={(exercises) => onReorderExercises(exercises)}
              />
            </View>
            <ExerciseFinder
              show={isSearching}
              hide={() => setIsSearching(false)}
              repository={EXERCISE_REPOSITORY}
              onSelect={(meta) => {
                onAddExercise(meta);
                setIsSearching(false);
              }}
            />
            <ExerciseFinder
              show={isSearching}
              hide={() => setIsSearching(false)}
              repository={EXERCISE_REPOSITORY}
              onSelect={(meta) => {
                onAddExercise(meta);
                setIsSearching(false);
              }}
            />

            <DiscardUnstartedSetsConfirmation
              show={isFinishing}
              hide={() => setIsFinishing(false)}
              onDiscard={() => {
                onSave(wrapUpSets(workout));
                setIsFinishing(false);
              }}
            />
            <TimestampRangeEdit
              show={isEditingDates}
              hide={() => setIsEditingDate(false)}
              range={{ startedAt: workout.startedAt, endedAt: workout.endedAt }}
              onUpdate={(range) => onUpdateMeta(range)}
            />
          </>
        )}
      </View>
    </>
  );
}
