import { createContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any | null;
  logout: () => Promise<void>;
  setAuth: (userData: any) => void; // Add setAuth to the context type
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
