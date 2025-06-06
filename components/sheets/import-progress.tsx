import { StyleSheet } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import { commonSheetStyles, SheetProps, SheetX, SheetError } from "./common";
import { TouchableOpacity } from "react-native";
import { useCallback, useEffect, forwardRef, ForwardedRef, useState, useRef } from "react";
import React from "react";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { convertHexToRGBA, tintColor } from "@/util/color";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import BottomSheet from "@gorhom/bottom-sheet";
import { WorkoutApi } from "@/api/workout";
import { Workout, Routine } from "@/interface";

const importProgressStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingBottom: "10%",
  },
  content: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
    paddingHorizontal: "5%",
    gap: 20,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
});

enum ImportEntity {
  Workouts = "workouts",
  Routines = "routines",
}

type ImportProgressState = {
  entity: ImportEntity;
  isComplete: boolean;
  error?: string;
  current: number;
  total: number;
  stats: {
    workouts: number;
    routines: number;
  };
};

function getProgressText(state: ImportProgressState): string {
  if (state.isComplete) {
    const { workouts, routines } = state.stats;
    if (workouts === 0 && routines === 0) {
      return "There weren't any workouts or routines to import.";
    }
    const parts: string[] = [];
    if (workouts > 0) parts.push(`${workouts} workout${workouts === 1 ? '' : 's'}`);
    if (routines > 0) parts.push(`${routines} routine${routines === 1 ? '' : 's'}`);
    return `Successfully imported ${parts.join(' and ')}`;
  }

  return `Importing ${state.current} of ${state.total} ${state.entity}`;
}

type ImportProgressProps = SheetProps & {
  fileUri: string;
};

export const ImportProgressSheet = forwardRef(
  (
    { show, hide, onHide, fileUri }: ImportProgressProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    const progress = useSharedValue(0);
    const [importState, setImportState] = useState<ImportProgressState>({
      entity: ImportEntity.Workouts,
      isComplete: false,
      current: 0,
      total: 0,
      stats: { workouts: 0, routines: 0 },
    });
    const isCancelled = useRef(false);

    const actionColor = useThemeColoring("primaryAction");
    const progressColor = tintColor(actionColor, 0.5);
    const progressStoppedColor = convertHexToRGBA(useThemeColoring("primaryText"), 0.3);
    const progressContainerColor = tintColor(
        useThemeColoring("primaryViewBackground"),
        0.05
      );

    const progressStyle = useAnimatedStyle(() => {
      return {
        width: `${progress.value * 100}%`,
        backgroundColor: importState.error 
          ? withSpring(progressStoppedColor)
          : importState.isComplete
          ? withSpring(actionColor)
          : withSpring(progressColor),
      };
    }, [importState.isComplete, importState.error, actionColor, progressColor]);

    const importWorkouts = useCallback(async (workouts: Workout[]): Promise<void> => {
      setImportState(prev => ({
        ...prev,
        entity: ImportEntity.Workouts,
        total: workouts.length,
        current: 0,
      }));
      
      for (let i = 0; i < workouts.length; i++) {
        if (isCancelled.current) break;

        await WorkoutApi.saveWorkout(workouts[i]);
        
        setImportState(prev => ({
          ...prev,
          current: i + 1,
        }));
        progress.value = withTiming((i + 1) / workouts.length, { duration: 100 });
      }
    }, []);

    const importRoutines = useCallback(async (routines: Routine[]): Promise<void> => {
      setImportState(prev => ({
        ...prev,
        entity: ImportEntity.Routines,
        total: routines.length,
        current: 0,
      }));
      progress.value = 0;
      
      for (let i = 0; i < routines.length; i++) {
        if (isCancelled.current) break;
        await WorkoutApi.saveRoutine(routines[i]);
        
        setImportState(prev => ({
          ...prev,
          current: i + 1,
        }));
        progress.value = withTiming((i + 1) / routines.length, { duration: 100 });
      }
    }, []);

    const handleImport = useCallback(async () => {
      try {
        const content = await FileSystem.readAsStringAsync(fileUri);
        let { workouts, routines } = JSON.parse(content);
        routines = []
        
        const workoutsLength = workouts?.length ?? 0;
        const routinesLength = routines?.length ?? 0;

        setImportState(prev => ({
          ...prev,
          error: undefined,
          stats: { workouts: workoutsLength, routines: routinesLength },
        }));

        if (workoutsLength > 0) {
          await importWorkouts(workouts);
        }

        if (routinesLength > 0) {
          await importRoutines(routines);
        }
        
        if (!isCancelled.current) {
          setImportState(prev => ({
            ...prev,
            isComplete: true,
          }));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        console.error("Import failed:", error);
        setImportState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to import data. Please check the file format and try again.",
        }));
      }
    }, [fileUri, importWorkouts, importRoutines]);

    const handleOnHide = useCallback(() => {
      if (!importState.isComplete && !importState.error) {
        isCancelled.current = true;
      }
      onHide();
    }, [importState.isComplete, importState.error, onHide]);

    useEffect(() => {
      if (show && fileUri) {
        isCancelled.current = false;
        setImportState({
          entity: ImportEntity.Workouts,
          isComplete: false,
          current: 0,
          total: 0,
          stats: { workouts: 0, routines: 0 },
        });
        progress.value = 0;
        handleImport();
      }
    }, [show, fileUri, handleImport]);

    return (
      <PopupBottomSheet ref={ref} show={show} onHide={handleOnHide}>
        <View style={importProgressStyles.container}>
          <View style={commonSheetStyles.sheetHeader}>
            <Text action style={{ fontWeight: 600 }}>
              Importing data...
            </Text>
            <TouchableOpacity onPress={hide}>
              <SheetX />
            </TouchableOpacity>
          </View>
          <View style={importProgressStyles.content}>
            {importState.error ? (
              <SheetError text={importState.error} />
            ) : (
              <Text neutral light>
                {importState.isComplete
                  ? "Import complete! You can now close this sheet."
                  : "Don't close the sheet while import is in progress..."}
              </Text>
            )}
            <View style={[importProgressStyles.progressBarContainer, { backgroundColor: progressContainerColor }]}>
              <Animated.View style={[importProgressStyles.progressBar, progressStyle]} />
            </View>
            <Text neutral light>
              {getProgressText(importState)}
            </Text>
          </View>
        </View>
      </PopupBottomSheet>
    );
  }
);
