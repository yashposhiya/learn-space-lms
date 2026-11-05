import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import { AuthProvider, useAuth } from "./features/auth/AuthContext.jsx";
import { AuthPage, LandingPage } from "./features/auth/AuthPages.jsx";
import AdminPeoplePage from "./features/admin/AdminPages.jsx";
import { AssignmentsPage, CoursesPage, DashboardPage } from "./features/student/StudentPages.jsx";
import { seedAssignments, seedCourses, seedUsers } from "./data/seedData.js";
import { seedStorage } from "./services/storage.js";
import { applyTheme, getTheme } from "./services/theme.js";
import "./styles.css";

seedStorage(seedUsers, seedCourses, seedAssignments);
applyTheme(getTheme());

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function Workspace({ children, roles }) {
  return <ProtectedRoute roles={roles}><AppLayout>{children}</AppLayout></ProtectedRoute>;
}

function App() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/signup" element={<AuthPage mode="signup" />} />
    <Route path="/dashboard" element={<Workspace><DashboardPage /></Workspace>} />
    <Route path="/courses" element={<Workspace><CoursesPage /></Workspace>} />
    <Route path="/assignments" element={<Workspace><AssignmentsPage /></Workspace>} />
    <Route path="/users" element={<Workspace roles={["admin"]}><AdminPeoplePage /></Workspace>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>,
);
