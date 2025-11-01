import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

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
        // Atualiza o perfil no backend
    await api.put(`/users/me`, {
          name: profile.name,
          email: profile.email,
          phone: profile.phone
        });
      
        // Atualiza localmente após sucesso no backend
      localStorage.setItem("current_user", JSON.stringify(profile));
        alert("Perfil atualizado com sucesso!");
    } catch (e) {
      console.error(e);
        alert("Erro ao salvar: " + (e.response?.data?.detail || e.message));
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
          <button onClick={() => navigate('/mfa')} style={{ marginLeft: 12 }}>Configurar MFA</button>
        </div>
      </div>
    </div>
  );
}
