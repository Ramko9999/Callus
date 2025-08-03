import { UserDetails } from "@/api/user";
import { createContext, useContext, useState } from "react";

type UserDetailsContext = {
  userDetails?: UserDetails;
  setUserDetails: (details: UserDetails) => void;
};

const context = createContext<UserDetailsContext>({
  setUserDetails: (details) => {},
});

type UserDetailsProviderProps = {
  children: React.ReactNode;
};

export function UserDetailsProvider({ children }: UserDetailsProviderProps) {
  const [userDetails, setUserDetails] = useState<UserDetails>();

  return (
    <context.Provider value={{ userDetails, setUserDetails }}>
      {children}
    </context.Provider>
  );
}

export function useUserDetails() {
  return useContext(context);
}
