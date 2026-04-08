import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';

// ---------- low-level storage wrappers ----------

export async function persistToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } else {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function loadPersistedToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

// ---------- context ----------

type AuthContextValue = {
  token: string | null;
  /** true while the persisted token is being loaded on first mount */
  isLoading: boolean;
  saveToken: (token: string | null) => Promise<void>;
};

import React from 'react';

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  isLoading: true,
  saveToken: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from storage on mount
  useEffect(() => {
    loadPersistedToken()
      .then((t) => setToken(t))
      .catch(() => setToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  const saveToken = async (newToken: string | null) => {
    await persistToken(newToken);
    setToken(newToken);
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { token, isLoading, saveToken } },
    children,
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
