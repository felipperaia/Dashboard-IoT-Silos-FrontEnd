/*
 api.js
 Cliente HTTP simples para consumir o backend.
 Usa variável de ambiente VITE_API_URL (ex: http://localhost:8000/api).
*/
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function request(path, options = {}) {
  const headers = options.headers || {};
  const token = localStorage.getItem("access_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  headers["Content-Type"] = headers["Content-Type"] || "application/json";
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json().catch(()=>null);
}

export const api = {
  login: (username, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  getSilos: () => request("/silos"),
  getAlerts: () => request("/alerts"),
  sendSubscription: (sub) => request("/notifications/subscribe", { method: "POST", body: JSON.stringify(sub) }).catch(()=>null),
  unsubscribe: (endpoint) => request("/notifications/unsubscribe", { method: "POST", body: JSON.stringify({ endpoint }) }).catch(()=>null),
  adminListSubscriptions: () => request("/notifications/admin/subscriptions")
};
