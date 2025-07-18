import { createContext, useContext, useState, useEffect } from "react";

type Role = "admin" | "staff" | "student" | null;

interface AuthUser {
  role: Role;
  name?: string;
  email?: string;
  token: string;
  id?: string;
  [key: string]: any;
}

interface AuthContextType {
  authUser: AuthUser | null;
  setAuthUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  logout: () => void;
}

// Context creation
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook
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
    localStorage.removeItem("token");
    localStorage.removeItem("staffId");
  };

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
