import { DifficultyType, Set, SetPlan } from "@/interface";
import { StyleUtils } from "@/util/styles";
import { useRef, useState, useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import Animated, {
  LinearTransition,
  LightSpeedOutLeft,
} from "react-native-reanimated";
import { SetProps } from "./item";

const setEditorStyle = StyleSheet.create({
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
    ...StyleUtils.flexColumn(),
    paddingBottom: "5%",
  },
});

type SetEditorProps = {
  sets: (Set | SetPlan)[];
  difficultyType: DifficultyType;
  onRemove: (setId: string) => void;
  onEdit: (setId: string, update: Partial<Set | SetPlan>) => void;
  renderSet: (props: SetProps) => React.ReactNode;
};

export function SetEditor({
  sets,
  difficultyType,
  onRemove,
  onEdit,
  renderSet,
}: SetEditorProps) {
  const scrollRef = useRef<ScrollView>(null);
  const renderRef = useRef(false);
  const [scrollContentHeight, setScrollContentHeight] = useState(0);

  // todo: don't auto scroll down if the content height decreases
  const handleScrollContentChange = useCallback(
    (width: number, height: number) => {
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

  return (
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={setEditorStyle.content}
      onContentSizeChange={handleScrollContentChange}
    >
      {sets.map((set, index) => (
        <Animated.View
          key={set.id}
          layout={LinearTransition}
          exiting={LightSpeedOutLeft}
        >
          {renderSet({
            index,
            set,
            difficultyType,
            onTrash: onRemove,
            onUpdate: onEdit,
          })}
        </Animated.View>
      ))}
    </ScrollView>
  );
}
