import { useThemeColoring, View } from "@/components/Themed";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { StyleUtils } from "@/util/styles";
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useDebounce } from "@/components/hooks/use-debounce";
import { SEARCH_BAR_HEIGHT, SearchBar } from "./search";

const DEBOUNCE_DELAY = 100;

const collapsableSearchScrollStyles = StyleSheet.create({
  searchContainer: {
    height: SEARCH_BAR_HEIGHT,
    width: "100%",
    ...StyleUtils.flexColumn(),
    justifyContent: "flex-end",
  },
  searchBar: {
    borderRadius: 10,
    ...StyleUtils.flexColumn(),
    justifyContent: "center",
  },
});

type CollapsableSearchScrollProps = {
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  children: React.ReactNode;
  scrollRef: React.RefObject<Animated.ScrollView>;
  scrollStyle?: ViewStyle;
  contentStyle?: ViewStyle;
};

// todo: try to see if we can detect when the user takes their thumb of the scroll and then perform the collapse of the search bar
export function CollapsableSearchScroll({
  searchQuery,
  setSearchQuery,
  children,
  scrollRef,
  scrollStyle,
  contentStyle,
}: CollapsableSearchScrollProps) {
  const { invoke } = useDebounce({ delay: DEBOUNCE_DELAY });
  const scrollOffset = useSharedValue(SEARCH_BAR_HEIGHT);

  const hideOrRevealSearch = (offset: number) => {
    if (offset < SEARCH_BAR_HEIGHT) {
      if (offset < SEARCH_BAR_HEIGHT / 2) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        scrollRef.current?.scrollTo({
          y: SEARCH_BAR_HEIGHT,
          animated: true,
        });
      }
    }
  };

  // @ts-ignore;
  const debouncedHideOrRevealSearch = invoke(hideOrRevealSearch);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.y;
    runOnJS(debouncedHideOrRevealSearch)(event.contentOffset.y);
  });

  const searchBarContainerAnimatedStyle = useAnimatedStyle(() => ({
    height: clamp(SEARCH_BAR_HEIGHT - scrollOffset.value, 0, SEARCH_BAR_HEIGHT),
  }));

  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    display: scrollOffset.value < SEARCH_BAR_HEIGHT ? "flex" : "none",
    opacity: interpolate(
      clamp(scrollOffset.value, 0, Math.floor(SEARCH_BAR_HEIGHT / 2)),
      [0, Math.floor(SEARCH_BAR_HEIGHT / 2)],
      [1, 0]
    ),
  }));

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={scrollStyle}
      contentContainerStyle={contentStyle}
      scrollEventThrottle={16}
      contentOffset={{ y: SEARCH_BAR_HEIGHT, x: 0 }}
      onScroll={handleScroll}
    >
      <View style={collapsableSearchScrollStyles.searchContainer}>
        <Animated.View
          style={[
            collapsableSearchScrollStyles.searchBar,
            searchBarContainerAnimatedStyle,
            { backgroundColor: useThemeColoring("primaryViewBackground") },
          ]}
        >
          <Animated.View style={searchBarAnimatedStyle}>
            <SearchBar
              setSearchQuery={setSearchQuery}
              searchQuery={searchQuery}
            />
          </Animated.View>
        </Animated.View>
      </View>
      {children}
    </Animated.ScrollView>
  );
}
