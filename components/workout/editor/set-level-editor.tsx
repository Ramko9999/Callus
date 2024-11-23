import { DifficultyType, Set } from "@/interface";
import { StyleSheet, useWindowDimensions } from "react-native";
import { StyleUtils, WORKOUT_PLAYER_EDITOR_HEIGHT } from "@/util/styles";
import { ScrollView } from "react-native-gesture-handler";
import { useCallback, useRef, useState } from "react";
import { View } from "@/components/Themed";
import Animated, {
  LightSpeedInLeft,
  LightSpeedOutLeft,
} from "react-native-reanimated";
import { EditorSet } from "../core";

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
    paddingTop: "5%"
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

  const { height } = useWindowDimensions();

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={setLevelEditorStyle.scroll}
      style={{height: height * 0.7}}
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
