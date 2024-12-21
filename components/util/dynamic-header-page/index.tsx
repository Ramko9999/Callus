import { StyleSheet, View as DefaultView } from "react-native";
import { StyleUtils } from "@/util/styles";
import { Text, useThemeColoring, View } from "@/components/Themed";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import React, {
  createContext,
  RefObject,
  useContext,
  useEffect,
  useRef,
} from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export const DYNAMIC_HEADER_HEIGHT = 40;

const DynamicHeaderContext = createContext<RefObject<Animated.ScrollView>>({
  current: null,
});

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
    paddingHorizontal: "2%",
  },
  scroll: {
    marginTop: DYNAMIC_HEADER_HEIGHT,
  },
});

type DynamicHeaderPageProps = {
  title: string;
  children: React.ReactNode;
  renderLargeHeader?: React.ReactNode;
};

// todo: weird bug where header is initially at a position and then moved down
export function DynamicHeaderPage({
  title,
  children,
  renderLargeHeader,
}: DynamicHeaderPageProps) {
  const pageHeaderRef = useRef<DefaultView>(null);
  const scrollRef = useRef<Animated.ScrollView>(null);
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
    <View style={{ backgroundColor: useThemeColoring("appBackground") }}>
      <SafeAreaView>
        <View style={dynamicHeaderPageStyles.container}>
          <Animated.View
            style={[
              dynamicHeaderPageStyles.header,
              dynamicHeaderAnimatedStyle,
              { borderColor: useThemeColoring("dynamicHeaderBorder") },
            ]}
          >
            <Text neutral>{title}</Text>
          </Animated.View>
          <Animated.ScrollView
            ref={scrollRef}
            style={dynamicHeaderPageStyles.scroll}
            onScroll={({ nativeEvent }) => {
              scrollOffset.value = nativeEvent.contentOffset.y;
            }}
          >
            <View style={dynamicHeaderPageStyles.content}>
              <DefaultView ref={pageHeaderRef}>
                {renderLargeHeader ? (
                  renderLargeHeader
                ) : (
                  <Text emphasized extraLarge>
                    {title}
                  </Text>
                )}
              </DefaultView>
              <DynamicHeaderContext.Provider value={scrollRef}>
                {children}
              </DynamicHeaderContext.Provider>
            </View>
          </Animated.ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

export function useDynamicHeaderScroll() {
  return useContext(DynamicHeaderContext);
}
