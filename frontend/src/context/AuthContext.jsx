import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("ledger_token");
    const storedUser = localStorage.getItem("ledger_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setReady(true);
  }, []);

  function persistSession(user, token) {
    setUser(user);
    setToken(token);
    localStorage.setItem("ledger_token", token);
    localStorage.setItem("ledger_user", JSON.stringify(user));
  }

  async function login(email, password) {
    const data = await api.login(email, password);
    persistSession(data.user, data.token);
  }

  async function register(name, email, password) {
    const data = await api.register(name, email, password);
    persistSession(data.user, data.token);
  }

  async function logout() {
    try {
      await api.logout(token);
    } catch {
      // ignore network errors on logout, clear local session regardless
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("ledger_token");
    localStorage.removeItem("ledger_user");
  }

  return (
    <AuthContext.Provider
      value={{ user, token, ready, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
