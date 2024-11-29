import { ScrollView, StyleSheet, View as DefaultView } from "react-native";
import { StyleUtils } from "@/util/styles";
import { Text, useThemeColoring, View } from "@/components/Themed";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useEffect, useRef } from "react";

const DYNAMIC_HEADER_HEIGHT = 90;

const dynamicHeaderPageStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    ...StyleUtils.expansive(),
  },
  header: {
    ...StyleUtils.flexColumn(),
    height: DYNAMIC_HEADER_HEIGHT,
    width: "100%",
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: "3%",
    zIndex: 1,
  },
  content: {
    paddingHorizontal: "3%",
  },
  scroll: {
    marginTop: DYNAMIC_HEADER_HEIGHT,
  },
});

type DynamicHeaderPageProps = {
  title: string;
  children: React.ReactNode;
};

// todo(android): use safe area
export function DynamicHeaderPage({ title, children }: DynamicHeaderPageProps) {
  const pageHeaderRef = useRef<DefaultView>(null);
  const pageHeaderHeight = useRef(0);
  const scrollOffset = useSharedValue(0);

  useEffect(() => {
    pageHeaderRef.current?.measure((x, y, width, height, pageX, pageY) => {
      pageHeaderHeight.current = height;
    });
  }, [title]);

  const dynamicHeaderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scrollOffset.value >= pageHeaderHeight.current ? 1 : 0,
    borderBottomWidth:
      scrollOffset.value > pageHeaderHeight.current * 1.2 ? 1 : 0,
  }));

  return (
    <View background>
      <View background style={dynamicHeaderPageStyles.container}>
        <Animated.View
          style={[
            dynamicHeaderPageStyles.header,
            dynamicHeaderAnimatedStyle,
            { borderColor: useThemeColoring("dynamicHeaderBorder") },
          ]}
        >
          <Text neutral>{title}</Text>
        </Animated.View>
        <ScrollView
          style={dynamicHeaderPageStyles.scroll}
          onScroll={({ nativeEvent }) => {
            scrollOffset.value = nativeEvent.contentOffset.y;
          }}
        >
          <View style={dynamicHeaderPageStyles.content}>
            <DefaultView ref={pageHeaderRef}>
              <Text emphasized extraLarge>
                {title}
              </Text>
            </DefaultView>
            {children}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
