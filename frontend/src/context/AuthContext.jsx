import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("af_token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("af_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("af_user");
      }
    }
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem("af_token", newToken);
    localStorage.setItem("af_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("af_token");
    localStorage.removeItem("af_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (newUser) => {
    localStorage.setItem("af_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const apiFetch = async (endpoint, options = {}) => {
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    if (options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error(data.error || "Session expired. Please log in again.");
    }

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout, updateUser, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
