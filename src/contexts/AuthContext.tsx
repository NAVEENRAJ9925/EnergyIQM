import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, setToken } from "@/lib/api";

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


  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("iot_user", JSON.stringify(res.user));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.auth.register(name, email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("iot_user", JSON.stringify(res.user));
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("energyiq_token");
    if (t) setToken(t);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("iot_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
