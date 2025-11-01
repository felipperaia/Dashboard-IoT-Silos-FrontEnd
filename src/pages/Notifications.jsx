import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Notifications() {
  const [prefs, setPrefs] = useState({ email: true, sms: false, telegram: false, popup: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // carregar preferências do localStorage para demo
    try {
      const raw = localStorage.getItem("notif_prefs");
      if (raw) setPrefs(JSON.parse(raw));
    } catch (e) { console.warn(e); }
  }, []);

  const toggle = (k) => setPrefs(prev => ({ ...prev, [k]: !prev[k] }));

  const save = async () => {
    setSaving(true);
    try {
      localStorage.setItem("notif_prefs", JSON.stringify(prefs));
      alert("Preferências salvas localmente. Integre com backend /api/notifications se desejado.");
    } catch (e) { console.error(e); alert("Erro"); }
    finally { setSaving(false); }
  };

  return (
    <div className="panel">
      <h2>Notificações</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label><input type="checkbox" checked={prefs.email} onChange={() => toggle("email")} /> Email</label>
        <label><input type="checkbox" checked={prefs.sms} onChange={() => toggle("sms")} /> SMS</label>
        <label><input type="checkbox" checked={prefs.popup} onChange={() => toggle("popup")} /> Pop-up (browser)</label>
        <label><input type="checkbox" checked={prefs.telegram} onChange={() => toggle("telegram")} /> Telegram</label>
        <div>
          <button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}
