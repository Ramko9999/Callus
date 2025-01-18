import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { Routine } from "@/interface";
import { useState } from "react";
import { TextInput, View, Text } from "@/components/Themed";

const metaEditorStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(5),
    paddingLeft: "3%",
  },
  summary: {
    ...StyleUtils.flexRow(10),
    paddingTop: "1%",
  },
});

type MetaEditor = {
  routine: Routine;
  onUpdateMeta: (meta: Partial<Routine>) => void;
};

export function MetaEditor({ routine, onUpdateMeta }: MetaEditor) {
  const { name } = routine;
  const [routineName, setRoutineName] = useState(name);

  return (
    <View style={metaEditorStyles.container}>
      <TextInput
        extraLarge
        value={routineName}
        onChangeText={(name) => {
          setRoutineName(name);
        }}
        onEndEditing={() => {
          if (routineName.trim().length > 0) {
            onUpdateMeta({ name: routineName.trim() });
          } else {
            setRoutineName(name);
          }
        }}
      />
      <View style={metaEditorStyles.summary}>
        <Text light>{`${routine.plan.length} exercises`}</Text>
      </View>
    </View>
  );
}
