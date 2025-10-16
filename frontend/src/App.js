import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./Dashboard";
import WeatherAnalytics from "./WeatherAnalytics";

function App() {
  return (
    <Router>
      <nav style={{ background: "#333", padding: "10px" }}>
        <Link to="/" style={{ color: "white", marginRight: "15px" }}>Dashboard</Link>
        <Link to="/analytics" style={{ color: "white" }}>Analytics</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<WeatherAnalytics />} />
      </Routes>
    </Router>
  );
}

export default App;
