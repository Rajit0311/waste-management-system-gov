import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { CATEGORY } from "../ui.jsx";

export default function Report() {
  const go = useNavigate();
  const [f, setF] = useState({ category: "garbage_pile", description: "", landmark: "" });
  const [photo, setPhoto] = useState(null);
  const [loc, setLoc] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) return setErr("This browser can't share location.");
    navigator.geolocation.getCurrentPosition(
      (p) => { setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); setErr(""); },
      () => setErr("Couldn't get your location. Allow location access in your browser and try again."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!photo) return setErr("Add a photo of the waste.");
    if (!loc) return setErr("Share your location so the crew can find it.");
    const fd = new FormData();
    Object.entries({ ...f, ...loc }).forEach(([k, v]) => fd.append(k, v));
    fd.append("photo", photo);
    setBusy(true);
    try { await api("/complaints", { method: "POST", body: fd }); go("/my"); }
    catch (x) { setErr(x.message); setBusy(false); }
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>Report waste</h1>
      <label>What's the problem?
        <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          {Object.entries(CATEGORY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label>Describe it
        <textarea rows={3} required maxLength={1000} placeholder="Garbage has been piling up for 3 days next to the market gate…" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      </label>
      <label>Photo
        <input type="file" accept="image/*" capture="environment" onChange={(e) => setPhoto(e.target.files[0])} />
      </label>
      {photo && <img className="preview" src={URL.createObjectURL(photo)} alt="Selected waste" />}
      <div className="row">
        <button type="button" onClick={getLocation}>{loc ? "Update location" : "Share my location"}</button>
        {loc && <span className="ok">Location captured ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})</span>}
      </div>
      <label>Nearby landmark (optional)
        <input value={f.landmark} onChange={(e) => setF({ ...f, landmark: e.target.value })} placeholder="Opposite City Hospital" />
      </label>
      {err && <p className="error">{err}</p>}
      <button className="primary" disabled={busy}>{busy ? "Sending…" : "Send report"}</button>
    </form>
  );
}
