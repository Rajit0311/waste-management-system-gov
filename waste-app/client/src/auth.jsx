import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) return setReady(true);
    api("/auth/me").then((d) => setUser(d.user)).catch(() => localStorage.removeItem("token")).finally(() => setReady(true));
  }, []);

  const signIn = ({ token, user }) => { localStorage.setItem("token", token); setUser(user); };
  const signOut = () => { localStorage.removeItem("token"); setUser(null); };
  return <Ctx.Provider value={{ user, ready, signIn, signOut }}>{ready ? children : null}</Ctx.Provider>;
}

export const homeFor = (role) => ({ admin: "/admin", employee: "/tasks", citizen: "/report" }[role] || "/login");
