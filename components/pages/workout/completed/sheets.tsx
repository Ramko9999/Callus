import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Workout, Exercise } from "@/interface";
import { WorkoutDeleteConfirmation } from "@/components/sheets/workout-delete-confirmation";
import { EditCompletedWorkout } from "@/components/sheets/edit-completed-workout";
import { RepeatWorkoutConfirmation } from "@/components/sheets/repeat-workout-confirmation";
import { ReorderExercisesSheet } from "@/components/sheets/reorder-exercises";
import { WorkoutApi } from "@/api/workout";
import { useWorkout } from "@/context/WorkoutContext";
import { useNavigation } from "@react-navigation/native";
import { WorkoutActions } from "@/api/model/workout";
import { useUserDetails } from "@/components/user-details";

type CompletedWorkoutSheetsProps = {
  workout?: Workout;
  onUpdateWorkout: (update: Partial<Workout>) => void;
};

export type CompletedWorkoutSheetsRef = {
  openDelete: () => void;
  openEdit: () => void;
  openRepeat: () => void;
  openReorderExercises: () => void;
};

export const CompletedWorkoutSheets = forwardRef<
  CompletedWorkoutSheetsRef,
  CompletedWorkoutSheetsProps
>(({ workout, onUpdateWorkout }, ref) => {
  const navigation = useNavigation();
  const { isInWorkout, actions } = useWorkout();
  const { userDetails } = useUserDetails();

  const workoutDeleteConfirmationSheetRef = useRef<any>(null);
  const editCompletedWorkoutSheetRef = useRef<any>(null);
  const repeatWorkoutConfirmationSheetRef = useRef<any>(null);
  const reorderExercisesSheetRef = useRef<any>(null);

  const [isTrashingWorkout, setIsTrashingWorkout] = useState(false);
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isReorderingExercises, setIsReorderingExercises] = useState(false);

  const openDelete = () => {
    setIsTrashingWorkout(true);
  };

  const openEdit = () => {
    setIsEditingWorkout(true);
  };

  const openRepeat = () => {
    setIsRepeating(true);
  };

  const openReorderExercises = () => {
    setIsReorderingExercises(true);
  };

  useImperativeHandle(ref, () => ({
    openDelete,
    openEdit,
    openRepeat,
    openReorderExercises,
  }));

  const handleDeleteConfirm = () => {
    setIsTrashingWorkout(false);
    if (workout) {
      WorkoutApi.deleteWorkout(workout.id).then(navigation.goBack);
    }
  };

  const handleRepeatConfirm = () => {
    if (!workout) return;
    setIsRepeating(false);

    actions.startWorkout(
      WorkoutActions.createFromWorkout(
        workout,
        userDetails?.bodyweight as number
      )
    );
    navigation.goBack();
    //@ts-ignore
    navigation.navigate("main", { screen: "liveWorkout" });
  };

  const handleWorkoutUpdate = async (
    update: Partial<{ name: string; startedAt: number; endedAt: number }>
  ) => {
    if (!workout) return;

    // Update the workout with the new data
    const updatedWorkout = { ...workout, ...update };
    onUpdateWorkout(updatedWorkout);
  };

  const handleExercisesReorder = async (newExercises: Exercise[]) => {
    if (!workout) return;

    const updatedWorkout = { ...workout, exercises: newExercises };
    onUpdateWorkout(updatedWorkout);
  };

  return (
    <>
      {workout ? (
        <>
          <WorkoutDeleteConfirmation
            ref={workoutDeleteConfirmationSheetRef}
            show={isTrashingWorkout}
            hide={() => workoutDeleteConfirmationSheetRef.current?.close()}
            onHide={() => setIsTrashingWorkout(false)}
            onDelete={handleDeleteConfirm}
          />
          <EditCompletedWorkout
            ref={editCompletedWorkoutSheetRef}
            show={isEditingWorkout}
            onHide={() => setIsEditingWorkout(false)}
            workout={workout}
            onUpdate={handleWorkoutUpdate}
            hide={() => editCompletedWorkoutSheetRef.current?.close()}
          />
          <RepeatWorkoutConfirmation
            ref={repeatWorkoutConfirmationSheetRef}
            show={isRepeating}
            hide={() => repeatWorkoutConfirmationSheetRef.current?.close()}
            onHide={() => setIsRepeating(false)}
            isInWorkout={isInWorkout}
            onRepeat={handleRepeatConfirm}
          />
          <ReorderExercisesSheet
            ref={reorderExercisesSheetRef}
            show={isReorderingExercises}
            onHide={() => setIsReorderingExercises(false)}
            exercises={workout.exercises}
            onReorder={handleExercisesReorder}
            hide={() => reorderExercisesSheetRef.current?.close()}
          />
        </>
      ) : null}
    </>
  );
});
