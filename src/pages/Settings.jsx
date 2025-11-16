import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
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
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/users/me`, {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });

      localStorage.setItem("current_user", JSON.stringify(profile));
      alert("Perfil atualizado com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar: " + (e.response?.data?.detail || e.message));
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <Panel>Carregando...</Panel>;

  return (
    <Panel>
      <Title>Configurações do Usuário</Title>

      <Form>
        <Label>
          Nome
          <Input
            name="name"
            value={profile.name || profile.username || ""}
            onChange={handleChange}
          />
        </Label>

        <Label>
          Email
          <Input
            name="email"
            value={profile.email || ""}
            onChange={handleChange}
          />
        </Label>

        <Label>
          Telefone
          <Input
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
          />
        </Label>

        <ButtonsRow>
          <PrimaryButton onClick={save} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </PrimaryButton>

          <SecondaryButton onClick={() => navigate("/mfa")}>
            Configurar MFA
          </SecondaryButton>
        </ButtonsRow>
      </Form>
    </Panel>
  );
}

/* ----------------------------- STYLED COMPONENTS ----------------------------- */

const Panel = styled.div`
  background: rgb(255, 255, 255);
  border: 1px solid rgba(129, 110, 255, 0.25);
  border-radius: 12px;
  padding: 24px;
  max-width: 650px;
  margin: 20px auto;
  color: #000000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const Title = styled.h2`
  margin: 0 0 16px 0;
  font-size: 22px;
  font-weight: 700;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  opacity: 0.9;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Input = styled.input`
  padding: 10px;
  background: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #858282;
  font-size: 15px;

  &:focus {
    outline: none;
    border-color: #a78bfa;
    background: rgba(255, 255, 255, 0.12);
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 10px;
`;

const PrimaryButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #16a34a;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 15px;
  cursor: pointer;
  transition: 0.25s;

  &:hover {
    background: #9f67ff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #4f46e5;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 15px;
  cursor: pointer;
  transition: 0.25s;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
`;
