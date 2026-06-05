import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Login from "@/pages/Login";
import Overview from "@/pages/Overview";
import Guests from "@/pages/Guests";
import Info from "@/pages/Info";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/invites" element={<Guests />} />
          <Route path="/informations" element={<Info />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
