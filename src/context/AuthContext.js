"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    setIsAuthenticated(!!token);
    setLoading(false);

    const handleTokenRefresh = () => {
      const newToken = Cookies.get("accessToken");
      setIsAuthenticated(!!newToken);
    };

    const handleTokenRefreshFailed = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('tokenRefreshed', handleTokenRefresh);
    window.addEventListener('tokenRefreshFailed', handleTokenRefreshFailed);

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
      window.removeEventListener('tokenRefreshFailed', handleTokenRefreshFailed);
    };
  }, []);

  const login = ({ token, refreshToken, userId }) => {
    Cookies.set("accessToken", token, { secure: false, sameSite: "Lax" });
    Cookies.set("refreshToken", refreshToken, { secure: false, sameSite: "Lax" });
    Cookies.set("userId", userId, { secure: false, sameSite: "Lax" });

    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("userId");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
