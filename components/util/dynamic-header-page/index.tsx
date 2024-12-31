import { StyleSheet, View as DefaultView } from "react-native";
import { StyleUtils, TAB_BAR_HEIGHT } from "@/util/styles";
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { convertHexToRGBA } from "@/util/color";

export const DYNAMIC_HEADER_HEIGHT = 40;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

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
    width: "100%",
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: "3%",
    zIndex: 1,
  },
  content: {
    paddingHorizontal: "2%",
    paddingBottom: TAB_BAR_HEIGHT,
  },
});

type DynamicHeaderPageProps = {
  title: string;
  children: React.ReactNode;
  renderLargeHeader?: React.ReactNode;
  scrollViewRef?: React.RefObject<Animated.ScrollView>;
};

// todo: fix weird bug with home screen not getting blur effect
export function DynamicHeaderPage({
  title,
  children,
  renderLargeHeader,
  scrollViewRef,
}: DynamicHeaderPageProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const pageHeaderRef = useRef<DefaultView>(null);
  const scrollRef = scrollViewRef ?? useRef<Animated.ScrollView>(null);
  const pageHeaderHeight = useRef(0);
  const scrollOffset = useSharedValue(0);

  const dynamicHeaderBackground = convertHexToRGBA(
    useThemeColoring("primaryViewBackground"),
    0.5
  );

  useEffect(() => {
    pageHeaderRef.current?.measure((x, y, width, height, pageX, pageY) => {
      pageHeaderHeight.current = height;
    });
  }, [title]);

  const dynamicHeaderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scrollOffset.value >= pageHeaderHeight.current ? 1 : 0,
    backgroundColor:
      scrollOffset.value >= pageHeaderHeight.current
        ? dynamicHeaderBackground
        : "transparent",
  }));

  return (
    <View style={{ backgroundColor: useThemeColoring("appBackground") }}>
      <SafeAreaView>
        <View
          style={[
            dynamicHeaderPageStyles.container,
            { paddingTop: safeAreaInsets.top },
          ]}
        >
          <Animated.ScrollView
            ref={scrollRef}
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
      <AnimatedBlurView
        experimentalBlurMethod="dimezisBlurView"
        style={[
          dynamicHeaderPageStyles.header,
          dynamicHeaderAnimatedStyle,
          {
            height: DYNAMIC_HEADER_HEIGHT + safeAreaInsets.top,
          },
        ]}
      >
        <Text neutral>{title}</Text>
      </AnimatedBlurView>
    </View>
  );
}

export function useDynamicHeaderScroll() {
  return useContext(DynamicHeaderContext);
}
