import { createContext, useContext, useState, useEffect } from "react";

type Role = "admin" | "staff" | "student" | null;

interface AuthUser {
  role: Role;
  name?: string;
  email?: string;
  token: string;
  id?: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AuthContextType {
  authUser: AuthUser | null;
  setAuthUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  logout: () => void;
}

// Create context
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthContextProvider");
  }
  return context;
};

// Provider
export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("auth-user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (authUser) {
      localStorage.setItem("auth-user", JSON.stringify(authUser));
    } else {
      localStorage.removeItem("auth-user");
    }
  }, [authUser]);

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem("auth-user");
  };

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
