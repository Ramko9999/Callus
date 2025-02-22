import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { View } from "@/components/Themed";
import { ModalDragIndicator } from "@/components/theme/icons";

const modalWrapperStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "1%",
    flex: 1,
  },
  drag: {
    alignSelf: "center",
  },
});

type ModalWrapperProps = {
  children: React.ReactNode;
};

export function ModalWrapper({ children }: ModalWrapperProps) {
  return (
    <View background style={modalWrapperStyles.container}>
      <View style={modalWrapperStyles.drag}>
        <ModalDragIndicator />
      </View>
      {children}
    </View>
  );
}
