import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import MyReservations from "./pages/MyReservations";
import Wallet from "./pages/Wallet";
import AdminResources from "./pages/AdminResources";
import AdminReservations from "./pages/AdminReservations";
import AdminMasterCalendar from "./pages/AdminMasterCalendar";
import ResourceReservations from "./pages/ResourceReservations";
import CheckIn from "./pages/CheckIn";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";
import EditProfile from "./pages/EditProfile";
import FavoritesPage from "./context/FavoritesPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Comprueba si hay una bandera de sesión en localStorage.
  // Podrías en el futuro verificar /auth/me en vez de esto.
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Auth pages (no sidebar) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* App with Sidebar Layout (Totalmente Protegido) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<EditProfile />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/reservations" element={<MyReservations />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/my-listings" element={<AdminResources />} />
        <Route path="/admin/resources" element={<AdminResources />} />
        <Route path="/admin/master-calendar" element={<AdminMasterCalendar />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />

      </Route>
    </Routes>
  );
}
