import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import api  from "./services/api";

/*
 App.jsx
 Layout mínimo: botão logout atualizado para dessinscrever Push e remover SW.
 Adicionado indicador visual de Push (On / Off) baseado em subscription.
*/

export default function App() {
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    // determina se há subscription ativa (tenta SW primeiro, depois localStorage)
    (async () => {
      try {
        if ("serviceWorker" in navigator && "PushManager" in window) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            const sub = await reg.pushManager.getSubscription();
            if (sub && sub.endpoint) {
              setPushEnabled(true);
              return;
            }
          }
        }
        // fallback: localStorage (previamente gravamos endpoint)
        const endpoint = localStorage.getItem("sw_subscription_endpoint");
        setPushEnabled(!!endpoint);
      } catch (e) {
        console.warn("Erro verificando push subscription:", e);
        setPushEnabled(false);
      }
    })();
  }, []);

  const unsubscribeAndLogout = async () => {
    try {
      // tenta obter registrations e dessubscrever push (se existir)
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          try {
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
              // informar backend para remover
              await api.unsubscribe(sub.endpoint);
              // tentar cancelar a subscription no browser
              try { await sub.unsubscribe(); } catch(e){ /* ignore */ }
            }
            // opcional: unregister do service worker
            try { await reg.unregister(); } catch(e){ /* ignore */ }
          } catch (e) {
            console.warn("Erro ao processar registration:", e);
          }
        }
      } else {
        // fallback: se gravamos o endpoint localmente, envia pedido ao backend
        const endpoint = localStorage.getItem("sw_subscription_endpoint");
        if (endpoint) {
          await api.unsubscribe(endpoint);
        }
      }
    } catch (err) {
      console.warn("Erro no processo de unsubscribe:", err);
    } finally {
      // limpeza local
      localStorage.removeItem("access_token");
      localStorage.removeItem("sw_subscription_endpoint");
      setPushEnabled(false);
      navigate("/login");
    }
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 16, background: "#f3f4f6", minHeight: "100vh" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Silo Monitor</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Indicador de Push */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 10, height: 10, borderRadius: 6,
              background: pushEnabled ? "#10b981" : "#ef4444",
              display: "inline-block" 
            }} />
            <small style={{ color: "#374151" }}>{pushEnabled ? "Push: Ativo" : "Push: Inativo"}</small>
          </div>

          <div>
            <button onClick={() => navigate("/dashboard")} style={{ marginRight: 8 }}>Dashboard</button>
            <button onClick={() => navigate("/login")} style={{ marginRight: 8 }}>Login</button>
            <button onClick={unsubscribeAndLogout}>Logout</button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
