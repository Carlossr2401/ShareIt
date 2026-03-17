import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import MyReservations from "./pages/MyReservations";
import Wallet from "./pages/Wallet";
import AdminResources from "./pages/AdminResources";
import AdminReservations from "./pages/AdminReservations";

export default function App() {
  return (
    <Routes>
      {/* Auth pages (no sidebar) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main app (with sidebar layout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/reservations" element={<MyReservations />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/admin/resources" element={<AdminResources />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
      </Route>
    </Routes>
  );
}
