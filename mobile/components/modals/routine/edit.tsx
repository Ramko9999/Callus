import React, { useCallback, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSharedValue } from "react-native-reanimated";
import { Info, StickyNote, Shuffle, Clock, Trash2, Plus } from "lucide-react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { Popover, PopoverItem, PopoverRef } from "@/components/util/popover";
import { StyleUtils } from "@/util/styles";
import { tintColor } from "@/util/color";
import { NoExercises } from "@/components/workout/no-exercises";
import { SharedExerciseCard } from "@/components/workout/exercise-card";
import { SetRow, EditField } from "@/components/pages/workout/common";
import { ExercisePlan } from "@/interface";
import { ExercisePlanActions, SetPlanActions } from "@/api/model/routine";
import { ExerciseStoreSelectors, useExercisesStore } from "@/components/store";
import { exercisePlanToExercise } from "@/util/workout/routine-adapter";
import { getHistoricalExerciseDescription } from "@/util/workout/display";
import { useRoutine } from "./context";
import { useRoutineSheets } from "./sheets";

const editRoutineStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: "3%",
  },
  addExerciseButton: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "3%",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: "1%",
  },
  addExerciseText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: "2%",
  },
});

type ExercisePlanCardProps = {
  plan: ExercisePlan;
  onMorePress: (exercisePlanId: string, ref: React.RefObject<any>) => void;
  onEditSet: (setId: string, field: EditField) => void;
};

function ExercisePlanCard({
  plan,
  onMorePress,
  onEditSet,
}: ExercisePlanCardProps) {
  const navigation = useNavigation();
  const { routine, onSave } = useRoutine();
  const { openAddNote } = useRoutineSheets();
  const moreButtonRef = useRef<any>(null);

  const difficultyType = useExercisesStore(
    (state) =>
      ExerciseStoreSelectors.getExercise(plan.metaId, state).difficultyType
  );
  const exerciseName = useExercisesStore(
    (state) => ExerciseStoreSelectors.getExercise(plan.metaId, state).name
  );

  const handleMorePress = useCallback(() => {
    onMorePress(plan.id, moreButtonRef);
  }, [onMorePress, plan.id]);

  const handleNotePress = useCallback(() => {
    openAddNote(plan.id);
  }, [openAddNote, plan.id]);

  const handleOpenExercise = useCallback(() => {
    // @ts-ignore
    navigation.navigate("exerciseInsightSheet", { id: plan.metaId });
  }, [navigation, plan.metaId]);

  const handleAddSet = useCallback(() => {
    onSave(SetPlanActions(routine, plan.id).add());
  }, [routine, onSave, plan.id]);

  const exercise = exercisePlanToExercise(plan);

  return (
    <SharedExerciseCard
      metaId={plan.metaId}
      name={exerciseName}
      description={getHistoricalExerciseDescription({
        difficulties: plan.sets.map((set) => set.difficulty),
        difficultyType,
      })}
      note={plan.note}
      difficultyType={difficultyType}
      sets={exercise.sets}
      showStatus={false}
      moreButtonRef={moreButtonRef}
      onMorePress={handleMorePress}
      onNotePress={handleNotePress}
      onOpenExercise={handleOpenExercise}
      onAddSet={handleAddSet}
      renderSetRow={(set, index) => (
        <SetRow
          set={set}
          index={index}
          useAltBackground={index % 2 === 1}
          difficultyType={difficultyType}
          showStatus={false}
          showSwipeActions
          onEdit={onEditSet}
          onDelete={(setId) =>
            onSave(SetPlanActions(routine, plan.id).remove(setId))
          }
        />
      )}
    />
  );
}

