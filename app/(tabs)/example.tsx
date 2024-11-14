import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// for testing things out quickly, remove before prod release
export default function () {
  return <Example />;
}

function Example() {
  const [focus, setFocus] = useState(false);

  return (
    <View
      background
      style={{
        ...StyleUtils.flexColumn(20),
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Text>Example</Text>
      <BorderAnimation focus={focus} setFocus={setFocus} />
    </View>
  );
}

function BorderAnimation({
  focus,
  setFocus,
}: {
  focus: boolean;
  setFocus: any;
}) {
  const focusProgress = useSharedValue(0);

  useEffect(() => {
    focusProgress.value = focus ? withTiming(1) : withTiming(0);
  }, [focus]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: focusProgress.value,
  }));

  return (
    <TouchableOpacity onPress={() => setFocus((f) => !f)}>
      <Animated.View style={[{ borderColor: "white" }, animatedStyle]}>
        <Text>Border Animation</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
