import React, { useRef, useState } from "react";
import { ViewStyle, StyleSheet, ViewabilityConfig } from "react-native";
import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import * as Haptics from "expo-haptics";
import { FlatList } from "react-native-gesture-handler";

const VISIBLE_ITEMS = 5;
const SCROLL_DEBOUNCE_PERIOD = 100;

const rouletteStyles = StyleSheet.create({
  item: {
    ...StyleUtils.flexRow(),
    alignItems: "center",
    justifyContent: "flex-end",
  },
});

type RouletteProps = {
  values: string[];
  onSelect: (value: string) => void;
  valueSize: number;
  itemHeight: number;
  containerStyle?: ViewStyle;
  initialValue?: string;
  loadNext?: () => Promise<void>;
  loadPrevious?: () => Promise<void>;
};

function computeNearestScrollIndex(offset: number, itemHeight: number) {
  return Math.round(offset / itemHeight);
}

// todo: still kinda buggy but shippable. if you get time, try to make sure the weird jumps don't happens and make loading previous and next data more robust
export function Roulette({
  values,
  onSelect,
  valueSize,
  itemHeight,
  containerStyle,
  initialValue,
  loadNext,
  loadPrevious,
}: RouletteProps) {
  const [scrolledOffset, setScrolledOffset] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const scrolledToInitialValueRef = useRef(initialValue == undefined);
  const initialValuesCountRef = useRef(values.length);
  const loadPreviousRef = useRef<Record<number, boolean>>({});
  const loadNextRef = useRef<Record<number, boolean>>({});
  const timerRef = useRef(null);
  const flatListRef = useRef<FlatList>(null);

  const flatListHeight = VISIBLE_ITEMS * itemHeight;
  const listPadding = 2 * itemHeight;

  const viewabilityConfig: ViewabilityConfig = {
    viewAreaCoveragePercentThreshold: 0.5,
  };

  const handleScrollToInitialValue = () => {
    if (!scrolledToInitialValueRef.current) {
      const targetIndex = values.indexOf(initialValue as string);
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: false,
      });
      scrolledToInitialValueRef.current = true;
    }
  };

  const handleScrollEnd = (offset: number) => {
    if (offset < 0 || offset >= itemHeight * values.length) {
      return;
    }

    const scrollIndex = computeNearestScrollIndex(offset, itemHeight);
    flatListRef.current?.scrollToIndex({ animated: true, index: scrollIndex });
    // todo: maybe we should try invoking handleLoadPrevious and handleLoadNext here
    onSelect(values[scrollIndex]);
  };

  const handleLoadPrevious = (offset: number) => {
    if (loadPreviousRef.current[values.length] || !loadPrevious) {
      return;
    }

    if (offset < 0) {
      setScrollEnabled(false);
      loadPreviousRef.current[values.length] = true;
      loadPrevious().then(() => setScrollEnabled(true));
    }
  };

  const handleLoadNext = (offset: number) => {
    if (loadNextRef.current[values.length] || !loadNext) {
      return;
    }

    if (offset >= (values.length - 1) * itemHeight) {
      setScrollEnabled(false);
      loadNextRef.current[values.length] = true;
      loadNext().then(() => setScrollEnabled(true));
    }
  };

  const handleScroll = (offset: number) => {
    setScrolledOffset(offset);

    if (!scrolledToInitialValueRef.current) {
      return;
    }

    handleLoadPrevious(offset);
    handleLoadNext(offset);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      handleScrollEnd(offset);
    }, SCROLL_DEBOUNCE_PERIOD) as any;
  };

  return (
    <View style={[containerStyle, { height: flatListHeight }]}>
      <FlatList
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        ref={flatListRef}
        ListHeaderComponent={() => <View style={{ height: listPadding }} />}
        ListFooterComponent={() => <View style={{ height: listPadding }} />}
        data={values}
        initialNumToRender={initialValuesCountRef.current}
        renderItem={({ item, index }) => {
          const maxOffsetWhileVisible = itemHeight * VISIBLE_ITEMS;
          const offsetDiff = scrolledOffset - index * itemHeight;
          const isVisible = Math.abs(offsetDiff) < maxOffsetWhileVisible;
          const visiblity = isVisible
            ? (maxOffsetWhileVisible - Math.abs(offsetDiff)) /
              maxOffsetWhileVisible
            : 0;

          return (
            <View
              key={index}
              style={[rouletteStyles.item, { height: itemHeight }]}
              onLayout={() => {
                if (index === values.length - 1) {
                  handleScrollToInitialValue();
                }
              }}
            >
              <RouletteItem
                value={item}
                size={valueSize}
                visibility={visiblity}
              />
            </View>
          );
        }}
        onScroll={({ nativeEvent }) => {
          const offset = nativeEvent.contentOffset.y;
          handleScroll(offset);
        }}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems && viewableItems.length > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
        }}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        keyExtractor={(item) => item}
      />
    </View>
  );
}

type RouletteItemProps = {
  value: string;
  size: number;
  visibility: number;
};

function RouletteItem({ value, size, visibility }: RouletteItemProps) {
  const itemStyle: ViewStyle = {
    opacity: Math.abs(visibility),
  };

  return (
    <View style={itemStyle}>
      <Text style={{ fontSize: size }}>{value}</Text>
    </View>
  );
}
