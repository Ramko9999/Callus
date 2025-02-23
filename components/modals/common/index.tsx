import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { View } from "@/components/Themed";

const modalWrapperStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingTop: "1%",
    flex: 1,
  },
});

type ModalWrapperProps = {
  children: React.ReactNode;
};

export function ModalWrapper({ children }: ModalWrapperProps) {
  return (
    <View background style={modalWrapperStyles.container}>
      {children}
    </View>
  );
}
