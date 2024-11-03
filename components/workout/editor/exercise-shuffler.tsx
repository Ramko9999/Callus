import { View, Text, Icon } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import { StyleSheet, TouchableOpacity } from "react-native";

const styles = StyleSheet.create({
  exerciseShufflerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingVertical: "2%",
    alignItems: "center",
    width: "80%"
  },
  exerciseShufflerItem: {
    borderStyle: "solid",
    borderBottomWidth: 2,
    width: "100%",
    padding: "2%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exerciseShufflerActions: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
});

type ExerciseShufflerProps = {
  exerciseOrder: string[];
  onShuffle: (exercises: string[]) => void;
};

function swapArrayPositions(arr: any[], i: number, j: number) {
  const value = arr[i];
  arr[i] = arr[j];
  arr[j] = value;
  return arr;
}


export function ExerciseShuffler({
  exerciseOrder,
  onShuffle,
}: ExerciseShufflerProps) {
  return (
    <View style={styles.exerciseShufflerContainer}>
      {exerciseOrder.map((exercise, index) => (
        <View key={index} style={styles.exerciseShufflerItem}>
          <Text _type="neutral">{exercise}</Text>
          <View style={styles.exerciseShufflerActions}>
            {index > 0 && (
              <TouchableOpacity
                onPress={() => {
                  onShuffle(
                    swapArrayPositions(exerciseOrder, index, index - 1)
                  );
                }}
              >
                <Icon name="arrow-up" size={textTheme.neutral.fontSize} />
              </TouchableOpacity>
            )}
            {index < exerciseOrder.length - 1 && (
              <TouchableOpacity
                onPress={() =>
                  onShuffle(swapArrayPositions(exerciseOrder, index, index + 1))
                }
              >
                <Icon name="arrow-down" size={textTheme.neutral.fontSize} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
