import { KeypadType } from "@/interface";
import React, { useContext, createContext, useState, useCallback } from "react";
import { InputsPad } from ".";

type InputsPadActions = {
  editWeight: (weight: string, callerId: string) => void;
  editReps: (reps: string, callerId: string) => void;
  close: () => void;
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
    editWeight: (weight: string, callerId: string) => {},
    editReps: (reps: string, callerId: string) => {},
    close: () => {},
  },
});

type Props = {
  children: React.ReactNode;
};

// todo: put this only in the editors
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
          close: onHide,
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
