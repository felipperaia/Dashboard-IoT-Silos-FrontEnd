// src/pages/MFA.jsx
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import qrcodeLib from "qrcode";

const API_URL = "https://dashboard-iot-silos-backend-1.onrender.com/api";

// Página de configuração de MFA para o usuário logado
export default function MFA() {
  const [setupData, setSetupData] = useState(null); // { secret, otpauth_url ... }
  const [code, setCode] = useState("");
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [qrError, setQrError] = useState(false);
  const canvasRef = useRef(null);

  // Desenha o QR SEM distorcer quando receber os dados de setup
  useEffect(() => {
    if (!setupData) return;

    const uri =
      setupData.otpauth_url || setupData.uri || setupData.qr || null;
    if (!uri || !canvasRef.current) return;

    qrcodeLib
      .toCanvas(canvasRef.current, uri, {
        errorCorrectionLevel: "M",
        scale: 6,
        margin: 1,
      })
      .then(() => setQrError(false))
      .catch((err) => {
        console.warn("Falha ao renderizar QR:", err);
        setQrError(true);
      });
  }, [setupData]);

  const startSetup = async () => {
    setLoadingSetup(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Você precisa estar logado para configurar o MFA.");
        return;
      }

      const res = await fetch(`${API_URL}/mfa/setup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Falha ao iniciar configuração de MFA");
      const data = await res.json();

      // guarda secret/otpauth_url e dispara o useEffect que gera o QR
      setSetupData(data);
      setQrError(false);
    } catch (e) {
      console.error(e);
      alert("Erro ao iniciar configuração do MFA.");
    } finally {
      setLoadingSetup(false);
    }
  };

  const verify = async () => {
    if (!code.trim()) {
      alert("Informe o código de 6 dígitos do app autenticador.");
      return;
    }

    setLoadingVerify(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Você precisa estar logado para validar o MFA.");
        return;
      }

      const res = await fetch(`${API_URL}/mfa/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: code.trim() }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Código MFA inválido");
      }

      alert("MFA habilitado com sucesso!");

      // Atualiza current_user no localStorage para refletir que MFA está ativo
      try {
        const meResp = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meResp.ok) {
          const me = await meResp.json();
          localStorage.setItem("current_user", JSON.stringify(me));
        }
      } catch (e) {
        console.warn("Erro ao atualizar current_user após MFA:", e);
      }
    } catch (e) {
      console.error(e);
      alert(e.message || "Falha ao validar MFA");
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Autenticação Multifator (MFA)</Title>
        <Description>
          Ative a autenticação multifator usando um aplicativo como{" "}
          <strong>Microsoft Authenticator</strong> ou{" "}
          <strong>Google Authenticator</strong>.
        </Description>

        <Button onClick={startSetup} disabled={loadingSetup}>
          {loadingSetup
            ? "Gerando..."
            : setupData
            ? "Gerar nova chave secreta"
            : "Gerar Chave Secreta"}
        </Button>

        {setupData && (
          <SetupBox>
            <p>
              <strong>Secret:</strong>{" "}
              <Code>{setupData.secret || "—"}</Code>
            </p>

            <div style={{ marginTop: 12 }}>
              {/* QR quadrado, sem esticar via CSS */}
              <canvas
                ref={canvasRef}
                width={260}
                height={260}
                style={{ borderRadius: 8 }}
              />
            </div>
            {qrError && (
              <p style={{ marginTop: 12, fontSize: 13 }}>
                Não foi possível gerar o QR automaticamente. Adicione
                manualmente usando a chave acima ou a URL abaixo:
                <br />
                <Code>
                  {setupData.otpauth_url ||
                    setupData.uri ||
                    setupData.qr ||
                    "—"}
                </Code>
              </p>
            )}
          </SetupBox>
        )}

        <Label htmlFor="mfa-code">Código do app:</Label>
        <Input
          id="mfa-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Digite o código de 6 dígitos"
          maxLength={6}
        />

        <Button onClick={verify} disabled={loadingVerify}>
          {loadingVerify ? "Validando..." : "Verificar Código"}
        </Button>
      </Card>
    </Container>
  );
}

/* ---------- Styled Components ---------- */

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 40px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  color: #111;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
`;

const Description = styled.p`
  font-size: 14px;
  opacity: 0.85;
  margin-bottom: 20px;
  text-align: center;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background: #479447;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 15px;
  cursor: pointer;
  transition: 0.25s;

  &:hover {
    background: #3b7a3b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SetupBox = styled.div`
  text-align: center;
  margin: 16px 0;
`;

const Code = styled.code`
  background: #f3f4f6;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 13px;
`;

const Label = styled.label`
  margin-top: 12px;
  display: block;
  font-size: 14px;
  opacity: 0.85;
`;

const Input = styled.input`
  width: 100%;
  margin-top: 6px;
  padding: 10px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
  color: #111;

  &:focus {
    outline: none;
    border-color: #7c3aed;
  }
`;
