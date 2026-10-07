import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "./api";
import { useAuth, homeFor } from "./auth.jsx";

export const LABEL = { pending: "Waiting", assigned: "Assigned", in_progress: "In progress", resolved: "Cleaned", rejected: "Rejected" };
export const CATEGORY = { garbage_pile: "Garbage pile", overflowing_bin: "Overflowing bin", illegal_dumping: "Illegal dumping", missed_pickup: "Missed pickup", other: "Other" };

export const Chip = ({ status }) => <span className={"chip " + status}>{LABEL[status]}</span>;
export const mapLink = (l) => `https://www.google.com/maps?q=${l.lat},${l.lng}`;
export const when = (d) => new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export function Nav() {
  const { user, signOut } = useAuth();
  const go = useNavigate();
  const [unread, setUnread] = useState(0);

  // Check for new notifications every 20 seconds (citizens and employees)
  useEffect(() => {
    if (!user || user.role === "admin") return setUnread(0);
    const check = () => api("/notifications/unread").then((d) => setUnread(d.unread)).catch(() => {});
    check();
    const t = setInterval(check, 20000);
    return () => clearInterval(t);
  }, [user]);

  return (
    <header className="nav">
      <Link to="/" className="brand">CleanCity</Link>
      <nav>
        {user?.role === "citizen" && <><Link to="/report">Report waste</Link><Link to="/my">My reports</Link></>}
        {user?.role === "employee" && <Link to="/tasks">My tasks</Link>}
        {user?.role === "admin" && <Link to="/admin">Dashboard</Link>}
        {user && user.role !== "admin" && <Link to="/notifications">Notifications{unread > 0 && <span className="badge">{unread}</span>}</Link>}
        {user ? <button className="ghost" onClick={() => { signOut(); go("/login"); }}>Log out ({user.name.split(" ")[0]})</button>
               : <><Link to="/login">Log in</Link><Link to="/signup">Sign up</Link></>}
      </nav>
    </header>
  );
}

// Route guard: sends people to the right login if they lack the role
export function Guard({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={roles.includes("admin") && roles.length === 1 ? "/admin/login" : "/login"} replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}
