import { Keypad } from "@/components/util/keypad";
import { KeypadType } from "@/interface";
import React, { useContext, createContext, useState, useCallback } from "react";

type KeypadActions = {
  editWeight: (weight: string, callerId: string) => void;
  editReps: (reps: string, callerId: string) => void;
  close: () => void;
};

type KeypadContext = {
  show: boolean;
  actions: KeypadActions;
  value?: string;
  callerId?: string;
};

type KeypadState = {
  show: boolean;
  type: KeypadType;
  value?: string;
  callerId?: string;
};

const context = createContext<KeypadContext>({
  show: false,
  actions: {
    editWeight: (weight: string, callerId: string) => {},
    editReps: (reps: string, callerId: string) => {},
    close: () => {},
  },
});

type Props = {
  children: React.ReactNode;
};

export function KeypadProvider({ children }: Props) {
  const [state, setState] = useState<KeypadState>({
    show: false,
    type: KeypadType.WEIGHT,
  });

  const { show, type, value, callerId } = state;

  const close = useCallback(() => {
    setState({ show: false, type: KeypadType.WEIGHT });
  }, [setState]);

  return (
    <context.Provider
      value={{
        show,
        actions: {
          editWeight: (weight: string, callerId: string) =>
            setState({
              show: true,
              value: weight,
              type: KeypadType.WEIGHT,
              callerId,
            }),
          editReps: (reps: string, callerId: string) =>
            setState({
              show: true,
              value: reps,
              type: KeypadType.REPS,
              callerId,
            }),
          close,
        },
        value,
        callerId,
      }}
    >
      <>
        {children}
        <Keypad
          show={show}
          close={close}
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

export function useKeypad() {
  return useContext(context);
}
