import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import api from "../services/api";

// ==========================
// Styled Components
// ==========================

const ChatWrapper = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 80vh;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 15px;
  text-align: center;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f8fafc;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 15px;
  line-height: 1.4;
  white-space: pre-wrap;

  ${(props) =>
    props.role === "assistant"
      ? `
      align-self: flex-start;
      background: #e2e8f0;
      color: #1e293b;
    `
      : `
      align-self: flex-end;
      background: #4f46e5;
      color: white;
    `}
`;

const ChatForm = styled.form`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 15px;
  outline: none;

  &:focus {
    border-color: #4f46e5;
  }
`;

const Button = styled.button`
  padding: 12px 18px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #4338ca;
  }

  &:disabled {
    background: #a5b4fc;
    cursor: not-allowed;
  }
`;

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Olá! Sou a Deméter, sua assistente virtual. Como posso ajudar você hoje?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/chat", [
        { role: "user", content: userMessage.content },
      ]);

      const botMessage = {
        role: "assistant",
        content: response.reply || "(sem resposta)",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatWrapper>
      <Title>Assistente Deméter</Title>

      <MessagesContainer>
        {messages.map((msg, idx) => (
          <Message key={idx} role={msg.role}>
            {msg.content}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <ChatForm onSubmit={handleSubmit}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={loading}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar"}
        </Button>
      </ChatForm>
    </ChatWrapper>
  );
}
