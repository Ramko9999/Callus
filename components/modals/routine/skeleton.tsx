import { StyleUtils } from "@/util/styles";
import { View, StyleSheet } from "react-native";
import { ModalWrapper } from "../common";
import { ExercisesEditorTopActions } from "./top-actions";

const skeletionStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingTop: "3%",
  },
});

export function Skeleton() {
  return (
    <ModalWrapper>
      <View style={skeletionStyles.container}>
        <ExercisesEditorTopActions
          onClose={() => {}}
          onAdd={() => {}}
          onStart={() => {}}
          onTrash={() => {}}
        />
      </View>
    </ModalWrapper>
  );
}
