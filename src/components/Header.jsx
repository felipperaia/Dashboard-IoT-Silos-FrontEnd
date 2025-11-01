import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { Settings, Bell, User, Home, MessageSquare } from "lucide-react"; // Added MessageSquare
import axios from "axios";

// 👉 Configuração base da API
const API_BASE = "https://dashboard-iot-silos-backend-1.onrender.com";
const getAuthToken = () => localStorage.getItem("access_token");

const getHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
  "Content-Type": "application/json",
});

export const Header = ({ pushEnabled, unsubscribeAndLogout }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Usuário");
  const [userRole, setUserRole] = useState("Operador");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await axios.get(`${API_BASE}/api/users/`, {
          headers: getHeaders(),
        });

        const users = response.data;

        const currentUserId = getUserIdFromToken(token);
        const currentUser = users.find(user => user.id === currentUserId);

        if (currentUser) {
          setUserName(currentUser.name || currentUser.username || "Usuário");
          setUserRole(currentUser.role || "Operador");
        } else {
          console.warn("Usuário atual não encontrado na lista de usuários.");
        }

      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };

    // Lê usuário diretamente do localStorage para performance e consistência entre abas
    const loadFromStorage = () => {
      try {
        const raw = localStorage.getItem("current_user");
        if (raw) {
          const u = JSON.parse(raw);
          setUserName(u.name || u.username || "Usuário");
          setUserRole(u.role || "Operador");
          return;
        }
      } catch (e) {
        console.warn("Erro ao ler current_user do storage:", e);
      }

      // fallback: tentar decodificar token e buscar /api/auth/me
      (async () => {
        const token = getAuthToken();
        if (!token) return;
        try {
          const resp = await axios.get(`${API_BASE}/api/auth/me`, { headers: getHeaders() });
          if (resp && resp.data) {
            const u = resp.data;
            localStorage.setItem("current_user", JSON.stringify(u));
            setUserName(u.name || u.username || "Usuário");
            setUserRole(u.role || "Operador");
          }
        } catch (err) {
          console.warn("Não foi possível buscar usuário /auth/me:", err);
        }
      })();
    };

    loadFromStorage();

    // Atualiza quando outra aba altera current_user
    const onStorage = (ev) => {
      if (ev.key === "current_user") loadFromStorage();
    };
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ⚙️ Decodifica JWT para pegar o ID
  const getUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.user_id || payload.id || null;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        width: "93.5%",
        padding: "16px 0",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#ffffff" }}>
        Deméter - Monitoring Dashboard
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Voltar ao Dashboard */}
        <button onClick={() => navigate("/dashboard")} style={buttonStyle}>
          <Home size={18} />
          <span style={{ fontSize: "14px" }}>Dashboard</span>
        </button>

        {/* Assistente Deméter (Chat) */}
        <button onClick={() => navigate("/chat")} style={buttonStyle}>
          <MessageSquare size={18} />
          <span style={{ fontSize: "14px" }}>Assistente Deméter</span>
        </button>

        {/* Configurações */}
        <button onClick={() => navigate("/settings")} style={buttonStyle}>
          <Settings size={18} />
          <span style={{ fontSize: "14px" }}>Configurações</span>
        </button>

        {/* Notificações */}
        <button onClick={() => navigate("/notifications")} style={{ ...buttonStyle, position: "relative" }}>
          <Bell size={18} />
          <span style={{ fontSize: "14px" }}>Notificações</span>
          {pushEnabled && (
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
          )}
        </button>

        {/* Usuário */}
        <button onClick={() => navigate("/profile")} style={{ ...buttonStyle, gap: "8px" }}>
          <User size={18} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#ffffff" }}>{userName}</span>
            <span style={{ fontSize: "12px", color: "#e5e7eb" }}>{userRole}</span>
          </div>
        </button>
      </div>
    </header>
  );
};

// Estilo base dos botões
const buttonStyle = {
  background: "rgba(107, 114, 128, 0.1)",
  border: "1px solid rgba(107, 114, 128, 0.2)",
  borderRadius: "8px",
  padding: "8px 12px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  cursor: "pointer",
  transition: "all 0.2s",
  color: "#ffffff",
};
