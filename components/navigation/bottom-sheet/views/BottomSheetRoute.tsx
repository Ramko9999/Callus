import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
  BottomSheetBackgroundProps,
  BottomSheetHandle,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Keyboard, Platform, View, ViewStyle, StyleSheet } from "react-native";
import { View as ThemedView, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import {
  CONTAINER_HEIGHT,
  DEFAULT_BACKDROP_COLOR,
  DEFAULT_BACKDROP_OPACITY,
  DEFAULT_HEIGHT,
} from "../constants";
import { BottomSheetNavigatorContext } from "../contexts/internal";
import type { BottomSheetDescriptor } from "../types";

const bottomSheetStyles = StyleSheet.create({
  handle: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  background: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  indicator: {
    width: "20%",
    height: 3,
  },
});

interface Props {
  routeKey: string;
  descriptor: BottomSheetDescriptor;
  removing?: boolean;
  onDismiss: (key: string, removed: boolean) => void;
}

const BottomSheetRoute = ({
  routeKey,
  descriptor: { options, render, navigation },
  onDismiss,
  removing = false,
}: Props) => {
  // #region extract options
  const {
    enableContentPanningGesture,
    enableHandlePanningGesture,
    enablePanDownToClose = true,
    index = 0,
    snapPoints = ["100%"],
    backdropColor = DEFAULT_BACKDROP_COLOR,
    backdropOpacity = DEFAULT_BACKDROP_OPACITY,
    backdropPressBehavior = "close",
    height = DEFAULT_HEIGHT,
    offsetY = Platform.OS === "android" ? 20 : 3,
    enableBackdrop = true,
    enableBackground = false,
    enableHandle = false,
  } = options || {};
  // #endregion

  // #region refs
  const ref = useRef<BottomSheet>(null);

  const removingRef = useRef(false);
  removingRef.current = removing;

  // const
  // #endregion

  // #region styles
  // @ts-ignore type mismatch
  const screenContainerStyle: ViewStyle = useMemo(
    () => ({
      height,
    }),
    [height]
  );

  const backdropStyle = useMemo(
    () => ({
      backgroundColor: backdropColor,
    }),
    [backdropColor]
  );

  const sheetColor = useThemeColoring("primaryViewBackground");
  const textColor = useThemeColoring("primaryText");

  const renderBackground = useCallback(
    (props: BottomSheetBackgroundProps) => (
      <ThemedView
        {...props}
        style={[
          props.style,
          { backgroundColor: sheetColor },
          bottomSheetStyles.background,
        ]}
      />
    ),
    [sheetColor]
  );

  const renderHandle = useCallback(
    (props: any) => (
      <BottomSheetHandle
        {...props}
        style={[
          props.style,
          {
            ...bottomSheetStyles.handle,
          },
        ]}
        indicatorStyle={{
          backgroundColor: textColor,
          ...bottomSheetStyles.indicator,
        }}
      />
    ),
    [sheetColor, textColor]
  );
  // #endregion

  // #region context methods
  const handleSettingSnapPoints = useCallback(
    (_snapPoints: (string | number)[]) => {
      navigation.setOptions({ snapPoints: _snapPoints });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleSettingEnableContentPanningGesture = useCallback(
    (value: boolean) => {
      navigation.setOptions({ enableContentPanningGesture: value });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleSettingEnablePanDownToClose = useCallback(
    (value: boolean) => {
      navigation.setOptions({ enablePanDownToClose: value });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleSettingEnableHandlePanningGesture = useCallback(
    (value: boolean) => {
      navigation.setOptions({ enableHandlePanningGesture: value });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const contextVariables = useMemo(
    () => ({
      setEnableContentPanningGesture: handleSettingEnableContentPanningGesture,
      setEnableHandlePanningGesture: handleSettingEnableHandlePanningGesture,
      setEnablePanDownToClose: handleSettingEnablePanDownToClose,
      setSnapPoints: handleSettingSnapPoints,
    }),
    [
      handleSettingEnableContentPanningGesture,
      handleSettingEnableHandlePanningGesture,
      handleSettingEnablePanDownToClose,
      handleSettingSnapPoints,
    ]
  );
  // #endregion

  // #region callbacks
  const handleOnClose = useCallback(() => {
    onDismiss(routeKey, removingRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // #endregion

  // #region effects
  useEffect(() => {
    if (removing === true && ref.current) {
      // close keyboard before closing the modal

      ref.current.close();
    }
  }, [removing]);
  // #endregion

  // #region renders
  const renderBackdropComponent = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={backdropOpacity}
        style={backdropStyle}
        pressBehavior={backdropPressBehavior}
        {...props}
      />
    ),
    [backdropOpacity, backdropStyle]
  );

  // todo: make rendering a backdrop a configuration

  return (
    <BottomSheetNavigatorContext.Provider value={contextVariables}>
      <BottomSheet
        activeOffsetY={[-offsetY, offsetY]}
        animateOnMount
        backdropComponent={enableBackdrop ? renderBackdropComponent : null}
        backgroundComponent={enableBackground ? renderBackground : null}
        containerHeight={CONTAINER_HEIGHT}
        enableContentPanningGesture={enableContentPanningGesture}
        enableHandlePanningGesture={enableHandlePanningGesture}
        enablePanDownToClose={enablePanDownToClose}
        handleComponent={enableHandle ? renderHandle : null}
        index={index}
        onClose={handleOnClose}
        ref={ref}
        snapPoints={snapPoints}
      >
        <BottomSheetView>
          {render()}
        </BottomSheetView>
      </BottomSheet>
    </BottomSheetNavigatorContext.Provider>
  );
};

export default BottomSheetRoute;
