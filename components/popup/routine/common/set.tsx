import React from "react";
import { Difficulty, DifficultyType, Set, SetPlan } from "@/interface";
import { StyleSheet } from "react-native";
import { EDITOR_SET_HEIGHT, StyleUtils } from "@/util/styles";
import { ScrollView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useCallback, useRef, useState } from "react";
import { View } from "@/components/Themed";
import Animated, {
  LightSpeedInLeft,
  LightSpeedOutLeft,
  LinearTransition,
} from "react-native-reanimated";
import { SwipeableDelete } from "@/components/util/swipeable-delete";
import { DifficultyInput } from "@/components/popup/workout/common/inputs";

const editorSetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(10),
    alignItems: "center",
    height: EDITOR_SET_HEIGHT,
    paddingLeft: "3%",
  },
});

type EditorSetProps = {
  set: SetPlan;
  difficultyType: DifficultyType;
  onTrash: () => void;
  onUpdate: (update: Partial<Set>) => void;
};

export function EditorSet({
  set,
  difficultyType,
  onTrash,
  onUpdate,
}: EditorSetProps) {
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
      <View style={editorSetStyles.container}>
        <DifficultyInput
          id={set.id}
          difficulty={set.difficulty}
          type={difficultyType}
          onUpdate={(difficulty: Difficulty) => onUpdate({ difficulty })}
        />
      </View>
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
  sets: SetPlan[];
  difficultyType: DifficultyType;
  back: () => void;
  onRemove: (setPlanId: string) => void;
  onEdit: (setPlanId: string, update: Partial<SetPlan>) => void;
};

export function SetLevelEditor({
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
    (setPlanId: string) => {
      const isRemovingLastSet = sets.length === 1;
      onRemove(setPlanId);
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
            key={set.id}
            layout={LinearTransition}
            exiting={LightSpeedOutLeft}
          >
            <EditorSet
              set={set}
              difficultyType={difficultyType}
              onUpdate={(update) => {
                onEdit(set.id, update);
              }}
              onTrash={() => onRemoveSet(set.id)}
            />
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}
