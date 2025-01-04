"use client"

import React, { useContext, ReactNode, useState, createContext, useEffect } from 'react';
import { Models } from 'appwrite';

interface UserContextType {
  user: Models.User<Models.Preferences> | null;
  setUser: React.Dispatch<React.SetStateAction<Models.User<Models.Preferences> | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);


export function useUser() {
  return useContext(UserContext);
}

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
