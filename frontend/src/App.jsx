import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import GoalSheetForm from "./pages/GoalSheetForm";
import CheckInPage from "./pages/CheckInPage";
import Layout from "./components/shared/Layout";

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === "admin") return <Navigate to="/admin" />;
  if (user.role === "manager") return <Navigate to="/manager" />;
  return <Navigate to="/employee" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleRouter />} />
          <Route path="/employee" element={
            <ProtectedRoute roles={["employee"]}>
              <Layout><EmployeeDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/employee/goals/new" element={
            <ProtectedRoute roles={["employee"]}>
              <Layout><GoalSheetForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/employee/checkin/:sheetId" element={
            <ProtectedRoute roles={["employee"]}>
              <Layout><CheckInPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/manager" element={
            <ProtectedRoute roles={["manager"]}>
              <Layout><ManagerDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
