import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // ✅ CORREÇÃO: Importação sem chaves

/*
 Login.jsx
 Página de login simples. Salva access_token no localStorage.
*/

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await api.login(username, password);
      if (data && data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        navigate("/dashboard");
      } else {
        setError("Resposta inesperada do servidor");
      }
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#fff", padding: 24, borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <label>Usuário</label>
          <input value={username} onChange={(e)=>setUsername(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Senha</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ width: "100%" }} />
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
