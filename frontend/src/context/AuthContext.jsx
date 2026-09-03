import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const SEED_USERS = {
  AGENT: { mobile: "09120000002", password: "Password123!", name: "علی مشاور (مشاور)", role: "AGENT" },
  BUYER: { mobile: "09120000003", password: "Password123!", name: "رضا خریدار (خریدار)", role: "BUYER" },
  ADMIN: { mobile: "09120000001", password: "Password123!", name: "مدیر سیستم (مدیر)", role: "ADMIN" },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("access_token") || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      api.get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (mobile, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { mobile, password });
      const { access_token, user: loggedUser } = res.data;
      setToken(access_token);
      setUser(loggedUser);
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    } catch (err) {
      const msg = err.response?.data?.message || "خطا در ورود به سیستم";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (roleName) => {
    const creds = SEED_USERS[roleName];
    if (!creds) return;
    return await login(creds.mobile, creds.password);
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", userData);
      const { access_token, user: newUser } = res.data;
      setToken(access_token);
      setUser(newUser);
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (err) {
      const msg = err.response?.data?.message || "خطا در ثبت‌نام";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token,
        loading,
        login,
        quickLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
