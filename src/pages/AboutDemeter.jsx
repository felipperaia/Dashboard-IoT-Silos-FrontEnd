// src/pages/AboutDemeter.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function AboutDemeter() {
  const navigate = useNavigate();

  // Estilo baseado no botão de login
  const backButtonStyle = {
    padding: "10px 14px",
    fontSize: "14px",
    width: "50%",
    maxWidth: "160px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
    color: "#ffffff",
    backgroundColor: "#22aa38",
    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
    transition: "background-color 0.2s ease, transform 0.1s ease",
  };

  // Estilo de “card” parecido com o container do login
  const cardStyle = {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: "24px 32px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "60px 16px 40px 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* Botão Retornar */}
        <div style={{ marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={backButtonStyle}
          >
            Retornar
          </button>
        </div>

        {/* Logo + título + subtítulo */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          <img
            src={logo}
            alt="Deméter"
            style={{
              height: 180,
              maxWidth: "100%",
              objectFit: "contain",
              display: "block",
              margin: "0 auto 16px auto",
            }}
          />
          <h1
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: "#ffffff",
              textShadow: "0 2px 4px rgba(0,0,0,0.6)",
              margin: 0,
            }}
          >
            Sobre Deméter
          </h1>
          <p
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "#f9fafb",
              textShadow: "0 1px 3px rgba(0,0,0,0.7)",
            }}
          >
            Monitoramento inteligente de silos e condições de armazenagem.
          </p>
        </div>

        {/* CARD 1 – Sobre nós */}
        <section style={cardStyle}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#111827",
              margin: "0 0 12px 0",
            }}
          >
            Sobre nós
          </h2>

          {/* Visão geral */}
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#374151",
              margin: 0,
            }}
          >
            <strong>Visão geral:</strong> Deméter é uma solução prática para
            monitoramento e gestão de silos de grãos. O sistema reúne leituras
            dos sensores instalados nos silos (temperatura, umidade, qualidade
            do ar, luminosidade), organiza essas informações em painéis claros e
            gera previsões e recomendações para manter o grão em condições
            ideais de armazenagem.
          </p>

          {/* O que entregamos */}
          <div
            style={{
              marginTop: 16,
              fontSize: 14,
              color: "#374151",
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: "0 0 4px 0" }}>
              <strong>O que entregamos:</strong>
            </p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>
                <strong>Monitoramento em tempo real:</strong> acompanhe as
                leituras atuais dos silos e receba alertas quando algo foge dos
                parâmetros definidos.
              </li>
              <li>
                <strong>Histórico e relatórios:</strong> visualize tendências e
                gere relatórios em PDF prontos para uso em inspeções, auditorias
                ou compartilhamento com a equipe.
              </li>
              <li>
                <strong>Previsões e recomendações:</strong> utilize previsões
                (horas ou dias à frente) com orientações práticas de
                ventilação, checagem e secagem para reduzir riscos de
                deterioração.
              </li>
              <li>
                <strong>Meteorologia integrada:</strong> combine dados locais de
                clima com as leituras dos silos para diagnósticos mais
                completos.
              </li>
              <li>
                <strong>Acessos controlados:</strong> permita que usuários
                autorizados acessem dados e relatórios por meio de login seguro.
              </li>
            </ul>
          </div>

          {/* Para quem é útil */}
          <div
            style={{
              marginTop: 16,
              fontSize: 14,
              color: "#374151",
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: "0 0 4px 0" }}>
              <strong>Para quem é útil:</strong>
            </p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>
                Operadores de armazéns e silos e equipes de operação diária.
              </li>
              <li>
                Técnicos agrícolas e consultores responsáveis pela qualidade do
                grão.
              </li>
              <li>
                Gestores de armazenagem e decisão, que precisam de visão global
                e dados confiáveis para planejar ações.
              </li>
            </ul>
          </div>

          {/* Como usar (rápido) */}
          <div
            style={{
              marginTop: 16,
              fontSize: 14,
              color: "#374151",
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: "0 0 4px 0" }}>
              <strong>Como usar (rápido):</strong>
            </p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>Faça login no sistema.</li>
              <li>Selecione o silo que deseja monitorar.</li>
              <li>Veja o painel com as leituras atuais e o histórico.</li>
              <li>
                Acesse o card <strong>“Análise de Previsões e Métricas”</strong>{" "}
                para visualizar previsões e recomendações práticas.
              </li>
              <li>
                Gere relatórios em PDF para inspeções, reuniões ou registro
                interno.
              </li>
            </ul>
          </div>

          {/* Benefícios principais */}
          <div
            style={{
              marginTop: 16,
              fontSize: 14,
              color: "#374151",
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: "0 0 4px 0" }}>
              <strong>Benefícios principais:</strong>
            </p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>
                Reduz o risco de perdas por calor, mofo ou infestação ao
                antecipar problemas.
              </li>
              <li>
                Ajuda a tomar decisões práticas e rápidas (quando ventilar,
                quando secar, quando inspecionar).
              </li>
              <li>
                Centraliza dados e relatórios em um único ambiente, facilitando
                auditorias, rastreabilidade e acompanhamento histórico.
              </li>
            </ul>
          </div>

          {/* Compromisso */}
          <p
            style={{
              marginTop: 16,
              fontSize: 14,
              lineHeight: 1.6,
              color: "#374151",
            }}
          >
            <strong>Compromisso:</strong> nosso objetivo é fornecer informações
            confiáveis e acionáveis — não substituir o julgamento técnico, mas
            oferecer suporte claro e prático para que decisões de manejo do
            grão sejam tomadas com mais segurança e antecedência.
          </p>
        </section>

        {/* Espaço entre os cards */}
        <div style={{ height: 20 }} />

        {/* CARD 2 – Features & Updates */}
        <section style={cardStyle}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#111827",
              margin: "0 0 12px 0",
            }}
          >
            Features &amp; Updates
          </h2>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#374151",
              margin: 0,
            }}
          >
            Abaixo estão alguns dos principais aprimoramentos planejados para as
            próximas versões da plataforma:
          </p>

          <ul
            style={{
              paddingLeft: 20,
              marginTop: 12,
              fontSize: 14,
              lineHeight: 1.6,
              color: "#374151",
            }}
          >
            <li>
              <strong>Assistente Deméter em todas as telas:</strong> presença
              constante da assistente para tirar dúvidas rápidas e auxiliar na
              navegação, independente do módulo em que você estiver.
            </li>
            <li>
              <strong>Assistente integrada aos dados do sistema:</strong>{" "}
              capacidade de consultar endpoints do backend, trazendo leituras,
              previsões e relatórios mais atualizados diretamente pela conversa.
            </li>
            <li>
              <strong>Padronização e melhoria de layout:</strong> ajustes de
              tipografia, espaçamento e componentes visuais para tornar a
              experiência mais limpa, consistente e agradável em todos os
              dispositivos.
            </li>
            <li>
              <strong>Melhorias de desempenho em leitura e gravação de
              dados:</strong> otimizações na forma como as leituras são
              registradas, processadas e exibidas, garantindo respostas mais
              rápidas mesmo com grande volume de informações.
            </li>
            <li>
              <strong>Controle de acesso por e-mail:</strong> implementação de 
              autenticação e login por e-mail para garantir maior segurança e
              agilizar processos de recuperação de conta, permitindo que usuários
              possam acessar determinadas funcionalidades e dados com o uso do e-mail como identificador.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
