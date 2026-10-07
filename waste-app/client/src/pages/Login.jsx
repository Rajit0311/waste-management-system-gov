import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth, homeFor } from "../auth.jsx";

export default function Login({ admin = false }) {
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const { signIn } = useAuth();
  const go = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const d = await api(admin ? "/auth/admin-login" : "/auth/login", { method: "POST", body: f });
      signIn(d); go(homeFor(d.user.role));
    } catch (x) { setErr(x.message); }
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>{admin ? "Admin log in" : "Log in"}</h1>
      <p className="muted">{admin ? "For city office staff only." : "Citizens and field employees log in here."}</p>
      <label>Email<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label>Password<input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
      {err && <p className="error">{err}</p>}
      <button className="primary">Log in</button>
      <p className="muted">
        {admin ? <Link to="/login">Back to citizen log in</Link> : <>New here? <Link to="/signup">Create an account</Link> · <Link to="/admin/login">Admin log in</Link></>}
      </p>
    </form>
  );
}
