import { View, Text } from "@/components/Themed";
import { Modal } from "@/components/util/popup/modal";
import { StyleUtils } from "@/util/styles";
import { ViewStyle, StyleSheet } from "react-native";

export type ModalProps = {
  show: boolean;
  hide: () => void;
};

const simpleModalStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingVertical: "2%",
    paddingHorizontal: "2%",
  },
  title: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    alignSelf: "center",
  },
  description: {
    alignSelf: "center",
  },
});

type SimpleModalProps = {
  show: boolean;
  onHide: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
};

export function SimpleModal({
  show,
  onHide,
  title,
  description,
  children,
  containerStyle,
}: SimpleModalProps) {
  return (
    <Modal show={show} onHide={onHide}>
      <View style={[simpleModalStyles.container, containerStyle]}>
        <View style={simpleModalStyles.title}>
          <Text action>{title}</Text>
        </View>
        {description && (
          <View style={simpleModalStyles.description}>
            <Text light>{description}</Text>
          </View>
        )}
        {children}
      </View>
    </Modal>
  );
}
