import React, { useEffect, useState } from "react";
import { api } from "../services/api";
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

/*
 Dashboard.jsx
 Página principal com lista de silos e um gráfico de exemplo.
 Para produção: substituir chamadas e montar gráficos com dados agregados do backend.
*/
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [silos, setSilos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    (async ()=> {
      try {
        const s = await api.getSilos();
        setSilos(s || []);
      } catch (err) {
        console.error("Erro ao buscar silos", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Exemplo de dados fictícios para gráfico (substituir por fetch real de leituras)
  const sampleLabels = ["-5h","-4h","-3h","-2h","-1h","now"];
  const sampleData = {
    labels: sampleLabels,
    datasets: silos[0] ? [{
      label: silos[0].name || "Silo 1 - temp_C",
      data: sampleLabels.map((_,i)=> 20 + Math.sin(i)*5 + (silos[0]?.settings?.temp_threshold ? 0 : 0)),
      borderColor: "rgb(75,192,192)",
      tension: 0.3,
      fill: true
    }] : []
  };

  return (
    <div>
      <h2>Dashboard</h2>
      {loading && <div>Carregando...</div>}
      {!loading && silos.length === 0 && <div>Nenhum silo cadastrado.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
        {silos.map(s => (
          <div key={s._id} style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
            <h3>{s.name}</h3>
            <div>Device: {s.device_id}</div>
            <div>Temp lim: {s.settings?.temp_threshold ?? "—"}</div>
            <div>CO₂ lim: {s.settings?.co2_threshold ?? "—"}</div>
          </div>
        ))}
      </div>

      <section style={{ marginTop: 20, background: "#fff", padding: 12, borderRadius: 8 }}>
        <h3>Gráfico</h3>
        {sampleData.datasets.length > 0 ? <Line data={sampleData} /> : <pre>{JSON.stringify(silos, null, 2)}</pre>}
      </section>
    </div>
  );
}
