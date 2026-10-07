import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Chip, CATEGORY, when } from "../ui.jsx";

export default function MyReports() {
  const [list, setList] = useState(null);
  useEffect(() => { api("/complaints/mine").then(setList); }, []);
  if (!list) return <p className="muted pad">Loading…</p>;
  return (
    <section className="wrap">
      <h1>My reports</h1>
      {!list.length && <p className="card">You haven't reported anything yet. <Link to="/report">Report waste</Link></p>}
      <div className="grid">
        {list.map((c) => (
          <article className="card item" key={c._id}>
            <img src={c.photo} alt="" />
            <div>
              <div className="between"><strong>{CATEGORY[c.category]}</strong><Chip status={c.status} /></div>
              <p>{c.description}</p>
              <p className="muted">Sent {when(c.createdAt)}{c.assignedTo && <> · Crew: {c.assignedTo.name}</>}</p>
              {c.note && <p className="muted">Update: {c.note}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
