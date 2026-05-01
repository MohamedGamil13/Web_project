import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getStoredToken, setStoredToken } from "@/lib/apiClient";
import { getMe, logoutServer } from "./api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [bootstrapping, setBootstrapping] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    setStoredToken(token);
  }, [token]);

  // Hydrate the current user when a token is present (page reload, deep link, etc.)
  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setUser(null);
      setBootstrapping(false);
      return;
    }
    setBootstrapping(true);
    getMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setBootstrapping(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback((nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
  }, []);

  const logout = useCallback(async () => {
    await logoutServer();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      bootstrapping,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setUser,
    }),
    [user, token, bootstrapping, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
