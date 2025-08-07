import { forwardRef, ForwardedRef, useCallback, ReactNode } from "react";
import { StyleSheet } from "react-native";
import { View, Text, useThemeColoring } from "@/components/Themed";
import { StyleUtils } from "@/util/styles";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackgroundProps,
  BottomSheetHandle,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";

const popupBottomSheetStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
  },
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

type PopupBottomSheetProps = {
  children: ReactNode;
  show: boolean;
  onHide: () => void;
  enablePanDownToClose?: boolean;
  snapPoints?: string[];
};

export const PopupBottomSheet = forwardRef(
  (
    { children, show, onHide, enablePanDownToClose = true, snapPoints = [] }: PopupBottomSheetProps,
    ref: ForwardedRef<BottomSheet>
  ) => {
    const sheetColor = useThemeColoring("primaryViewBackground");
    const textColor = useThemeColoring("primaryText");

    const renderBackground = useCallback(
      (props: BottomSheetBackgroundProps) => (
        <View
          {...props}
          style={[
            props.style,
            { backgroundColor: sheetColor },
            popupBottomSheetStyles.background,
          ]}
        />
      ),
      [sheetColor]
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const renderHandle = useCallback(
      (props: any) => (
        <BottomSheetHandle
          {...props}
          style={[
            props.style,
            {
              ...popupBottomSheetStyles.handle,
            },
          ]}
          indicatorStyle={{
            backgroundColor: textColor,
            ...popupBottomSheetStyles.indicator,
          }}
        />
      ),
      [sheetColor, textColor]
    );

    return (
      <BottomSheet
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        enableOverDrag={false}
        onClose={onHide}
        index={show ? 0 : -1}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        backgroundComponent={renderBackground}
      >
        <BottomSheetView
          style={[
            popupBottomSheetStyles.container,
            { backgroundColor: sheetColor },
          ]}
        >
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);



type PopupBottomSheetModalProps = {
  children: ReactNode;
  header?: ReactNode;
}

export const PopupBottomSheetModal = forwardRef(
  ({ children, header }: PopupBottomSheetModalProps, ref: ForwardedRef<BottomSheetModal>) => {
    const sheetColor = useThemeColoring("primaryViewBackground");
    const textColor = useThemeColoring("primaryText");

    const renderBackground = useCallback(
      (props: BottomSheetBackgroundProps) => (
        <View
          {...props}
          style={[
            props.style,
            { backgroundColor: sheetColor },
            popupBottomSheetStyles.background,
          ]}
        />
      ),
      [sheetColor]
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const renderHandle = useCallback(
      (props: any) => (
        <BottomSheetHandle
          {...props}
          style={[
            props.style,
            {
              ...popupBottomSheetStyles.handle,
            },
          ]}
          indicatorStyle={{
            backgroundColor: textColor,
            ...popupBottomSheetStyles.indicator,
          }}
        >
          {header}
        </BottomSheetHandle>
      ),
      [sheetColor, textColor, header]
    );

    return (
      <BottomSheetModal 
        ref={ref}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        backgroundComponent={renderBackground}
      >
        <BottomSheetView
          style={[
            popupBottomSheetStyles.container,
            { backgroundColor: sheetColor },
          ]}
        >
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)