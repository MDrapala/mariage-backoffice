import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  adminLogin,
  changePassword as apiChangePassword,
  getToken,
  setToken,
  clearToken,
  type UserRole,
} from "@/lib/api";

interface AuthState {
  token: string | null;
  username: string | null;
  displayName: string | null;
  role: UserRole | null;
  side: "marie" | "mariee" | null;
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const KEY = {
  username: "bo_admin_username",
  displayName: "bo_display_name",
  role: "bo_role",
  side: "bo_side",
  mustChange: "bo_must_change",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem(KEY.username),
  );
  const [displayName, setDisplayName] = useState<string | null>(
    () => localStorage.getItem(KEY.displayName) || null,
  );
  const [role, setRole] = useState<UserRole | null>(
    () => (localStorage.getItem(KEY.role) as UserRole | null) ?? null,
  );
  const [side, setSide] = useState<"marie" | "mariee" | null>(
    () => (localStorage.getItem(KEY.side) as "marie" | "mariee" | null) || null,
  );
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(
    () => localStorage.getItem(KEY.mustChange) === "1",
  );

  const login = useCallback(async (user: string, password: string) => {
    const res = await adminLogin(user, password);
    setToken(res.token);
    localStorage.setItem(KEY.username, res.username);
    localStorage.setItem(KEY.displayName, res.displayName ?? "");
    localStorage.setItem(KEY.role, res.role);
    localStorage.setItem(KEY.side, res.side ?? "");
    localStorage.setItem(KEY.mustChange, res.mustChangePassword ? "1" : "0");
    setTokenState(res.token);
    setUsername(res.username);
    setDisplayName(res.displayName ?? null);
    setRole(res.role);
    setSide(res.side ?? null);
    setMustChangePassword(res.mustChangePassword);
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    await apiChangePassword(newPassword);
    localStorage.setItem(KEY.mustChange, "0");
    setMustChangePassword(false);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    Object.values(KEY).forEach((k) => localStorage.removeItem(k));
    setTokenState(null);
    setUsername(null);
    setDisplayName(null);
    setRole(null);
    setSide(null);
    setMustChangePassword(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        displayName,
        role,
        side,
        mustChangePassword,
        isAuthenticated: !!token,
        login,
        changePassword,
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
