import React from "react";

export default function Profile() {
  const raw = localStorage.getItem("current_user");
  const user = raw ? JSON.parse(raw) : null;

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("current_user");
    window.location.href = "/login";
  };

  if (!user) return <div className="panel">Nenhum usuário ativo</div>;

  return (
    <div className="panel">
      <h2>Perfil</h2>
      <p><strong>Nome:</strong> {user.name || user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <div style={{ marginTop: 12 }}>
        <button onClick={logout}>Sair</button>
      </div>
    </div>
  );
}
