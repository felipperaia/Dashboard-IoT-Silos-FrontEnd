import React, { useEffect, useState } from "react";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [silos, setSilos] = useState([]);
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSilo, setSelectedSilo] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newSilo, setNewSilo] = useState({ name: "", location: "", capacity: "" });
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "" });
  const [newReading, setNewReading] = useState({ silo_id: "", temp_C: "", rh_pct: "" });
const [authToken, setAuthToken] = useState(() => localStorage.getItem("access_token"));

  const API_BASE = "https://dashboard-iot-silos-backend-1.onrender.com";
  const getHeaders = () => ({
    "Authorization": `Bearer ${authToken}`,
    "Content-Type": "application/json"
  });

  const fetchSilos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/silos/`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Erro ao buscar silos");
      const data = await res.json();
      setSilos(data || []);
      if (data.length > 0 && !selectedSilo) setSelectedSilo(data[0]._id);
    } catch (err) {
      setError("Erro ao carregar silos");
    } finally {
      setLoading(false);
    }
  };

  const createSilo = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/silos/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(newSilo)
      });
      if (!res.ok) throw new Error("Erro ao criar silo");
      alert("Silo criado!");
      setNewSilo({ name: "", location: "", capacity: "" });
      fetchSilos();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const updateSiloSettings = async (siloId, settings) => {
    try {
      const res = await fetch(`${API_BASE}/api/silos/${siloId}/settings`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error("Erro ao atualizar");
      alert("Configurações atualizadas!");
      fetchSilos();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const fetchReadings = async (siloId) => {
    try {
      setLoading(true);
      const url = siloId ? `${API_BASE}/api/readings?silo_id=${siloId}&limit=100` : `${API_BASE}/api/readings?limit=100`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error("Erro ao buscar leituras");
      const data = await res.json();
      setReadings(data || []);
    } catch (err) {
      setError("Erro ao carregar leituras");
    } finally {
      setLoading(false);
    }
  };

  const createReading = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/readings/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          ...newReading,
          temp_C: parseFloat(newReading.temp_C),
          rh_pct: parseFloat(newReading.rh_pct)
        })
      });
      if (!res.ok) throw new Error("Erro ao criar leitura");
      alert("Leitura criada!");
      setNewReading({ silo_id: "", temp_C: "", rh_pct: "" });
      fetchReadings(selectedSilo);
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/alerts/`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Erro ao buscar alertas");
      const data = await res.json();
      setAlerts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      const res = await fetch(`${API_BASE}/api/alerts/ack/${alertId}`, {
        method: "POST",
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Erro ao confirmar alerta");
      alert("Alerta confirmado!");
      fetchAlerts();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Erro ao buscar usuários");
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(newUser)
      });
      if (!res.ok) throw new Error("Erro ao criar usuário");
      alert("Usuário criado!");
      setNewUser({ username: "", email: "", password: "" });
      fetchUsers();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const subscribeNotifications = async () => {
    try {
      const vapidRes = await fetch(`${API_BASE}/api/notifications/vapid_public`, { headers: getHeaders() });
      const vapidData = await vapidRes.json();
      alert("VAPID Key obtida: " + vapidData.public_key);
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  useEffect(() => {
    fetchSilos();
    fetchAlerts();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedSilo) fetchReadings(selectedSilo);
  }, [selectedSilo]);

  const readingsBySilo = readings.reduce((acc, r) => {
    if (!r.silo_id) return acc;
    if (!acc[r.silo_id]) acc[r.silo_id] = [];
    acc[r.silo_id].push(r);
    return acc;
  }, {});

  // Calculate averages and trends
  const calculateMetrics = () => {
    if (!readings.length) return { avgTemp: 0, avgHumidity: 0, tempTrend: "stable", humTrend: "stable" };
    
    const recent = readings.slice(-10);
    const older = readings.slice(-20, -10);
    
    const avgTemp = recent.reduce((sum, r) => sum + (r.temp_C / 10), 0) / recent.length;
    
    const avgHumidity = recent.reduce((sum, r) => sum + (r.rh_pct / 10 ), 0) / recent.length;
    
    const oldAvgTemp = older.length ? older.reduce((sum, r) => sum + r.temp_C, 0) / older.length : avgTemp;
    const oldAvgHum = older.length ? older.reduce((sum, r) => sum + r.rh_pct, 0) / older.length : avgHumidity;
    
    const tempTrend = avgTemp > oldAvgTemp ? "up" : avgTemp < oldAvgTemp ? "down" : "stable";
    const humTrend = avgHumidity > oldAvgHum ? "up" : avgHumidity < oldAvgHum ? "down" : "stable";
    
    return { avgTemp: avgTemp.toFixed(1), avgHumidity: avgHumidity.toFixed(1), tempTrend, humTrend };
  };
  

  const metrics = calculateMetrics();

  const prepareChartData = () => {
    if (!selectedSilo || !readingsBySilo[selectedSilo]) return { labels: [], datasets: [] };
    const siloReadings = [...readingsBySilo[selectedSilo]].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).slice(-20);
    return {
      labels: siloReadings.map(r => new Date(r.timestamp).toLocaleTimeString()),
      datasets: [
        { label: "Temperatura (°C)", data: siloReadings.map(r => r.temp_C), borderColor: "rgb(239,68,68)", backgroundColor: "rgba(239,68,68,0.1)", yAxisID: "y", tension: 0.4 },
        { label: "Umidade (%)", data: siloReadings.map(r => r.rh_pct), borderColor: "rgb(59,130,246)", backgroundColor: "rgba(59,130,246,0.1)", yAxisID: "y1", tension: 0.4 }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: { 
      legend: { position: "top", labels: { font: { size: 12 }, padding: 15 } }, 
      title: { display: true, text: "Monitoramento em Tempo Real", font: { size: 16 } } 
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { type: "linear", display: true, position: "left", grid: { color: "rgba(0,0,0,0.05)" } },
      y1: { type: "linear", display: true, position: "right", grid: { drawOnChartArea: false } }
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === "up") return "↗";
    if (trend === "down") return "↘";
    return "→";
  };

  const unreadAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <Container>
      {/* Left Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>
        </div>

        {/* Metric Cards */}
        <div style={s.metricCard}>
          <div style={s.metricHeader}>
            <span style={s.metricLabel}>Temperatura Média</span>
            <span style={s.trendIcon}>{getTrendIcon(metrics.tempTrend)}</span>
          </div>
          <div style={s.metricValue}>
            <span style={s.metricNumber}>{metrics.avgTemp}</span>
            <span style={s.metricUnit}>°C</span>
          </div>
          <div style={s.metricBar}>
            <div style={{...s.metricBarFill, width: `${Math.min(100, (metrics.avgTemp/40)*100)}%`, background: "linear-gradient(90deg, #ef4444, #f97316)"}}></div>
          </div>
        </div>

        <div style={s.metricCard}>
          <div style={s.metricHeader}>
            <span style={s.metricLabel}>Umidade Média</span>
            <span style={s.trendIcon}>{getTrendIcon(metrics.humTrend)}</span>
          </div>
          <div style={s.metricValue}>
            <span style={s.metricNumber}>{metrics.avgHumidity}</span>
            <span style={s.metricUnit}>%</span>
          </div>
          <div style={s.metricBar}>
            <div style={{...s.metricBarFill, width: `${metrics.avgHumidity}%`, background: "linear-gradient(90deg, #3b82f6, #06b6d4)"}}></div>
          </div>
        </div>

        <div style={s.metricCard}>
          <div style={s.metricHeader}>
            <span style={s.metricLabel}>Tendências (24h)</span>
          </div>
          <div style={s.trendsContainer}>
            <div style={s.trendItem}>
              <span style={s.trendLabel}>Temp:</span>
              <span style={{...s.trendValue, color: metrics.tempTrend === "up" ? "#ef4444" : "#10b981"}}>
                {metrics.tempTrend === "up" ? "Subindo" : metrics.tempTrend === "down" ? "Caindo" : "Estável"}
              </span>
            </div>
            <div style={s.trendItem}>
              <span style={s.trendLabel}>Umid:</span>
              <span style={{...s.trendValue, color: metrics.humTrend === "up" ? "#3b82f6" : "#10b981"}}>
                {metrics.humTrend === "up" ? "Subindo" : metrics.humTrend === "down" ? "Caindo" : "Estável"}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{...s.metricCard, background: unreadAlerts.length > 0 ? "linear-gradient(135deg, #fef3c7, #fed7aa)" : "#fff"}}>
          <div style={s.metricHeader}>
            <span style={s.metricLabelNot}>Notificações</span>
            {unreadAlerts.length > 0 && <span style={s.badge}>{unreadAlerts.length}</span>}
          </div>
          <div style={s.notificationList}>
            {unreadAlerts.length === 0 ? (
              <p style={s.noNotifications}>Sem alertas ativos</p>
            ) : (
              unreadAlerts.slice(0, 3).map((alert, i) => (
                <div key={i} style={s.notificationItem}>
                  <span style={s.notificationText}>{alert.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Card */}
        <div style={s.infoCard}>
          <div style={s.infoIcon}></div>
          <p style={s.infoText}>
            Monitorar temperatura e umidade dos silos é crítico para prevenir fermentação, perda de qualidade e risco de autoaquecimento. 
            Ajuste ventilação e períodos de rechecagem sempre que os valores estiverem fora da faixa operacional recomendada.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <MainContent>
        <div style={s.header}>
          <div style={s.headerActions}>
          </div>
        </div>
        
        <Tabs>
          {["dashboard", "silos", "readings", "alerts", "users"].map(tab => (
            <button key={tab} style={activeTab === tab ? s.tabActive : s.tab} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </Tabs>

        {activeTab === "dashboard" && (
          <div>
            {loading ? <div style={s.loading}>Carregando...</div> : error ? <div style={s.error}>{error}</div> : (
              <>
                <div style={s.card}>
                  <div style={s.cardHeader}>
                    <h3 style={s.cardTitle}>Seleção de Silo</h3>
                  </div>
                  <select style={s.select} value={selectedSilo || ""} onChange={(e) => setSelectedSilo(e.target.value)}>
                    <option value="">Todos os Silos</option>
                    {silos.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                
                {selectedSilo && readingsBySilo[selectedSilo] && readingsBySilo[selectedSilo].length > 0 && (
                  <div style={s.card}>
                    <Line data={prepareChartData()} options={chartOptions} />
                  </div>
                )}
                
                <div style={s.statsGrid}>
                  <div style={s.statCard}>
                    <div style={s.statIcon}></div>
                    <h3 style={s.statTitle}>Total de Silos</h3>
                    <p style={s.statNumber}>{silos.length}</p>
                  </div>
                  <div style={{...s.statCard, background: unreadAlerts.length > 0 ? "linear-gradient(135deg, #fef3c7, #fed7aa)" : "linear-gradient(135deg, #f3f4f6, #ffffff)"}}>
                    <div style={s.statIcon}></div>
                    <h3 style={s.statTitle}>Alertas Ativos</h3>
                    <p style={{...s.statNumber, color: unreadAlerts.length > 0 ? "#f59e0b" : "#10b981"}}>{unreadAlerts.length}</p>
                  </div>
                  <div style={s.statCard}>
                    <div style={s.statIcon}></div>
                    <h3 style={s.statTitle}>Leituras Hoje</h3>
                    <p style={s.statNumber}>{readings.length}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "silos" && (
          <div>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h3 style={s.cardTitle}>Criar Novo Silo</h3>
              </div>
              <div style={s.form}>
                <input style={s.input} placeholder="Nome do Silo" value={newSilo.name} onChange={(e) => setNewSilo({...newSilo, name: e.target.value})} />
                <input style={s.input} placeholder="Localização" value={newSilo.location} onChange={(e) => setNewSilo({...newSilo, location: e.target.value})} />
                <input style={s.input} type="number" placeholder="Capacidade (toneladas)" value={newSilo.capacity} onChange={(e) => setNewSilo({...newSilo, capacity: e.target.value})} />
                <button style={s.button} onClick={createSilo}>Criar Silo</button>
              </div>
            </div>
            
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h3 style={s.cardTitle}>Lista de Silos</h3>
              </div>
              <div style={s.list}>
                {silos.map(silo => (
                  <div key={silo._id} style={s.listItem}>
                    <div>
                      <strong style={s.listTitle}>{silo.name}</strong>
                      <p style={s.listSubtext}>
                        {typeof silo.location === 'object' 
                          ? `Lat: ${silo.location.lat}, Lng: ${silo.location.lng}` 
                          : (silo.location || "N/A")} | Capacidade: {silo.capacity || "N/A"} ton
                      </p>
                    </div>
                    <button style={s.buttonSmall} onClick={() => {
                      const temp = prompt("Temperatura máxima (°C):");
                      const humidity = prompt("Umidade máxima (%):");
                      if (temp && humidity) updateSiloSettings(silo._id, { max_temp: parseFloat(temp), max_humidity: parseFloat(humidity) });
                    }}>Configurar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "readings" && (
          <div>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h3 style={s.cardTitle}>Adicionar Leitura Manual</h3>
              </div>
              <div style={s.form}>
                <select style={s.select} value={newReading.silo_id} onChange={(e) => setNewReading({...newReading, silo_id: e.target.value})}>
                  <option value="">Selecione o Silo</option>
                  {silos.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <input style={s.input} type="number" step="0.1" placeholder="Temperatura (°C)" value={newReading.temp_C} onChange={(e) => setNewReading({...newReading, temp_C: e.target.value})} />
                <input style={s.input} type="number" step="0.1" placeholder="Umidade (%)" value={newReading.rh_pct} onChange={(e) => setNewReading({...newReading, rh_pct: e.target.value})} />
                <button style={s.button} onClick={createReading}>Adicionar Leitura</button>
              </div>
            </div>
            
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h3 style={s.cardTitle}>Últimas Leituras</h3>
              </div>
              <div style={s.table}>
                <div style={s.tableHeader}>
                  <span>Silo</span><span>Temperatura</span><span>Umidade</span><span>Data/Hora</span>
                </div>
                {readings.slice(0, 20).map((reading, idx) => (
                  <div key={idx} style={s.tableRow}>
                    <span style={{color: "#000"}}>{silos.find(sl => sl._id === reading.silo_id)?.name || reading.silo_id}</span>
                    <span style={{color: reading.temp_C > 30 ? "#ef4444" : "#10b981"}}>{reading.temp_C}°C</span>
                    <span style={{color: reading.rh_pct > 70 ? "#3b82f6" : "#10b981"}}>{reading.rh_pct}%</span>
                    <span style={{color: "#000"}}>{new Date(reading.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h3 style={s.cardTitle}>Alertas do Sistema</h3>
              <button style={s.buttonSmall} onClick={fetchAlerts}>Atualizar</button>
            </div>
            <div style={s.list}>
              {alerts.length === 0 ? <p style={s.emptyState}>Nenhum alerta registrado</p> : alerts.map(alert => (
                <div key={alert._id} style={{...s.listItem, background: alert.acknowledged ? "#f9fafb" : "#fef3c7"}}>
                  <div>
                    <strong style={s.listTitle}>{alert.message}</strong>
                    <p style={s.listSubtext}> Silo: {alert.silo_id} |  {new Date(alert.timestamp).toLocaleString('pt-BR')}</p>
                  </div>
                  {!alert.acknowledged && <button style={s.buttonSuccess} onClick={() => acknowledgeAlert(alert._id)}>✓ Confirmar</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h3 style={s.cardTitle}>Criar Novo Usuário</h3>
              </div>
              <div style={s.form}>
                <input style={s.input} placeholder="Nome de Usuário" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} />
                <input style={s.input} type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                <input style={s.input} type="password" placeholder="Senha" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                <button style={s.button} onClick={createUser}>Criar Usuário</button>
              </div>
            </div>
            
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h3 style={s.cardTitle}>Lista de Usuários</h3>
                <button style={s.buttonSmall} onClick={fetchUsers}>Atualizar</button>
              </div>
              <div style={s.list}>
                {users.map(user => (
                  <div key={user._id} style={s.listItem}>
                    <div>
                      <strong style={s.listTitle}>{user.username}</strong>
                      <p style={s.listSubtext}>{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h3 style={s.cardTitle}>Notificações Push</h3>
              </div>
              <p style={s.cardDescription}>Ative as notificações para receber alertas em tempo real sobre condições críticas dos silos.</p>
              <button style={s.button} onClick={subscribeNotifications}>Ativar Notificações</button>
            </div>
          </div>
        )}
      </MainContent>
    </Container>
      
  );
}

const s = {
  container: { 
    display: "flex", 
    minHeight: "100vh", 
    
  },
  sidebar: {
    width: 380,
    background: "transparent",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  logo: {
    marginBottom: 10
  },
  logoText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    margin: 0
  },
  metricCard: {
    background: "#ffffff22",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  metricHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  metricLabel: {
    fontSize: 13,
    color: "#e6e6e6",
    fontWeight: "500"
  },
    metricLabelNot: {
    fontSize: 13,
    color: "#000000",
    fontWeight: "500"
  },
  trendIcon: {
    fontSize: 18,
    color: "#94b896"
  },
  metricValue: {
    display: "flex",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 12
  },
  metricNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#26a84f"
  },
  metricUnit: {
    fontSize: 14,
    color: "#dadada"
  },
  metricBar: {
    height: 6,
    background: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden"
  },
  metricBarFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.3s ease"
  },
  trendsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
  },
  trendItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  trendLabel: {
    fontSize: 12,
    color: "#e2e2e2"
  },
  trendValue: {
    fontSize: 12,
    fontWeight: "600"
  },
  notificationList: {
    marginTop: 10
  },
  noNotifications: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    margin: 0
  },
  notificationItem: {
    padding: 8,
    background: "#fef3c7",
    borderRadius: 6,
    marginBottom: 6
  },
  notificationText: {
    fontSize: 11,
    color: "#92400e"
  },
  badge: {
    background: "#ef4444",
    color: "#fff",
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 10,
    fontWeight: "bold"
  },
  infoCard: {
    background: "#ffffff22",
    borderRadius: 12,
    padding: 16,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  infoText: {
    fontSize: 12,
    color: "#1eaf5f",
    lineHeight: 1.5,
    margin: 0
  },
  mainContent: {
    flex: 1,
    padding: 30,
    overflowY: "auto",
    width: "70vw"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
    margin: 0
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 15
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    color: "#10b981",
    fontSize: 14,
    fontWeight: "500"
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 25,
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: 2,
    justifyContent: "end"

  },
  tab: {
    padding: "12px 24px",
    background: "transparent",
    border: "none",
    color: "#ececec",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "500",
    borderRadius: "8px 8px 0 0",
    transition: "all 0.2s ease"
  },
  tabActive: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #258f3f, #269c4a)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "600",
    borderRadius: "8px 8px 0 0",
    boxShadow: "0 2px 8px rgba(59,130,246,0.3)"
  },
  card: {
    background: "#fffffff0",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
    border: "1px solid #e2e8f0"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    margin: 0
  },
  cardDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 1.5
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    transition: "border-color 0.2s ease",
    outline: "none"
  },
  select: {
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    background: "#fff",
    cursor: "pointer",
    outline: "none"
  },
  button: {
    padding: "12px 24px",
    background: "#238b28",
    color: "#fff",
    border: "none",
    margin: 'auto',
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "600",
    fontSize: 14,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 2px 4px rgba(59,130,246,0.2)"
  },
  buttonSmall: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: "500",
    transition: "transform 0.2s ease"
  },
  buttonSuccess: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #23a378, #059669)",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: "500"
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  listItem: {
    padding: 16,
    background: "#f9fafb",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  },
  listTitle: {
    fontSize: 15,
    color: "#1e293b",
    marginBottom: 4
  },
  listSubtext: {
    fontSize: 12,
    color: "#64748b",
    margin: 0
  },
  table: {
    marginTop: 15
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1.5fr",
    gap: 10,
    padding: "12px 16px",
    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    fontWeight: "600",
    fontSize: 13,
    color: "#475569",
    borderRadius: "8px 8px 0 0",
    borderBottom: "2px solid #e2e8f0"
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1.5fr",
    gap: 10,
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
    transition: "background 0.2s ease"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 20
  },
  statCard: {
    background: "#ffffff22",
    padding: 24,
    borderRadius: 16,
    textAlign: "center",
    border: "1px solid #e5e7eb",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 12
  },
  statTitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "500"
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#479447",
    margin: 0
  },
  loading: {
    padding: 40,
    textAlign: "center",
    color: "#64748b",
    fontSize: 16
  },
  error: {
    padding: 20,
    color: "#ef4444",
    textAlign: "center",
    background: "#fee2e2",
    borderRadius: 8,
    border: "1px solid #fecaca"
  },
  emptyState: {
    textAlign: "center",
    color: "#94a3b8",
    padding: 40,
    fontSize: 14
  }
}

import styled from "styled-components";

const Container = styled.div`
  display: flex;
  min-height: 100vh;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MainContent = styled.div` 
    flex: 1;
    padding: 30;
    overflow-Y: "auto";
    width: 70vw;
    
     @media (max-width: 768px) {
    flex: 1;
    margin: auto;
    overflow-Y: "auto";
    width: 80vw;
    
  }
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 25px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 2px;
  justify-content: end;

  @media (max-width: 768px) {
    display: flex;
    gap: 3px;
    margin-bottom: 25px;
    border-bottom: 2px solid rgb(226, 232, 240);
    padding-bottom: 2px;
    justify-content: center;

    button {
      padding: 8px 12px!important;
    }
  }
`;