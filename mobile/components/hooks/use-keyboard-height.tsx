import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

type UseKeyboardHeightResult = {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
};

export function useKeyboardHeight(): UseKeyboardHeightResult {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: any) => setKeyboardHeight(e.endCoordinates.height);
    const onHide = () => setKeyboardHeight(0);

    const showListener = Keyboard.addListener(showEvent, onShow);
    const hideListener = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return {
    isKeyboardOpen: keyboardHeight > 0,
    keyboardHeight,
  };
}
