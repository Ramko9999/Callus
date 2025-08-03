import React, { useEffect, useState, useCallback, useRef } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { View, Text } from "@/components/Themed";
import { Change, WhatsNewApi } from "@/api/whats-new";
import { StyleUtils } from "@/util/styles";
import { HeaderPage } from "@/components/util/header-page";
import { CloseButton } from "@/components/pages/common";
import { Image } from "react-native";
import { Pagination } from "@/components/util/pagination";
import { FlatList } from "react-native-gesture-handler";
import { nativeApplicationVersion } from "expo-application";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const newChangeStyles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: "3%",
    ...StyleUtils.flexColumn(),
    alignItems: "center",
    paddingHorizontal: "5%",
  },
  feature: {
    paddingVertical: "5%",
  },
  imageContainer: {},
});

type NewChangeProps = {
  change: Change;
  width: number;
};

function NewChange({ change, width }: NewChangeProps) {
  const { height } = useWindowDimensions();
  return (
    <View style={[newChangeStyles.container, { width }]}>
      <Text>
        <Text style={newChangeStyles.feature}>{change.feature}</Text>
        <Text>{` `}</Text>
        <Text light>{change.description}</Text>
      </Text>
      <Image
        source={change.image}
        resizeMode="cover"
        style={{ width: width * 0.8, height: height * 0.7 }}
      />
    </View>
  );
}

const whatsNewStyles = StyleSheet.create({
  container: {
    height: "100%",
  },
  paginationContainer: {
    ...StyleUtils.flexRowCenterAll(),
    paddingVertical: "5%",
  },
});

export function WhatsNew() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const whatsNew = WhatsNewApi.getWhatsNew();
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    WhatsNewApi.markWhatsNewAsSeen();
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const renderItem = useCallback(
    ({ item }: { item: Change }) => <NewChange change={item} width={width} />,
    [width]
  );

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width]
  );

  return (
    <View style={[whatsNewStyles.container, { paddingBottom: insets.bottom }]}>
      <HeaderPage
        title={`What's New`}
        subtitle={nativeApplicationVersion}
        leftAction={<CloseButton onClick={navigation.goBack} />}
      >
        <FlatList
          ref={flatListRef}
          data={whatsNew.changes}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          initialScrollIndex={0}
        />
        <View style={whatsNewStyles.paginationContainer}>
          <Pagination
            totalItemsCount={whatsNew.changes.length}
            currentIndex={currentPage}
          />
        </View>
      </HeaderPage>
    </View>
  );
}
