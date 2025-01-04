"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { Models, ID } from 'appwrite';
import { account } from '@/lib/conf';


interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkUser();
    }
  }, []);

  const checkUser = async () => {
    try {
      if (typeof window === 'undefined' || !account) {
        throw new Error('Account service not initialized');
      }
      const session = await account.get();
      setUser(session);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      if (typeof window === 'undefined' || !account) {
        throw new Error('Account service not initialized');
      }
      await account.createEmailPasswordSession(email, password);
      await checkUser();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      if (typeof window === 'undefined' || !account) {
        throw new Error('Account service not initialized');
      }
      await account.create(ID.unique(), email, password, name);
      await signIn(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (typeof window === 'undefined' || !account) {
        throw new Error('Account service not initialized');
      }
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 