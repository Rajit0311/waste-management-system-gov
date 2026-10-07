import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth, homeFor } from "../auth.jsx";

export default function Signup() {
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const { signIn } = useAuth();
  const go = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { const d = await api("/auth/signup", { method: "POST", body: f }); signIn(d); go(homeFor(d.user.role)); }
    catch (x) { setErr(x.message); }
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>Create your account</h1>
      <p className="muted">Report waste in your street and follow the cleanup.</p>
      <label>Full name<input required value={f.name} onChange={set("name")} /></label>
      <label>Email<input type="email" required value={f.email} onChange={set("email")} /></label>
      <label>Phone<input type="tel" value={f.phone} onChange={set("phone")} /></label>
      <label>Password (6+ characters)<input type="password" minLength={6} required value={f.password} onChange={set("password")} /></label>
      {err && <p className="error">{err}</p>}
      <button className="primary">Sign up</button>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
