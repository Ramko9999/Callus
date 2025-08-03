import { View, useThemeColoring } from "@/components/Themed";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";
import { Trash } from "@/components/theme/actions";

const swipeableDeleteStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRowCenterAll(),
  },
});

type SwipeableDeleteProps = {
  drag: SharedValue<number>;
  onDelete: () => void;
  dimension: number;
};

export function SwipeableDelete({
  drag,
  onDelete,
  dimension,
}: SwipeableDeleteProps) {
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateX: drag.value + dimension }],
    }),
    [dimension]
  );

  return (
    <View>
      <Animated.View
        style={[
          swipeableDeleteStyles.container,
          {
            backgroundColor: useThemeColoring("dangerAction"),
            height: dimension,
            width: dimension,
          },
          animatedStyle,
        ]}
      >
        <Trash onClick={onDelete} />
      </Animated.View>
    </View>
  );
}
