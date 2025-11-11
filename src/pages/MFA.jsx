import React, { useEffect, useState } from "react";

const API_URL = "https://dashboard-iot-silos-backend-1.onrender.com/api";

export default function MFA() {
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/mfa/setup`, { method: "POST", headers: { "Authorization": `Bearer ${token}` } });
      if (!res.ok) throw new Error("Falha no setup");
      const data = await res.json();
      setSetupData(data);
    } catch (e) {
      console.error(e);
      alert("Erro ao iniciar setup MFA");
    } finally { setLoading(false); }
  };

  const verify = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/mfa/verify`, { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ token: code }) });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Falha na verificação");
      }
      alert("MFA habilitado com sucesso");
      // Atualizar usuário localmente
      try {
        const meResp = await fetch(`${API_URL}/auth/me`, { headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` } });
        if (meResp.ok) {
          const me = await meResp.json();
          localStorage.setItem("current_user", JSON.stringify(me));
        }
      } catch (e) {
        console.warn("Falha ao atualizar current_user após MFA:", e);
      }
    } catch (e) {
      console.error(e);
      alert("Código inválido");
    } finally { setLoading(false); }
  };

  return (
    <div className="panel">
      <h2>Autenticação Multifator (MFA)</h2>
      <p>Você pode configurar o MFA usando um aplicativo TOTP (ex: Microsoft Authenticator).</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={startSetup} disabled={loading}>Gerar segredo (Setup)</button>
        {setupData && (
          <div>
            <p>Secret: <code>{setupData.secret}</code></p>
            <img alt="QR code" src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(setupData.otpauth_url)}`} />
          </div>
        )}

        <label>Digite o código do app:
          <input value={code} onChange={e => setCode(e.target.value)} />
        </label>
        <div>
          <button onClick={verify} disabled={loading}>{loading ? "Validando..." : "Verificar"}</button>
        </div>
      </div>
    </div>
  );
}
