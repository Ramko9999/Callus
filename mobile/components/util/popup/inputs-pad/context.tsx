import { KeypadType } from "@/interface";
import React, {
  useContext,
  createContext,
  useState,
  useCallback,
} from "react";
import { InputsPad } from ".";

type InputsPadActions = {
  edit: (value: string, callerId: string, type: KeypadType) => void;
};

type InputsPadContext = {
  show: boolean;
  actions: InputsPadActions;
  value: string;
  callerId?: string;
};

type InputsPadState = {
  show: boolean;
  type: KeypadType;
  value: string;
  callerId?: string;
};

const context = createContext<InputsPadContext>({
  show: false,
  value: "",
  actions: {
    edit: (value: string, callerId: string, type: KeypadType) => {},
  },
});

type Props = {
  children: React.ReactNode;
};

// todo: slow on android - make it smooth
export function InputsPadProvider({ children }: Props) {
  const [state, setState] = useState<InputsPadState>({
    show: false,
    value: "",
    type: KeypadType.WEIGHT,
  });

  const { show, type, value, callerId } = state;

  const onHide = useCallback(() => {
    setState({ show: false, value: "", type: KeypadType.WEIGHT });
  }, [setState]);

  return (
    <context.Provider
      value={{
        show,
        actions: {
          edit: (value: string, callerId: string, type: KeypadType) =>
            setState({ show: true, value, callerId, type }),
        },
        value,
        callerId,
      }}
    >
      <>
        {children}
        <InputsPad
          show={show}
          onHide={onHide}
          value={value}
          type={type}
          onUpdate={(value: string) => {
            setState({ ...state, value });
          }}
        />
      </>
    </context.Provider>
  );
}

export function useInputsPad() {
  return useContext(context);
}
