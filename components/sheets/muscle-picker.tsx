import { StyleSheet, useWindowDimensions } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import { TouchableOpacity } from "react-native";
import React, { forwardRef, useCallback, useEffect } from "react";
import { shadeColor, tintColor } from "@/util/color";
import { PopupBottomSheet } from "@/components/util/popup/sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { commonSheetStyles, SheetProps } from "./common";
import { SheetX } from "./common";
import {
  isMuscleUpperBody,
  isMusclePartOfArms,
  isMuscleLowerBody,
  ALL_MUSCLES,
} from "@/api/exercise";
import { MuscleDistinction } from "@/components/heatmap";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FlatList } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

type MuscleSection = {
  title: string;
  data: string[];
};

const getMuscleSections = (): MuscleSection[] => {
  const upperBodyMuscles = ALL_MUSCLES.filter(isMuscleUpperBody);
  const armsMuscles = ALL_MUSCLES.filter(isMusclePartOfArms);
  const lowerBodyMuscles = ALL_MUSCLES.filter(isMuscleLowerBody);

  return [
    { title: "Upper Body", data: upperBodyMuscles },
    { title: "Arms", data: armsMuscles },
    { title: "Lower Body", data: lowerBodyMuscles },
  ].filter((section) => section.data.length > 0);
};

const muscleItemStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexRow(),
    flex: 1,
  },
  content: {
    ...StyleUtils.flexRow(),
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: "2%",
    paddingHorizontal: "3%",
    borderBottomWidth: 1,
    flex: 1,
    position: "relative",
  },
  textContent: {
    ...StyleUtils.flexColumn(4),
    flex: 1,
  },
  icon: {
    marginRight: 12,
    borderRadius: "50%",
    padding: "2%",
    borderWidth: 1,
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    height: "100%",
    width: "100%",
  },
});

type MuscleItemProps = {
  muscle: string;
  isPrimaryMuscle: boolean;
  isSecondaryMuscle: boolean;
  onPress: (muscle: string) => void;
  borderColor: string;
  primaryActionColor: string;
};

const MuscleItem = React.memo(({
  muscle,
  isPrimaryMuscle,
  isSecondaryMuscle,
  onPress,
  borderColor,
  primaryActionColor,
}: MuscleItemProps) => {
  const isSelected = isPrimaryMuscle || isSecondaryMuscle;
  const iconContainerColor = shadeColor(
    useThemeColoring("primaryViewBackground"),
    0.05
  );
  const iconContainerBorderColor = tintColor(
    useThemeColoring("primaryViewBackground"),
    0.05
  );
  const overlayColor = useThemeColoring("primaryAction");
  const opacity = useSharedValue(
    isPrimaryMuscle ? 0.5 : isSecondaryMuscle ? 3 : 0
  );

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(muscle);
  }, [muscle, onPress]);

  useEffect(() => {
    if (isSelected) {
      opacity.value = withTiming(
        isPrimaryMuscle ? 0.2 : isSecondaryMuscle ? 0.1 : 0,
        { duration: 200 }
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isPrimaryMuscle, isSecondaryMuscle, isSelected]);

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      backgroundColor: overlayColor,
    };
  });

  return (
    <TouchableOpacity
      style={muscleItemStyles.container}
      activeOpacity={1}
      onPress={handlePress}
    >
      <View
        style={[muscleItemStyles.content, { borderBottomColor: borderColor }]}
      >
        <View
          style={[
            muscleItemStyles.icon,
            {
              backgroundColor: iconContainerColor,
              borderColor: iconContainerBorderColor,
            },
          ]}
        >
          <MuscleDistinction size={44} muscle={muscle} intensity={1} />
        </View>
        <View style={muscleItemStyles.textContent}>
          <Text>{muscle}</Text>
          <Text light>
            {isPrimaryMuscle
              ? "Primary muscle"
              : isSecondaryMuscle
              ? "Secondary muscle"
              : "Not selected"}
          </Text>
        </View>
      </View>
      <Animated.View
        style={[
          muscleItemStyles.overlay,
          { backgroundColor: primaryActionColor },
          overlayAnimatedStyle,
        ]}
      />
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.muscle === nextProps.muscle &&
    prevProps.isPrimaryMuscle === nextProps.isPrimaryMuscle &&
    prevProps.isSecondaryMuscle === nextProps.isSecondaryMuscle &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.borderColor === nextProps.borderColor &&
    prevProps.primaryActionColor === nextProps.primaryActionColor
  );
});

const musclePickerSheetStyles = StyleSheet.create({
  container: {
    paddingBottom: "10%",
  },
  sectionHeader: {
    paddingHorizontal: "5%",
    paddingVertical: "3%",
    paddingTop: "5%",
  },
  sectionHeaderText: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

type MusclePickerSheetProps = SheetProps & {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  onSelectMuscle: (muscle: string) => void;
  mode: "primary" | "secondary";
};

export const MusclePickerSheet = forwardRef<
  BottomSheet,
  MusclePickerSheetProps
>(
  (
    {
      show,
      hide,
      onHide,
      primaryMuscles,
      secondaryMuscles,
      mode,
      onSelectMuscle,
    },
    ref
  ) => {
    const borderColor = tintColor(
      useThemeColoring("primaryViewBackground"),
      0.05
    );
    const primaryActionColor = useThemeColoring("primaryAction");
    const { height } = useWindowDimensions();

    const renderMuscleItem = ({ item: muscle }: { item: string }) => (
      <MuscleItem
        muscle={muscle}
        isPrimaryMuscle={primaryMuscles.includes(muscle)}
        isSecondaryMuscle={secondaryMuscles.includes(muscle)}
        onPress={onSelectMuscle}
        borderColor={borderColor}
        primaryActionColor={primaryActionColor}
      />
    );
    
    return (
      <PopupBottomSheet
        ref={ref}
        show={show}
        onHide={onHide}
      >
        <View style={musclePickerSheetStyles.container}>
          <View style={commonSheetStyles.sheetHeader}>
            <Text action style={{ fontWeight: 600 }}>
              {mode === "primary"
                ? "Select primary muscles"
                : "Select secondary muscles"}
            </Text>
            <TouchableOpacity onPress={hide}>
              <SheetX />
            </TouchableOpacity>
          </View>
          <FlatList
            data={getMuscleSections().flatMap(section => section.data)}
            renderItem={renderMuscleItem}
            style={{ height: height * 0.7 }}
            keyExtractor={(item: string) => item}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </PopupBottomSheet>
    );
  }
);
