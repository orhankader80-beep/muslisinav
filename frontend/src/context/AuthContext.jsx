import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiJson } from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      setUser(await apiJson("/auth/me"));
    } catch {
      try {
        setUser(await apiJson("/auth/refresh", { method: "POST" }));
      } catch {
        setUser(false);
      }
    }
  }, []);

  useEffect(() => {
    if (window.location.hash?.includes("session_id=")) return;
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try { await apiJson("/auth/logout", { method: "POST" }); } catch { /* cookies already gone */ }
    setUser(false);
  };

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
