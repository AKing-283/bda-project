// frontend/src/Dashboard.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Weather Dashboard</h1>
      <p>Live data preview (static for now). Use the Analytics page for dataset analytics.</p>

      <button onClick={() => navigate("/analytics")}>View Analytics</button>

      <div style={{ marginTop: 20 }}>
        <h3>Sample Data (latest)</h3>
        <p>Dataset updated: 2 months ago — analytics are based on stored data.</p>
      </div>
    </div>
  );
}
