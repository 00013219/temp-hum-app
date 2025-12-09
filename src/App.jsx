import { useState, useEffect } from "react";
import "./App.css";

const CHANNEL_ID = "3197859";
const READ_API_KEY = "P9HPUKKZEZHVM75O";

function App() {
  const [data, setData] = useState({
    temp: "--",
    humidity: "--",
    lastUpdate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json?api_key=${READ_API_KEY}`
      );
      const result = await response.json();

      setData({
        temp: parseFloat(result.field1).toFixed(1),
        humidity: parseFloat(result.field2).toFixed(1),
        lastUpdate: new Date(result.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setLoading(false);
      setError(false);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <div className="glass-card">
        <div className="header">
          <div className="status-badge">
            <span className={`status-dot ${error ? "error" : "pulse"}`}></span>
            {error ? "Offline" : "Live Monitor"}
          </div>
          <h1>Environment</h1>
        </div>

        <div className="metrics-grid">
          <div className="metric-item temp">
            <div className="icon-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                <path d="M10 20h4" />
                <path d="M10 4h4" />
              </svg>
            </div>
            <div className="metric-info">
              <span className="label">Temperature</span>
              <div className="value-group">
                <span className="value">{loading ? "..." : data.temp}</span>
                <span className="unit">°C</span>
              </div>
            </div>
          </div>

          <div className="metric-item humid">
            <div className="icon-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
              </svg>
            </div>
            <div className="metric-info">
              <span className="label">Humidity</span>
              <div className="value-group">
                <span className="value">{loading ? "..." : data.humidity}</span>
                <span className="unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer">
          <p>Last updated: {loading ? "Syncing..." : data.lastUpdate}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
