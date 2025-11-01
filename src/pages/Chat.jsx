import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Olá! Sou a Deméter, sua assistente virtual. Como posso ajudar você hoje?" }
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
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // backend espera um array de mensagens: [{ role, content }]
      const response = await api.post("/chat", [{ role: "user", content: input }]);
      const botMessage = { role: "assistant", content: response.reply || "(sem resposta)" };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel chat-container">
      <h2>Assistente Deméter</h2>
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}