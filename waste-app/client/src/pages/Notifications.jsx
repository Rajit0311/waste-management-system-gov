import { useEffect, useState } from "react";
import { api } from "../api";
import { when } from "../ui.jsx";

export default function Notifications() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    // Load first so unread ones are still highlighted, then mark all as read
    api("/notifications").then((d) => { setItems(d.items); if (d.unread) api("/notifications/read", { method: "PATCH" }); });
  }, []);

  if (!items) return <p className="muted pad">Loading…</p>;
  return (
    <section className="wrap" style={{ maxWidth: 640 }}>
      <h1>Notifications</h1>
      {!items.length && <p className="card">No notifications yet. You'll see updates here when a report is assigned, started, or cleaned.</p>}
      {items.map((n) => (
        <div key={n._id} className={"card note" + (n.read ? "" : " unread")}>
          <div>{n.message}</div>
          <div className="muted">{when(n.createdAt)}</div>
        </div>
      ))}
    </section>
  );
}
