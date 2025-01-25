import { useThemeColoring, View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { StyleSheet, TouchableOpacity } from "react-native";

const exercisesFilterDropdownStyles = StyleSheet.create({
  container: {
    borderRadius: 5,
  },
  item: {
    ...StyleUtils.flexColumn(),
    paddingVertical: "5%",
    alignItems: "center",
    justifyContent: "center",
  },
});

type ExercisesFilterDropdownProps = {
  selectedValue?: string;
  values: string[];
  onSelect: (value: string) => void;
  onDeselect: () => void;
};

export function ExercisesFilterDropdown({
  selectedValue,
  values,
  onSelect,
  onDeselect,
}: ExercisesFilterDropdownProps) {
  const selectedValueBackgroundColor = useThemeColoring(
    "highlightedAnimationColor"
  );

  return (
    <View background style={exercisesFilterDropdownStyles.container}>
      {values.map((value, index) => (
        <TouchableOpacity
          key={index}
          style={[
            exercisesFilterDropdownStyles.item,
            selectedValue && selectedValue === value
              ? { backgroundColor: selectedValueBackgroundColor }
              : {},
          ]}
          onPress={() => {
            if (selectedValue && selectedValue === value) {
              onDeselect();
            } else {
              onSelect(value);
            }
          }}
        >
          <Text light={!(selectedValue && selectedValue === value)}>
            {value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
