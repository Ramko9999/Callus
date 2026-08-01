import { StyleSheet, TouchableOpacity } from "react-native";
import { Dumbbell, Plus } from "lucide-react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";

const noExercisesStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleUtils.flexColumn(10),
    alignItems: "center",
    justifyContent: "center",
  },
  action: {
    ...StyleUtils.flexRow(6),
    alignItems: "center",
    paddingHorizontal: "6%",
    paddingVertical: "3%",
    borderRadius: 8,
    marginTop: "2%",
  },
});

type NoExercisesProps = {
  message: string;
  onAdd: () => void;
};

export function NoExercises({ message, onAdd }: NoExercisesProps) {
  const lightTextColor = useThemeColoring("lightText");
  const primaryActionColor = useThemeColoring("primaryAction");

  return (
    <View style={noExercisesStyles.container}>
      <Dumbbell size={100} strokeWidth={1.5} color={lightTextColor} />
      <Text light>{message}</Text>
      <TouchableOpacity
        style={[
          noExercisesStyles.action,
          { backgroundColor: primaryActionColor },
        ]}
        onPress={onAdd}
      >
        <Plus size={16} color="white" />
        <Text style={{ color: "white" }}>Add Exercises</Text>
      </TouchableOpacity>
    </View>
  );
}
