import { Keypad } from "@/components/keypad";
import { KeypadType } from "@/interface";
import React, { useContext, createContext, useState, useCallback } from "react";

type KeypadActions = {
  editWeight: (weight: string, callerId: string) => void;
  editReps: (reps: string, callerId: string) => void;
  close: () => void;
};

type KeypadContext = {
  isOpen: boolean;
  actions: KeypadActions;
  value?: string;
  callerId?: string;
};

type KeypadState = {
  open: boolean;
  type: KeypadType;
  value?: string;
  callerId?: string;
};

const context = createContext<KeypadContext>({
  isOpen: false,
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
    open: false,
    type: KeypadType.WEIGHT,
  });

  const { open, type, value, callerId } = state;

  const close = useCallback(() => {
    setState({ open: false, type: KeypadType.WEIGHT });
  }, [setState]);

  return (
    <context.Provider
      value={{
        isOpen: open,
        actions: {
          editWeight: (weight: string, callerId: string) =>
            setState({
              open: true,
              value: weight,
              type: KeypadType.WEIGHT,
              callerId,
            }),
          editReps: (reps: string, callerId: string) =>
            setState({
              open: true,
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
          shouldOpen={open}
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
