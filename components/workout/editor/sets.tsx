import { View, Text } from "@/components/Themed";
import { Exercise, Set } from "@/interface";
import { WORKOUT_PLAYER_EDITOR_HEIGHT, StyleUtils } from "@/util/styles";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Add, Back } from "../core/actions";
import { EditorSet } from "../core";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  LightSpeedInLeft,
  LightSpeedOutLeft,
} from "react-native-reanimated";
import { useCallback, useRef, useState } from "react";
import * as Haptics from "expo-haptics";

const setsEditorStyle = StyleSheet.create({
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
    paddingLeft: "3%",
  },
  scroll: {
    paddingBottom: "5%",
  },
});

type SetsEditorProps = {
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, update: Partial<Set>) => void;
  back: () => void;
  exercise: Exercise;
};

// todo: fix exiting animation
export function SetsEditor({
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  back,
  exercise,
}: SetsEditorProps) {
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

  const onTrashSet = useCallback(
    (set: Set) => {
      const isRemovingLastSet = exercise.sets.length === 1;
      onRemoveSet(set.id);
      if (isRemovingLastSet) {
        back();
      }
    },
    [exercise, back]
  );

  const { height } = useWindowDimensions();

  return (
    <View background style={setsEditorStyle.container}>
      <View style={setsEditorStyle.actions}>
        <Back onClick={back} />
        <View style={setsEditorStyle.rightActions}>
          <Add
            onClick={() => {
              onAddSet();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }}
          />
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={setsEditorStyle.scroll}
        style={{ height: height * WORKOUT_PLAYER_EDITOR_HEIGHT }}
        onContentSizeChange={handleScrollContentChange}
      >
        <View style={setsEditorStyle.content}>
          <Text extraLarge>{exercise.name}</Text>
          {exercise.sets.map((set, index) => (
            <Animated.View
              key={index}
              exiting={LightSpeedOutLeft}
              entering={LightSpeedInLeft}
            >
              <EditorSet
                key={index}
                set={set}
                exercise={exercise}
                onUpdate={(update) => {
                  onUpdateSet(set.id, update);
                }}
                onTrash={() => onTrashSet(set)}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
