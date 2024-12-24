import React from "react";
import { Difficulty, DifficultyType, Set, SetStatus } from "@/interface";
import {
  StyleSheet,
} from "react-native";
import { EDITOR_SET_HEIGHT, StyleUtils } from "@/util/styles";
import { ScrollView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useCallback, useEffect, useRef, useState } from "react";
import { useThemeColoring, View } from "@/components/Themed";
import Animated, {
  interpolateColor,
  LightSpeedInLeft,
  LightSpeedOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import { DifficultyInput, SetStatusInput } from "../inputs";

const editorSetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    height: EDITOR_SET_HEIGHT,
    paddingLeft: "3%",
  },
});

type EditorSetProps = {
  set: Set;
  difficultyType: DifficultyType;
  onTrash: () => void;
  onUpdate: (update: Partial<Set>) => void;
  animate?: boolean;
};

export function EditorSet({
  set,
  difficultyType,
  onTrash,
  onUpdate,
  animate,
}: EditorSetProps) {
  const animationBackgroundColor = useSharedValue(0);
  const animationColor = useThemeColoring("highlightedAnimationColor");

  useEffect(() => {
    if (animate) {
      animationBackgroundColor.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1
      );
    } else {
      animationBackgroundColor.value = 0;
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animationBackgroundColor.value,
      [0, 1],
      ["transparent", animationColor]
    ),
  }));

  return (
    <Swipeable
      renderRightActions={(_, drag) => (
        <SwipeableDelete
          drag={drag}
          onDelete={onTrash}
          dimension={EDITOR_SET_HEIGHT}
        />
      )}
      overshootRight={false}
    >
      <Animated.View style={animatedStyle}>
        <View style={editorSetStyles.container}>
          <SetStatusInput
            set={set}
            isOn={set.status === SetStatus.FINISHED}
            onToggle={() => {
              if (set.status === SetStatus.FINISHED) {
                onUpdate({
                  status: SetStatus.UNSTARTED,
                  restStartedAt: undefined,
                  restEndedAt: undefined,
                });
              } else if (set.status === SetStatus.RESTING) {
                onUpdate({
                  status: SetStatus.FINISHED,
                  restEndedAt: Date.now(),
                });
              } else {
                onUpdate({ status: SetStatus.FINISHED });
              }
            }}
          />
          <DifficultyInput
            id={set.id}
            difficulty={set.difficulty}
            type={difficultyType}
            onUpdate={(difficulty: Difficulty) => onUpdate({ difficulty })}
          />
        </View>
      </Animated.View>
    </Swipeable>
  );
}

const setLevelEditorStyle = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "3%",
  },
  actions: {
    ...StyleUtils.flexRow(10),
    justifyContent: "space-between",
  },
  rightActions: {
    ...StyleUtils.flexRow(10),
  },
  content: {
    ...StyleUtils.flexColumn(10),
    paddingBottom: "3%",
  },
  scroll: {
    paddingBottom: "2%",
  },
});

type SetLevelEditorProps = {
  currentSet?: Set;
  sets: Set[];
  difficultyType: DifficultyType;
  back: () => void;
  onRemove: (setId: string) => void;
  onEdit: (setId: string, update: Partial<Set>) => void;
};

// todo: fix exiting animation
export function SetLevelEditor({
  currentSet,
  sets,
  difficultyType,
  onRemove,
  onEdit,
  back,
}: SetLevelEditorProps) {
  const scrollRef = useRef<ScrollView>(null);
  const renderRef = useRef(false);
  const [scrollContentHeight, setScrollContentHeight] = useState(0);

  const handleScrollContentChange = useCallback(
    (_: number, height: number) => {
      if (renderRef.current) {
        if (scrollContentHeight !== height) {
          setScrollContentHeight(height);
          scrollRef.current?.scrollToEnd({ animated: true });
        }
      } else {
        renderRef.current = true;
        setScrollContentHeight(height);
      }
    },
    [scrollContentHeight]
  );

  const onRemoveSet = useCallback(
    (set: Set) => {
      const isRemovingLastSet = sets.length === 1;
      onRemove(set.id);
      if (isRemovingLastSet) {
        back();
      }
    },
    [sets, back]
  );

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={setLevelEditorStyle.scroll}
      onContentSizeChange={handleScrollContentChange}
    >
      <View style={setLevelEditorStyle.content}>
        {sets.map((set, index) => (
          <Animated.View
            key={index}
            exiting={LightSpeedOutLeft}
            entering={LightSpeedInLeft}
          >
            <EditorSet
              key={index}
              set={set}
              animate={currentSet?.id === set.id}
              difficultyType={difficultyType}
              onUpdate={(update) => {
                onEdit(set.id, update);
              }}
              onTrash={() => onRemoveSet(set)}
            />
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}
