import React, { useEffect } from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import {
  Set,
  DifficultyType,
  SetStatus,
  TimeDifficulty,
  BodyWeightDifficulty,
  WeightDifficulty,
} from "@/interface";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import { getDurationDisplay } from "@/util/date";
import { AnimatedStyle } from "react-native-reanimated";
import { tintColor } from "@/util/color";
import { Check } from "lucide-react-native";

export type EditField = "weight" | "reps" | "time";

function getSetRowValues(
  set: Set,
  index: number,
  difficultyType: DifficultyType
) {
  if (
    difficultyType === DifficultyType.WEIGHT ||
    difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT
  ) {
    const diff = set.difficulty as WeightDifficulty;
    return [
      index + 1,
      diff.weight,
      diff.reps,
      set.status !== SetStatus.UNSTARTED,
    ];
  } else if (
    difficultyType === DifficultyType.BODYWEIGHT ||
    difficultyType === DifficultyType.ASSISTED_BODYWEIGHT
  ) {
    const diff = set.difficulty as BodyWeightDifficulty;
    return [index + 1, diff.reps, set.status !== SetStatus.UNSTARTED];
  } else if (difficultyType === DifficultyType.TIME) {
    const diff = set.difficulty as TimeDifficulty;
    return [
      index + 1,
      getDurationDisplay(diff.duration),
      set.status !== SetStatus.UNSTARTED,
    ];
  }
  return [index + 1, set.status !== SetStatus.UNSTARTED];
}

const setStatusInputStyles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
  check: {
    ...StyleUtils.flexRowCenterAll(),
    borderRadius: 12,
    height: 35,
    width: 40,
  },
});

type SetStatusInputProps = {
  isActive: boolean;
  onToggle: (event: GestureResponderEvent) => void;
};

export function SetStatusInput({ isActive, onToggle }: SetStatusInputProps) {
  const setColor = useSharedValue(isActive ? 1 : 0);
  const inactiveColor = tintColor(useThemeColoring("appBackground"), 0.1);
  const activeColor = useThemeColoring("primaryAction");

  useEffect(() => {
    setColor.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        setColor.value,
        [0, 1],
        [inactiveColor, activeColor]
      ),
    }),
    []
  );

  return (
    <TouchableOpacity onPress={onToggle} style={setStatusInputStyles.container}>
      <Animated.View style={[setStatusInputStyles.check, animatedStyle]}>
        <Check
          color={useThemeColoring("primaryText")}
          strokeWidth={3}
          size={16}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const commonSetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    marginBottom: "1.5%",
  },
  setNumber: {
    ...StyleUtils.flexRowCenterAll(),
    width: "15%",
  },
  difficulty: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    width: "70%",
  },
  difficultyValue: {
    ...StyleUtils.flexRowCenterAll(),
    paddingVertical: "2%",
    flex: 1,
  },
  checkmark: {
    ...StyleUtils.flexRowCenterAll(),
    width: "15%",
  },
});

const setRowStyles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 8,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
  },
});

type SetRowProps = {
  set: Set;
  index: number;
  useAltBackground: boolean;
  difficultyType: DifficultyType;
  containerAnimatedStyle?: AnimatedStyle<ViewStyle>;
  overlayAnimatedStyle?: AnimatedStyle<ViewStyle>;
  onEdit: (setId: string, field: EditField) => void;
  onToggle: (event: GestureResponderEvent) => void;
  showSwipeActions: boolean;
  onDelete: (setId: string) => void;
};

