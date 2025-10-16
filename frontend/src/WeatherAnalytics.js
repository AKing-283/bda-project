import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PolarAngleAxis, PolarGrid, Radar, RadarChart
} from "recharts";
import { saveAs } from "file-saver";

function WeatherAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [city, setCity] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = async (c = city, s = start, e = end) => {
    setLoading(true);
    setError("");
    setAnalytics(null);

    try {
      const params = new URLSearchParams();
      if (c) params.append("city", c);
      if (s) params.append("start", s);
      if (e) params.append("end", e);

      const res = await fetch(`http://127.0.0.1:5000/api/analytics?${params.toString()}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend error:\n${text}`);
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setAnalytics(null);
      } else {
        setAnalytics(data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics("", "", "");
  }, []);

  const exportCSV = () => {
    if (!analytics) return;
    let csv = "Metric,Value\n";
    csv += `Average Temperature,${analytics.average_temperature ?? "N/A"}\n`;
    csv += `Max Temperature,${analytics.max_temperature ?? "N/A"}\n`;
    csv += `Min Temperature,${analytics.min_temperature ?? "N/A"}\n`;
    csv += `Average Wind Speed,${analytics.average_wind_speed ?? "N/A"}\n`;
    csv += `Max Wind Speed,${analytics.max_wind_speed ?? "N/A"}\n`;
    csv += `Average Wind Gust,${analytics.average_wind_gust ?? "N/A"}\n`;
    csv += `Max Wind Gust,${analytics.max_wind_gust ?? "N/A"}\n`;
    csv += `Average Wind Direction,${analytics.average_wind_direction ?? "N/A"}°\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `weather_analytics_${city || "all"}.csv`);
  };

  const toChartData = (trend) =>
    trend ? Object.entries(trend).map(([month, value]) => ({ month: `Month ${month}`, value })) : [];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>🌦️ Weather Analytics Dashboard</h2>

      {/* Filters */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button
          onClick={() => fetchAnalytics(city, start, end)}
          style={{ padding: "5px 10px", marginRight: "5px" }}
        >
          {loading ? "Loading..." : "View Analytics"}
        </button>
        <button
          onClick={exportCSV}
          disabled={!analytics}
          style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "white", border: "none" }}
        >
          Export CSV
        </button>
      </div>

      {error && (
        <div style={{ color: "red", textAlign: "center", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      {!error && analytics && (
        <>
          {/* Summary Cards */}
          <div style={{
            display: "flex", justifyContent: "space-around",
            flexWrap: "wrap", marginBottom: "30px"
          }}>
            <div className="card"><h4>Avg Temp</h4><p>{analytics.average_temperature} °C</p></div>
            <div className="card"><h4>Max Temp</h4><p>{analytics.max_temperature} °C</p></div>
            <div className="card"><h4>Avg Wind Speed</h4><p>{analytics.average_wind_speed} km/h</p></div>
            <div className="card"><h4>Max Wind Speed</h4><p>{analytics.max_wind_speed} km/h</p></div>
            <div className="card"><h4>Avg Wind Gust</h4><p>{analytics.average_wind_gust} km/h</p></div>
            <div className="card"><h4>Max Wind Gust</h4><p>{analytics.max_wind_gust} km/h</p></div>
            <div className="card"><h4>Avg Wind Direction</h4><p>{analytics.average_wind_direction}°</p></div>
          </div>

          {/* 🌡️ Temperature Chart */}
          {analytics.monthly_temperature_trend && Object.keys(analytics.monthly_temperature_trend).length > 0 && (
            <div style={{ width: "100%", height: 400 }}>
              <h3>📈 Monthly Avg Temperature</h3>
              <ResponsiveContainer>
                <LineChart data={toChartData(analytics.monthly_temperature_trend)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#FF7300" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 💨 Wind Speed Trend */}
          {analytics.monthly_wind_speed_trend && (
            <div style={{ width: "100%", height: 400, marginTop: "40px" }}>
              <h3>💨 Monthly Avg Wind Speed</h3>
              <ResponsiveContainer>
                <LineChart data={toChartData(analytics.monthly_wind_speed_trend)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#1E90FF" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 🌬️ Wind Gust Trend */}
          {analytics.monthly_wind_gust_trend && (
            <div style={{ width: "100%", height: 400, marginTop: "40px" }}>
              <h3>🌬️ Monthly Avg Wind Gust</h3>
              <ResponsiveContainer>
                <BarChart data={toChartData(analytics.monthly_wind_gust_trend)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#FF4500" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 🧭 Wind Direction Trend */}
          {analytics.monthly_wind_direction_trend && (
            <div style={{ width: "100%", height: 400, marginTop: "40px" }}>
              <h3>🧭 Monthly Avg Wind Direction (°)</h3>
              <ResponsiveContainer>
                <RadarChart data={toChartData(analytics.monthly_wind_direction_trend)}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="month" />
                  <Radar
                    name="Wind Direction"
                    dataKey="value"
                    stroke="#008080"
                    fill="#20B2AA"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WeatherAnalytics;
