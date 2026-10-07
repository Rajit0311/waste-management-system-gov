import { useEffect, useState } from "react";
import { api } from "../api";
import { Chip, CATEGORY, LABEL, mapLink, when } from "../ui.jsx";

export default function Admin() {
  const [stats, setStats] = useState({});
  const [list, setList] = useState([]);
  const [staff, setStaff] = useState([]);
  const [tab, setTab] = useState("pending");
  const [pick, setPick] = useState({});
  const [emp, setEmp] = useState({ name: "", email: "", phone: "", password: "" });
  const [msg, setMsg] = useState("");

  const load = () => {
    api("/complaints/stats").then(setStats);
    api("/complaints" + (tab === "all" ? "" : "?status=" + tab)).then(setList);
    api("/employees").then(setStaff);
  };
  useEffect(load, [tab]);

  const assign = async (id) => {
    if (!pick[id]) return setMsg("Choose an employee first.");
    await api(`/complaints/${id}/assign`, { method: "PATCH", body: { employeeId: pick[id] } });
    setMsg(""); load();
  };
  const setStatus = async (id, status) => { await api(`/complaints/${id}/status`, { method: "PATCH", body: { status } }); load(); };
  const addEmployee = async (e) => {
    e.preventDefault();
    try { await api("/employees", { method: "POST", body: emp }); setEmp({ name: "", email: "", phone: "", password: "" }); setMsg(""); load(); }
    catch (x) { setMsg(x.message); }
  };

  return (
    <section className="wrap">
      <h1>Complaints dashboard</h1>
      <div className="stats">
        {["pending", "assigned", "in_progress", "resolved"].map((s) => (
          <div key={s} className={"card stat " + s}><b>{stats[s] ?? 0}</b><span>{LABEL[s]}</span></div>
        ))}
        <div className="card stat"><b>{stats.total ?? 0}</b><span>All reports</span></div>
      </div>
      {msg && <p className="error">{msg}</p>}

      <div className="split">
        <div>
          <div className="tabs">
            {["pending", "assigned", "in_progress", "resolved", "rejected", "all"].map((t) => (
              <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t === "all" ? "All" : LABEL[t]}</button>
            ))}
          </div>
          {!list.length && <p className="card">Nothing here.</p>}
          {list.map((c) => (
            <article className="card item" key={c._id}>
              <img src={c.photo} alt="" />
              <div>
                <div className="between"><strong>{CATEGORY[c.category]}</strong><Chip status={c.status} /></div>
                <p>{c.description}</p>
                <p className="muted">{c.citizen?.name} {c.citizen?.phone && "· " + c.citizen.phone} · {when(c.createdAt)}</p>
                <p className="muted">{c.location.landmark && c.location.landmark + " · "}<a href={mapLink(c.location)} target="_blank" rel="noreferrer">View location on map</a></p>
                {c.assignedTo && <p className="muted">Assigned to {c.assignedTo.name}{c.note && " · " + c.note}</p>}
                {c.status !== "resolved" && c.status !== "rejected" && (
                  <div className="row">
                    <select value={pick[c._id] || ""} onChange={(e) => setPick({ ...pick, [c._id]: e.target.value })}>
                      <option value="">{c.assignedTo ? "Reassign to…" : "Assign to…"}</option>
                      {staff.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.openTasks} open)</option>)}
                    </select>
                    <button className="primary" onClick={() => assign(c._id)}>Assign</button>
                    {c.status === "pending" && <button onClick={() => setStatus(c._id, "rejected")}>Reject</button>}
                    {c.status === "assigned" && <button onClick={() => setStatus(c._id, "in_progress")}>Mark in progress</button>}
                    {(c.status === "assigned" || c.status === "in_progress") && <button className="primary" onClick={() => setStatus(c._id, "resolved")}>Mark cleaned</button>}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <aside>
          <form className="card" onSubmit={addEmployee}>
            <h2>Add employee</h2>
            {["name", "email", "phone", "password"].map((k) => (
              <label key={k}>{k[0].toUpperCase() + k.slice(1)}
                <input required={k !== "phone"} type={k === "password" ? "password" : k === "email" ? "email" : "text"} value={emp[k]} onChange={(e) => setEmp({ ...emp, [k]: e.target.value })} />
              </label>
            ))}
            <button className="primary">Add employee</button>
          </form>
          <div className="card">
            <h2>Field team ({staff.length})</h2>
            {!staff.length && <p className="muted">Add your first employee to start assigning work.</p>}
            {staff.map((s) => <div className="between" key={s._id}><span>{s.name}</span><span className="muted">{s.openTasks} open</span></div>)}
          </div>
        </aside>
      </div>
    </section>
  );
}
