import React, {
  forwardRef,
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { View, Text } from "@/components/Themed";
import { Change, WhatsNewApi } from "@/api/whats-new";
import { StyleUtils } from "@/util/styles";
import BottomSheet from "@gorhom/bottom-sheet";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import { commonSheetStyles, SheetProps, SheetX } from "./common";
import { TouchableOpacity, Image } from "react-native";
import { Pagination } from "@/components/util/pagination";
import { FlatList } from "react-native-gesture-handler";
import { nativeApplicationVersion } from "expo-application";

const newChangeStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumnCenterAll(),
    paddingHorizontal: "5%",
  },
  feature: {
    paddingVertical: "5%",
  },
  imageContainer: {
    aspectRatio: 1,
  },
  featureContainer: {
    height: "15%",
  },
});

type NewChangeProps = {
  change: Change;
  width: number;
};

function NewChange({ change, width }: NewChangeProps) {
  return (
    <View style={[newChangeStyles.container, { width }]}>
      <View style={newChangeStyles.featureContainer}>
        <Text>
          <Text style={newChangeStyles.feature}>{change.feature}</Text>
          <Text>{` `}</Text>
          <Text light>{change.description}</Text>
        </Text>
      </View>
      <View style={[{ width }, newChangeStyles.imageContainer]}>
        <Image source={change.image} style={{ width: width, height: width }} />
      </View>
    </View>
  );
}

const whatsNewSheetStyles = StyleSheet.create({
  paginationContainer: {
    ...StyleUtils.flexRowCenterAll(),
    paddingVertical: "5%",
  },
});

type WhatsNewSheetProps = SheetProps;

export const WhatsNewSheet = forwardRef<BottomSheet, WhatsNewSheetProps>(
  ({ show, hide, onHide }, ref) => {
    const { width } = useWindowDimensions();
    const whatsNew = WhatsNewApi.getWhatsNew();
    const [currentPage, setCurrentPage] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
      if (show) {
        setCurrentPage(0);
        WhatsNewApi.markWhatsNewAsSeen();
      }
    }, [show]);

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
      <PopupBottomSheet ref={ref} show={show} onHide={onHide}>
        <View style={commonSheetStyles.sheetHeader}>
          <Text action style={{ fontWeight: 600 }}>
            {`What's New - ${nativeApplicationVersion}`}
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX />
          </TouchableOpacity>
        </View>
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
        <View style={whatsNewSheetStyles.paginationContainer}>
          <Pagination
            totalItemsCount={whatsNew.changes.length}
            currentIndex={currentPage}
          />
        </View>
      </PopupBottomSheet>
    );
  }
);
