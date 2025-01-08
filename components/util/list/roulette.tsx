import React, { useRef, useState } from "react";
import {
  FlatList,
  ViewStyle,
  StyleSheet,
  ViewabilityConfig,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import * as Haptics from "expo-haptics";

const VISIBLE_ITEMS = 5;

const rouletteStyles = StyleSheet.create({
  item: {
    ...StyleUtils.flexRowCenterAll(),
  },
});

type RouletteProps = {
  values: string[];
  onSelect: (value: string) => void;
  valueSize: number;
  itemHeight: number;
  containerStyle?: ViewStyle;
  initialValue?: string;
};

export function Roulette({
  values,
  onSelect,
  valueSize,
  itemHeight,
  containerStyle,
  initialValue,
}: RouletteProps) {
  const [scrolledOffset, setScrolledOffset] = useState(0);
  const timerRef = useRef(null);
  const flatListRef = useRef<FlatList>(null);

  const flatListHeight = VISIBLE_ITEMS * itemHeight;
  const listPadding = 2 * itemHeight;

  const viewabilityConfig: ViewabilityConfig = {
    viewAreaCoveragePercentThreshold: 0.5,
  };

  const handleScrollEnd = (offset: number) => {
    const scrollIndex = Math.round(offset / itemHeight);
    flatListRef.current?.scrollToIndex({ animated: true, index: scrollIndex });
    onSelect(values[scrollIndex]);
  };

  const handleScroll = (offset: number) => {
    setScrolledOffset(offset);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      handleScrollEnd(offset);
    }, 100) as any;
  };

  return (
    <View style={[containerStyle, { height: flatListHeight }]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        ref={flatListRef}
        ListHeaderComponent={() => <View style={{ height: listPadding }} />}
        ListFooterComponent={() => <View style={{ height: listPadding }} />}
        data={values}
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
        initialScrollIndex={initialValue ? values.indexOf(initialValue) : null}
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
