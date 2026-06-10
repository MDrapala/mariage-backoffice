import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ChangePassword from "@/pages/ChangePassword";

export default function RequireAuth() {
  const { isAuthenticated, mustChangePassword } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  // Première connexion : on impose le choix d'un mot de passe avant tout accès.
  if (mustChangePassword) {
    return <ChangePassword />;
  }
  return <Outlet />;
}
