import { TextInput, View, Text } from "@/components/Themed";
import { Workout, WorkoutMetadata } from "@/interface";
import { getLongDateDisplay } from "@/util/date";
import { StyleUtils } from "@/util/styles";
import { useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { WorkoutSummary } from "../../view";

const workoutTitleMetaStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    paddingLeft: "3%",
  },
});

type MetaEditor = {
  workout: Workout;
  onUpdateMeta: (meta: Partial<WorkoutMetadata>) => void;
  onDateClick: () => void;
};
export function MetaEditor({ workout, onUpdateMeta, onDateClick }: MetaEditor) {
  const { name, startedAt } = workout;

  const [workoutName, setWorkoutName] = useState(name);

  return (
    <View style={workoutTitleMetaStyles.container}>
      <TextInput
        extraLarge
        value={workoutName}
        onChangeText={(name) => {
          setWorkoutName(name);
        }}
        onEndEditing={() => {
          if (workoutName.trim().length > 0) {
            onUpdateMeta({ name: workoutName.trim() });
          } else {
            setWorkoutName(name);
          }
        }}
      />
      <TouchableOpacity onPress={onDateClick}>
        <Text neutral light>
          {getLongDateDisplay(startedAt, true)}
        </Text>
      </TouchableOpacity>
      <WorkoutSummary workout={workout} />
    </View>
  );
}
