import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, homeFor } from "./auth.jsx";
import { Nav, Guard } from "./ui.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Report from "./pages/Report.jsx";
import MyReports from "./pages/MyReports.jsx";
import Tasks from "./pages/Tasks.jsx";
import Admin from "./pages/Admin.jsx";
import Notifications from "./pages/Notifications.jsx";

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to={user ? homeFor(user.role) : "/login"} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<Login admin />} />
          <Route path="/report" element={<Guard roles={["citizen"]}><Report /></Guard>} />
          <Route path="/my" element={<Guard roles={["citizen"]}><MyReports /></Guard>} />
          <Route path="/tasks" element={<Guard roles={["employee"]}><Tasks /></Guard>} />
          <Route path="/admin" element={<Guard roles={["admin"]}><Admin /></Guard>} />
          <Route path="/notifications" element={<Guard roles={["citizen", "employee"]}><Notifications /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