export function EditRoutine() {
  const navigation = useNavigation();
  const { routine, onSave } = useRoutine();
  const { openEditSet, openEditRest, openAddNote, openReorderExercises } =
    useRoutineSheets();

  const popoverRef = useRef<PopoverRef>(null);
  const containerRef = useRef<RNView>(null);
  const containerYRef = useRef<number | undefined>(undefined);
  const popoverProgress = useSharedValue(0);
  const [popoverExercisePlanId, setPopoverExercisePlanId] = useState<
    string | null
  >(null);

  const dangerActionColor = useThemeColoring("dangerAction");
  const neutralTextColor = useThemeColoring("primaryText");
  const primaryActionColor = useThemeColoring("primaryAction");
  const borderColor = tintColor(useThemeColoring("appBackground"), 0.1);

  const handleLayout = useCallback(() => {
    containerRef.current?.measure(
      (x: any, y: any, width: any, height: any, pageX: any, pageY: any) => {
        containerYRef.current = pageY;
      }
    );
  }, []);

  const handleMorePress = useCallback(
    (exercisePlanId: string, ref: React.RefObject<any>) => {
      setPopoverExercisePlanId(exercisePlanId);
      if (ref.current && containerYRef.current !== undefined) {
        ref.current.measure(
          (x: any, y: any, width: any, height: any, pageX: any, pageY: any) => {
            popoverRef.current?.open(
              pageX + width + 5,
              pageY + 20 - (containerYRef.current as number)
            );
          }
        );
      }
    },
    []
  );

  const handleAddExercises = useCallback(() => {
    // @ts-ignore
    navigation.navigate("AddExercises");
  }, [navigation]);

  const handleViewExercise = () => {
    popoverRef.current?.close();
    if (popoverExercisePlanId) {
      const plan = routine.plan.find(({ id }) => id === popoverExercisePlanId);
      if (plan) {
        // @ts-ignore
        navigation.navigate("exerciseInsightSheet", { id: plan.metaId });
      }
    }
    setPopoverExercisePlanId(null);
  };

  const handleEditNote = () => {
    popoverRef.current?.close();
    if (popoverExercisePlanId) {
      openAddNote(popoverExercisePlanId);
    }
    setPopoverExercisePlanId(null);
  };

  const handleReorder = () => {
    popoverRef.current?.close();
    openReorderExercises();
    setPopoverExercisePlanId(null);
  };

  const handleEditRest = () => {
    popoverRef.current?.close();
    if (popoverExercisePlanId) {
      openEditRest(popoverExercisePlanId);
    }
    setPopoverExercisePlanId(null);
  };

  const handleRemoveExercise = () => {
    if (popoverExercisePlanId) {
      onSave(ExercisePlanActions(routine).remove(popoverExercisePlanId));
    }
    popoverRef.current?.close();
    setPopoverExercisePlanId(null);
  };

  return (
    <View
      ref={containerRef}
      style={editRoutineStyles.container}
      onLayout={handleLayout}
    >
      <ScrollView
        style={editRoutineStyles.scrollContainer}
        contentContainerStyle={{ paddingBottom: "30%" }}
        showsVerticalScrollIndicator={false}
      >
        {routine.plan.length === 0 ? (
          <NoExercises
            message="No exercises in this routine"
            onAdd={handleAddExercises}
          />
        ) : (
          routine.plan.map((plan) => (
            <ExercisePlanCard
              key={plan.id}
              plan={plan}
              onMorePress={handleMorePress}
              onEditSet={(setId, field) => openEditSet(plan.id, setId, field)}
            />
          ))
        )}
        {routine.plan.length > 0 && (
          <TouchableOpacity
            style={[editRoutineStyles.addExerciseButton, { borderColor }]}
            onPress={handleAddExercises}
          >
            <Plus size={16} color={primaryActionColor} />
            <Text
              style={[
                editRoutineStyles.addExerciseText,
                { color: primaryActionColor },
              ]}
            >
              Add Exercise
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Popover ref={popoverRef} progress={popoverProgress}>
        <PopoverItem
          label="View Exercise"
          icon={<Info size={20} color={neutralTextColor} />}
          onClick={handleViewExercise}
        />
        <PopoverItem
          label="Edit Note"
          icon={<StickyNote size={20} color={neutralTextColor} />}
          onClick={handleEditNote}
        />
        <PopoverItem
          label="Reorder Exercises"
          icon={<Shuffle size={20} color={neutralTextColor} />}
          onClick={handleReorder}
        />
        <PopoverItem
          label="Edit Rest"
          icon={<Clock size={20} color={neutralTextColor} />}
          onClick={handleEditRest}
        />
        <PopoverItem
          label={
            <Text style={{ color: dangerActionColor }}>Remove Exercise</Text>
          }
          icon={<Trash2 size={20} color={dangerActionColor} />}
          onClick={handleRemoveExercise}
        />
      </Popover>
    </View>
  );
}
