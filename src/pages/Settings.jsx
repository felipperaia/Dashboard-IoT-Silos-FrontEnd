import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("current_user");
    if (raw) setProfile(JSON.parse(raw));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      // TODO: chamar API para atualizar perfil
      localStorage.setItem("current_user", JSON.stringify(profile));
      alert("Perfil salvo localmente.");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar");
    } finally { setSaving(false); }
  };

  if (!profile) return <div className="panel">Carregando...</div>;

  return (
    <div className="panel">
      <h2>Configurações do Usuário</h2>
      <div style={{ display: "flex", gap: 12, flexDirection: "column", maxWidth: 560 }}>
        <label>Nome
          <input name="name" value={profile.name || profile.username || ""} onChange={handleChange} />
        </label>
        <label>Email
          <input name="email" value={profile.email || ""} onChange={handleChange} />
        </label>
        <label>Telefone
          <input name="phone" value={profile.phone || ""} onChange={handleChange} />
        </label>
        <div>
          <button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}
