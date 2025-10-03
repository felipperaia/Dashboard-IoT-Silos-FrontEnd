// Dashboard.jsx - VERSÃO CORRIGIDA
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // ✅ CORREÇÃO: caminho relativo correto
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [silos, setSilos] = useState([]);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSilo, setSelectedSilo] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Buscando dados iniciais...");
      
      // Buscar silos primeiro
      const silosData = await api.getSilos();
      console.log("📦 Silos recebidos:", silosData);
      setSilos(silosData || []);
      
      // Se há silos, selecionar o primeiro
      if (silosData && silosData.length > 0) {
        const firstSiloId = silosData[0]._id;
        setSelectedSilo(firstSiloId);
        console.log("🎯 Silo selecionado:", firstSiloId);
        
        // Buscar leituras apenas para o silo selecionado
        const readingsData = await api.getReadings(firstSiloId, 100);
        console.log("📊 Leituras recebidas:", readingsData?.length || 0);
        setReadings(readingsData || []);
      } else {
        // Se não há silos, buscar todas as leituras
        const readingsData = await api.getReadings(null, 100);
        console.log("📊 Leituras recebidas (todos silos):", readingsData?.length || 0);
        setReadings(readingsData || []);
      }
      
    } catch (err) {
      console.error("❌ Erro ao carregar dados:", err);
      if (err.message.includes("Sessão expirada") || err.message.includes("Não autorizado")) {
        setError("Sessão expirada. Redirecionando para login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Erro ao carregar dados: " + (err.message || "Verifique a conexão com o servidor."));
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREÇÃO: useEffect único para carregar dados iniciais
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [navigate]);

  // ✅ CORREÇÃO: Buscar dados quando silo selecionado mudar
  useEffect(() => {
    if (selectedSilo) {
      fetchReadingsForSilo();
    }
  }, [selectedSilo]);

  const fetchReadingsForSilo = async () => {
    try {
      const readingsData = await api.getReadings(selectedSilo, 100);
      setReadings(readingsData || []);
    } catch (err) {
      console.error("Erro ao buscar leituras:", err);
      setError("Erro ao carregar leituras do silo selecionado.");
    }
  };

  // Agrupar leituras por silo_id
  const readingsBySilo = readings.reduce((acc, reading) => {
    if (reading && reading.silo_id) {
      if (!acc[reading.silo_id]) {
        acc[reading.silo_id] = [];
      }
      acc[reading.silo_id].push(reading);
    }
    return acc;
  }, {});

  // ✅ CORREÇÃO: Função para lidar com teclado nos cards
  const handleCardKeyDown = (event, siloId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedSilo(siloId);
    }
  };

  // ✅ CORREÇÃO: Função para lidar com mouse hover
  const handleCardHover = (event, isHovering) => {
    event.currentTarget.style.transform = isHovering ? "translateY(-2px)" : "translateY(0)";
  };

  // Preparar dados para o gráfico
  const prepareChartData = () => {
    if (!selectedSilo || !readingsBySilo[selectedSilo] || readingsBySilo[selectedSilo].length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const siloReadings = readingsBySilo[selectedSilo];
    
    // Ordenar por timestamp (mais recente primeiro)
    const sortedReadings = [...siloReadings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Limitar a 20 pontos para não sobrecarregar o gráfico
    const limitedReadings = sortedReadings.slice(-20);
    
    return {
      labels: limitedReadings.map(r => new Date(r.timestamp).toLocaleTimeString()),
      datasets: [
        {
          label: "Temperatura (°C)",
          data: limitedReadings.map(r => r.temp_C),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.1,
          yAxisID: 'y'
        },
        {
          label: "Umidade (%)",
          data: limitedReadings.map(r => r.rh_pct),
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          tension: 0.1,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Temperatura e Umidade - Últimas Leituras'
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Horário'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperatura (°C)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Umidade (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div>Carregando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'red' }}>
        <div>{error}</div>
        {!error.includes("Redirecionando") && (
          <button onClick={fetchData} style={{ marginTop: 10, padding: '8px 16px' }}>
            Tentar Novamente
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard de Monitoramento</h2>
      
      <div style={{ marginBottom: 20 }}>
        <button onClick={fetchData} style={{ marginRight: 10, padding: '8px 16px' }}>
          🔄 Atualizar Dados
        </button>
        <button onClick={() => console.log("Debug - Silos:", silos, "Readings:", readings)} style={{ padding: '8px 16px' }}>
          🐛 Debug no Console
        </button>
      </div>
      
      {silos.length === 0 ? (
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, textAlign: 'center' }}>
          <h3>Nenhum silo cadastrado</h3>
          <p>Adicione silos através do painel administrativo.</p>
        </div>
      ) : (
        <>
          {/* Seletor de Silo */}
          <div style={{ marginBottom: 20, background: '#fff', padding: 16, borderRadius: 8 }}>
            <label htmlFor="silo-select" style={{ marginRight: 10, fontWeight: 'bold' }}>
              Selecionar Silo: 
            </label>
            <select 
              id="silo-select"
              value={selectedSilo || ""} 
              onChange={(e) => setSelectedSilo(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 4, 
                minWidth: 200,
                border: '1px solid #ddd'
              }}
            >
              <option value="">Todos os Silos</option>
              {silos.map(silo => (
                <option key={silo._id} value={silo._id}>
                  {silo.name} ({silo.device_id})
                </option>
              ))}
            </select>
          </div>
          
          {/* Cards com informações dos silos */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
            gap: 16, 
            marginBottom: 20 
          }}>
            {silos.map(silo => {
              const siloReadings = readingsBySilo[silo._id] || [];
              const lastReading = siloReadings.length > 0 
                ? siloReadings[siloReadings.length - 1] 
                : null;
              
              return (
                // ✅ CORREÇÃO: Elemento button nativo com atributos de acessibilidade
                <button
                  key={silo._id}
                  type="button"
                  style={{ 
                    background: "#fff", 
                    padding: 20, 
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: selectedSilo === silo._id ? "3px solid #3b82f6" : "1px solid #e5e7eb",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                    outline: "none",
                    font: "inherit",
                    color: "inherit"
                  }}
                  onClick={() => setSelectedSilo(silo._id)}
                  onKeyDown={(e) => handleCardKeyDown(e, silo._id)}
                  onMouseEnter={(e) => handleCardHover(e, true)}
                  onMouseLeave={(e) => handleCardHover(e, false)}
                  aria-pressed={selectedSilo === silo._id}
                  aria-label={`Selecionar silo ${silo.name}. ${lastReading ? `Última leitura: ${lastReading.temp_C}°C temperatura, ${lastReading.rh_pct}% umidade` : 'Nenhuma leitura disponível'}`}
                >
                  <h3 style={{ margin: "0 0 10px 0", color: "#1f2937" }}>
                    {silo.name}
                    {selectedSilo === silo._id && " ✅"}
                  </h3>
                  <div style={{ color: "#6b7280", fontSize: '0.9em', marginBottom: 8 }}>
                    Device ID: <strong>{silo.device_id}</strong>
                  </div>
                  
                  {lastReading ? (
                    <>
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                        <strong style={{ color: "#374151" }}>Última leitura:</strong>
                        <div style={{ fontSize: '0.9em', color: '#6b7280' }}>
                          {new Date(lastReading.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div style={{ background: '#fef2f2', padding: 8, borderRadius: 4 }}>
                          <div style={{ fontSize: '0.8em', color: '#dc2626' }}>🌡️ Temperatura</div>
                          <div style={{ fontWeight: 'bold' }}>{lastReading.temp_C}°C</div>
                        </div>
                        <div style={{ background: '#eff6ff', padding: 8, borderRadius: 4 }}>
                          <div style={{ fontSize: '0.8em', color: '#2563eb' }}>💧 Umidade</div>
                          <div style={{ fontWeight: 'bold' }}>{lastReading.rh_pct}%</div>
                        </div>
                        <div style={{ background: '#f0fdf4', padding: 8, borderRadius: 4 }}>
                          <div style={{ fontSize: '0.8em', color: '#16a34a' }}>🌫️ CO₂</div>
                          <div style={{ fontWeight: 'bold' }}>{lastReading.co2_ppm_est || 0} ppm</div>
                        </div>
                        <div style={{ background: '#fafafa', padding: 8, borderRadius: 4 }}>
                          <div style={{ fontSize: '0.8em', color: '#6b7280' }}>📊 Leituras</div>
                          <div style={{ fontWeight: 'bold' }}>{siloReadings.length}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ 
                      marginTop: 12, 
                      padding: 20, 
                      textAlign: 'center', 
                      background: '#f9fafb', 
                      borderRadius: 4,
                      color: '#6b7280'
                    }}>
                      ⚠️ Nenhuma leitura disponível
                    </div>
                  )}
                  
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6', fontSize: '0.8em', color: '#9ca3af' }}>
                    <div>🔥 Temp. limite: {silo.settings?.temp_threshold || "Não config."}°C</div>
                    <div>🌫️ CO₂ limite: {silo.settings?.co2_threshold || "Não config."} ppm</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Gráfico para o silo selecionado */}
          {selectedSilo && readingsBySilo[selectedSilo] && readingsBySilo[selectedSilo].length > 0 && (
            <div style={{ marginTop: 30, background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <h3 style={{ margin: "0 0 20px 0" }}>
                📊 Gráfico de Leitura - {silos.find(s => s._id === selectedSilo)?.name}
              </h3>
              <div style={{ height: 400 }}>
                <Line data={prepareChartData()} options={chartOptions} />
              </div>
            </div>
          )}
          
          {selectedSilo && (!readingsBySilo[selectedSilo] || readingsBySilo[selectedSilo].length === 0) && (
            <div style={{ background: "#fff", padding: 40, borderRadius: 8, textAlign: 'center' }}>
              <h3>📈 Nenhuma leitura disponível</h3>
              <p>O silo selecionado não possui leituras registradas.</p>
              <button onClick={fetchData} style={{ marginTop: 10, padding: '8px 16px' }}>
                Buscar Leituras
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}