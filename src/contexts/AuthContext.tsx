import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  adminLogin,
  getToken,
  setToken,
  clearToken,
} from "@/lib/api";

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem("bo_admin_username"),
  );

  const login = useCallback(async (user: string, password: string) => {
    const res = await adminLogin(user, password);
    setToken(res.token);
    localStorage.setItem("bo_admin_username", res.username);
    setTokenState(res.token);
    setUsername(res.username);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem("bo_admin_username");
    setTokenState(null);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
