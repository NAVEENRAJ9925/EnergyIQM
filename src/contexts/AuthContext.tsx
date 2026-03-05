import React, { createContext, useContext, useState, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("iot_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    // Simulated auth
    await new Promise((r) => setTimeout(r, 800));
    const u: User = { id: "1", name: email.split("@")[0], email };
    localStorage.setItem("iot_user", JSON.stringify(u));
    setUser(u);
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const u: User = { id: "1", name, email };
    localStorage.setItem("iot_user", JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("iot_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