export function SetRow({
  set,
  index,
  useAltBackground,
  difficultyType,
  containerAnimatedStyle,
  overlayAnimatedStyle,
  onEdit,
  onToggle,
  showSwipeActions,
  onDelete,
}: SetRowProps) {
  const appBackgroundColor = useThemeColoring("appBackground");
  const rowTint = tintColor(useThemeColoring("appBackground"), 0.05);
  const backgroundColor = useAltBackground ? rowTint : appBackgroundColor;

  const values = getSetRowValues(set, index, difficultyType);
  const isActive = values[values.length - 1] as boolean;

  const handleEditWeight = () => {
    onEdit(set.id, "weight");
  };

  const handleEditReps = () => {
    onEdit(set.id, "reps");
  };

  const handleEditTime = () => {
    onEdit(set.id, "time");
  };

  const rowContent = (
    <Animated.View
      style={[
        commonSetStyles.container,
        setRowStyles.container,
        { backgroundColor },
        containerAnimatedStyle,
      ]}
    >
      <View style={commonSetStyles.setNumber}>
        <Text>{values[0]}</Text>
      </View>
      <View style={commonSetStyles.difficulty}>
        {/* Weight Column */}
        {difficultyType === DifficultyType.WEIGHT ||
        difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT ? (
          <TouchableOpacity
            style={commonSetStyles.difficultyValue}
            onPress={handleEditWeight}
            disabled={!onEdit}
          >
            <Text>{values[1]}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Reps Column */}
        {difficultyType === DifficultyType.WEIGHT ||
        difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT ? (
          <TouchableOpacity
            style={commonSetStyles.difficultyValue}
            onPress={handleEditReps}
            disabled={!onEdit}
          >
            <Text>{values[2]}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Bodyweight/Assisted Bodyweight Reps */}
        {(difficultyType === DifficultyType.BODYWEIGHT ||
          difficultyType === DifficultyType.ASSISTED_BODYWEIGHT) && (
          <TouchableOpacity
            style={commonSetStyles.difficultyValue}
            onPress={handleEditReps}
            disabled={!onEdit}
          >
            <Text>{values[1]}</Text>
          </TouchableOpacity>
        )}

        {/* Time Column */}
        {difficultyType === DifficultyType.TIME && (
          <TouchableOpacity
            style={commonSetStyles.difficultyValue}
            onPress={handleEditTime}
            disabled={!onEdit}
          >
            <Text>{values[1]}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={commonSetStyles.checkmark}>
        <SetStatusInput isActive={isActive} onToggle={onToggle} />
      </View>

      {overlayAnimatedStyle && (
        <Animated.View
          style={[setRowStyles.overlay, overlayAnimatedStyle]}
          pointerEvents="none"
        />
      )}
    </Animated.View>
  );

  // If swipe actions are enabled, wrap with Swipeable
  if (showSwipeActions) {
    return (
      <Swipeable
        overshootRight={false}
        renderRightActions={(_, drag) => (
          <SwipeableDelete
            drag={drag}
            onDelete={() => onDelete(set.id)}
            dimension={48}
          />
        )}
      >
        {rowContent}
      </Swipeable>
    );
  }

  return rowContent;
}

type SetHeaderProps = {
  difficultyType: DifficultyType;
};

export function SetHeader({ difficultyType }: SetHeaderProps) {
  return (
    <View style={commonSetStyles.container}>
      <View style={commonSetStyles.setNumber}>
        <Text light>SET</Text>
      </View>
      <View style={commonSetStyles.difficulty}>
        {(difficultyType === DifficultyType.WEIGHT ||
          difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) && (
          <View style={commonSetStyles.difficultyValue}>
            <Text light>LBS</Text>
          </View>
        )}
        {(difficultyType === DifficultyType.WEIGHT ||
          difficultyType === DifficultyType.WEIGHTED_BODYWEIGHT) && (
          <View style={commonSetStyles.difficultyValue}>
            <Text light>REPS</Text>
          </View>
        )}
        {(difficultyType === DifficultyType.BODYWEIGHT ||
          difficultyType === DifficultyType.ASSISTED_BODYWEIGHT) && (
          <View style={commonSetStyles.difficultyValue}>
            <Text light>REPS</Text>
          </View>
        )}
        {difficultyType === DifficultyType.TIME && (
          <View style={commonSetStyles.difficultyValue}>
            <Text light>TIME</Text>
          </View>
        )}
      </View>
      <View style={commonSetStyles.checkmark}>
        <Check
          color={useThemeColoring("lightText")}
          strokeWidth={2}
          size={20}
        />
      </View>
    </View>
  );
}
