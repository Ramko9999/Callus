import React, {
  forwardRef,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import { View, Text } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColoring } from "@/components/Themed";
import { commonSheetStyles, SheetProps, SheetX } from "./common";
import { StyleUtils } from "@/util/styles";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { HeightScale, ScaleRef } from "@/components/util/scale/height";
import { useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { formatHeight } from "@/components/pages/onboarding/slides/common";

const editHeightStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    paddingHorizontal: "3%",
    paddingVertical: "3%",
  },
  row: {
    ...StyleUtils.flexRowCenterAll(),
    width: "100%",
  },
  input: {
    fontWeight: "600",
    fontSize: 40,
    textAlign: "center",
  },
  scaleContainer: {
    width: "50%",
  },
  valueContainer: {
    ...StyleUtils.flexRowCenterAll(),
    width: "50%",
  },
  buttonContainer: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingTop: "3%",
    paddingHorizontal: "5%",
    paddingBottom: "6%",
    width: "100%",
  },
});

type EditHeightSheetProps = SheetProps & {
  height: number;
  onUpdate: (height: number) => Promise<void>;
};

export const EditHeightSheet = forwardRef<BottomSheet, EditHeightSheetProps>(
  ({ show, hide, onHide, height, onUpdate }, ref) => {
    const primaryAction = useThemeColoring("primaryAction");
    const [selectedHeight, setSelectedHeight] = useState(height);
    const { width, height: windowHeight } = useWindowDimensions();
    const scaleRef = useRef<ScaleRef>(null);
    const firstRender = useRef(false);

    useEffect(() => {
      if (show) {
        scaleRef.current?.setHeight(height);
      }
    }, [show, height]);

    useEffect(() => {
      if (!firstRender.current) {
        firstRender.current = true;
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [selectedHeight]);

    const handleHeightChange = useCallback((newHeight: number) => {
      setSelectedHeight(newHeight);
    }, []);

    const handleUpdate = useCallback(() => {
      onUpdate(selectedHeight).then(() => {
        hide();
      });
    }, [onUpdate, selectedHeight, hide]);

    const isHeightUnchanged = selectedHeight === height;

    return (
      <PopupBottomSheet show={show} onHide={onHide} ref={ref}>
        <View style={commonSheetStyles.sheetHeader}>
          <Text action style={{ fontWeight: 600 }}>
            Edit your height
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX size={14} />
          </TouchableOpacity>
        </View>
        <View style={editHeightStyles.container}>
          <View style={editHeightStyles.row}>
            <View style={editHeightStyles.scaleContainer}>
              <HeightScale
                ref={scaleRef}
                initialHeight={height}
                width={width * 0.5}
                svgHeight={windowHeight * 0.25}
                tickBaseWidth={width * 0.075}
                onChangeHeight={handleHeightChange}
              />
            </View>
            <View style={editHeightStyles.valueContainer}>
              <Text style={editHeightStyles.input}>
                {formatHeight(selectedHeight)}
              </Text>
            </View>
          </View>
        </View>
        <View style={editHeightStyles.buttonContainer}>
          <TouchableOpacity
            style={[
              commonSheetStyles.sheetButton,
              {
                backgroundColor: primaryAction,
                opacity: isHeightUnchanged ? 0.5 : 1,
              },
            ]}
            onPress={handleUpdate}
            disabled={isHeightUnchanged}
          >
            <Text emphasized>Update</Text>
          </TouchableOpacity>
        </View>
      </PopupBottomSheet>
    );
  }
);
