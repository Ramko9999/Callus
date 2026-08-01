import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  LinearTransition,
  LightSpeedOutLeft,
  LightSpeedInRight,
  LayoutAnimationConfig,
} from "react-native-reanimated";
import { Plus, MoreVertical } from "lucide-react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { DifficultyType, Set } from "@/interface";
import { StyleUtils } from "@/util/styles";
import { tintColor } from "@/util/color";
import { ExerciseImage } from "@/components/exercise/image";
import { SetHeader } from "@/components/pages/workout/common";

const exerciseCardHeaderStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
  topHeader: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    marginBottom: "3%",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: "3%",
  },
  info: {
    ...StyleUtils.flexColumn(),
    justifyContent: "space-between",
    flex: 1,
  },
  name: {
    fontWeight: "600",
  },
  actions: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
  },
  notesContainer: {
    ...StyleUtils.flexColumn(),
    marginBottom: "3%",
  },
});

type ExerciseCardHeaderProps = {
  metaId: string;
  name: string;
  description: string;
  note?: string;
  onMorePress: () => void;
  moreButtonRef: React.RefObject<any>;
  onNotePress: () => void;
  onOpenExercise: () => void;
};

function ExerciseCardHeader({
  metaId,
  name,
  description,
  note,
  onMorePress,
  moreButtonRef,
  onNotePress,
  onOpenExercise,
}: ExerciseCardHeaderProps) {
  const primaryActionColor = useThemeColoring("primaryAction");

  return (
    <View style={exerciseCardHeaderStyles.container}>
      <View style={exerciseCardHeaderStyles.topHeader}>
        <TouchableOpacity onPress={onOpenExercise}>
          <ExerciseImage
            metaId={metaId}
            imageStyle={exerciseCardHeaderStyles.image}
            fallbackSize={50}
            fallbackColor={primaryActionColor}
          />
        </TouchableOpacity>
        <View style={exerciseCardHeaderStyles.info}>
          <Text header style={exerciseCardHeaderStyles.name}>
            {name}
          </Text>
          <Text light>{description}</Text>
        </View>
        <View style={exerciseCardHeaderStyles.actions}>
          <TouchableOpacity ref={moreButtonRef} onPress={onMorePress}>
            <MoreVertical size={24} color={primaryActionColor} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={exerciseCardHeaderStyles.notesContainer}
        onPress={onNotePress}
      >
        <Text light sneutral>
          {note || "Add notes here..."}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const exerciseCardStyles = StyleSheet.create({
  exerciseCard: {
    borderRadius: 12,
    marginBottom: "4%",
    padding: "2%",
  },
  setsContainer: {
    marginBottom: "3%",
  },
  addSetButton: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "3%",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addSetText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: "2%",
  },
});

type SharedExerciseCardProps = {
  metaId: string;
  name: string;
  description: string;
  note?: string;
  difficultyType: DifficultyType;
  sets: Set[];
  showStatus?: boolean;
  moreButtonRef: React.RefObject<any>;
  onMorePress: () => void;
  onNotePress: () => void;
  onOpenExercise: () => void;
  onAddSet: () => void;
  renderSetRow: (set: Set, index: number) => React.ReactNode;
};

export function SharedExerciseCard({
  metaId,
  name,
  description,
  note,
  difficultyType,
  sets,
  showStatus = true,
  moreButtonRef,
  onMorePress,
  onNotePress,
  onOpenExercise,
  onAddSet,
  renderSetRow,
}: SharedExerciseCardProps) {
  const primaryActionColor = useThemeColoring("primaryAction");
  const borderColor = tintColor(useThemeColoring("appBackground"), 0.1);

  return (
    <Animated.View
      style={exerciseCardStyles.exerciseCard}
      layout={LinearTransition}
    >
      <ExerciseCardHeader
        metaId={metaId}
        name={name}
        description={description}
        note={note}
        onMorePress={onMorePress}
        moreButtonRef={moreButtonRef}
        onNotePress={onNotePress}
        onOpenExercise={onOpenExercise}
      />
      <View style={exerciseCardStyles.setsContainer}>
        <SetHeader difficultyType={difficultyType} showStatus={showStatus} />
        <LayoutAnimationConfig skipEntering>
          {sets.map((set, index) => (
            <Animated.View
              key={set.id}
              layout={LinearTransition}
              exiting={LightSpeedOutLeft}
              entering={LightSpeedInRight}
            >
              {renderSetRow(set, index)}
            </Animated.View>
          ))}
          <Animated.View key="add-set-button" layout={LinearTransition}>
            <TouchableOpacity
              style={[
                exerciseCardStyles.addSetButton,
                { borderColor: borderColor },
              ]}
              onPress={onAddSet}
            >
              <Plus size={16} color={primaryActionColor} />
              <Text
                style={[
                  exerciseCardStyles.addSetText,
                  { color: primaryActionColor },
                ]}
              >
                Add Set
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </LayoutAnimationConfig>
      </View>
    </Animated.View>
  );
}
