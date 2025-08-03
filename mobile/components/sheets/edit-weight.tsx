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
import { WeightScale, ScaleRef } from "@/components/util/scale/weight";
import { useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";

const editWeightStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingHorizontal: "3%",
    paddingVertical: "3%",
  },
  input: {
    fontWeight: "600",
    fontSize: 40,
    textAlign: "center",
  },
  scaleContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: "5%",
  },
  buttonContainer: {
    ...StyleUtils.flexColumnCenterAll(20),
    paddingTop: "3%",
    paddingHorizontal: "5%",
    paddingBottom: "6%",
    width: "100%",
  },
  hint: {
    marginTop: "2%",
  },
});

type EditWeightSheetProps = SheetProps & {
  weight: number;
  onUpdate: (weight: number) => Promise<void>;
};

export const EditWeightSheet = forwardRef<BottomSheet, EditWeightSheetProps>(
  ({ show, hide, onHide, weight, onUpdate }, ref) => {
    const primaryAction = useThemeColoring("primaryAction");
    const [selectedWeight, setSelectedWeight] = useState(weight);
    const { width, height } = useWindowDimensions();
    const scaleRef = useRef<ScaleRef>(null);
    const firstRender = useRef(false);

    useEffect(() => {
      if (show) {
        scaleRef.current?.setWeight(weight);
      }
    }, [show, weight]);

    useEffect(() => {
      if (!firstRender.current) {
        firstRender.current = true;
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [selectedWeight]);

    const handleWeightChange = useCallback((newWeight: number) => {
      setSelectedWeight(newWeight);
    }, []);

    const handleUpdate = useCallback(() => {
      onUpdate(selectedWeight).then(() => {
        hide();
      });
    }, [onUpdate, selectedWeight, hide]);

    const isWeightUnchanged = selectedWeight === weight;

    return (
      <PopupBottomSheet show={show} onHide={onHide} ref={ref}>
        <View style={commonSheetStyles.sheetHeader}>
          <Text action style={{ fontWeight: 600 }}>
            Edit your bodyweight
          </Text>
          <TouchableOpacity onPress={hide}>
            <SheetX size={14} />
          </TouchableOpacity>
        </View>
        <View style={editWeightStyles.container}>
          <Text style={editWeightStyles.input}>{`${selectedWeight} lbs`}</Text>
          <View style={editWeightStyles.scaleContainer}>
            <WeightScale
              ref={scaleRef}
              initialWeight={weight}
              width={width * 0.9}
              height={height * 0.15}
              tickBaseHeight={height * 0.05}
              onChangeWeight={handleWeightChange}
            />
            <Text light style={editWeightStyles.hint}>
              Slide to adjust
            </Text>
          </View>
        </View>
        <View style={editWeightStyles.buttonContainer}>
          <TouchableOpacity
            style={[
              commonSheetStyles.sheetButton,
              {
                backgroundColor: primaryAction,
                opacity: isWeightUnchanged ? 0.5 : 1,
              },
            ]}
            onPress={handleUpdate}
            disabled={isWeightUnchanged}
          >
            <Text emphasized>Update</Text>
          </TouchableOpacity>
        </View>
      </PopupBottomSheet>
    );
  }
);
