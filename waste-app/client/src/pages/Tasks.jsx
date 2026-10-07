import { useEffect, useState } from "react";
import { api } from "../api";
import { Chip, CATEGORY, mapLink, when } from "../ui.jsx";

export default function Tasks() {
  const [list, setList] = useState(null);
  const [note, setNote] = useState({});
  const load = () => api("/complaints/assigned").then(setList);
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    await api(`/complaints/${id}/status`, { method: "PATCH", body: { status, note: note[id] } });
    load();
  };

  if (!list) return <p className="muted pad">Loading…</p>;
  return (
    <section className="wrap">
      <h1>My tasks</h1>
      {!list.length && <p className="card">No tasks assigned right now.</p>}
      <div className="grid">
        {list.map((c) => (
          <article className="card item" key={c._id}>
            <img src={c.photo} alt="" />
            <div>
              <div className="between"><strong>{CATEGORY[c.category]}</strong><Chip status={c.status} /></div>
              <p>{c.description}</p>
              <p className="muted">{c.location.landmark && c.location.landmark + " · "}<a href={mapLink(c.location)} target="_blank" rel="noreferrer">Open in Maps</a> · Reported {when(c.createdAt)}</p>
              {c.citizen?.phone && <p className="muted">Caller: {c.citizen.name}, {c.citizen.phone}</p>}
              {c.status !== "resolved" && (
                <>
                  <input placeholder="Add a note (optional)" value={note[c._id] || ""} onChange={(e) => setNote({ ...note, [c._id]: e.target.value })} />
                  <div className="row">
                    {c.status === "assigned" && <button onClick={() => update(c._id, "in_progress")}>Start work</button>}
                    <button className="primary" onClick={() => update(c._id, "resolved")}>Mark cleaned</button>
                  </div>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
