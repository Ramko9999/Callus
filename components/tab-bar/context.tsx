import { createContext, useContext, useState } from "react";

type TabBarContext = {
  close: () => void;
  open: () => void;
  isOpen: boolean;
};

const context = createContext<TabBarContext>({
  close: () => {},
  open: () => {},
  isOpen: true,
});

type TabBarProviderProps = {
  children: React.ReactNode;
};

export function TabBarProvider({ children }: TabBarProviderProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <context.Provider
      value={{
        close: () => setIsOpen(false),
        open: () => setIsOpen(true),
        isOpen,
      }}
    >
      {children}
    </context.Provider>
  );
}

export function useTabBar() {
  return useContext(context);
}
