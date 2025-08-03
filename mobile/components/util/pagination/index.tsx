import { PaginationDot } from "@/components/theme/icons";
import { StyleUtils } from "@/util/styles";
import { StyleSheet } from "react-native";
import { View } from "@/components/Themed";

const paginationStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(5),
  },
});

type PaginationProps = {
  totalItemsCount: number;
  currentIndex: number;
};

export function Pagination({ totalItemsCount, currentIndex }: PaginationProps) {
  return (
    <View style={paginationStyles.container}>
      {Array.from({ length: totalItemsCount }).map((_, index) => (
        <PaginationDot key={index} isOn={index === currentIndex} />
      ))}
    </View>
  );
}
