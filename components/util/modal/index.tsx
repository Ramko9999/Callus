import { Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Animated from "react-native-reanimated";

const modalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

type ModalProps = {
  children: React.ReactNode;
  show: boolean;
  hide: () => void;
};

export function Modal({ children, show, hide }: ModalProps) {
  const { width, height } = useWindowDimensions();

  return (
    show && (
      <Pressable
        onPress={hide}
        style={[modalStyles.backdrop, { width, height }]}
      />
    )
  );
}
