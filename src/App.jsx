import { useState, useEffect } from "react";

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

  const getGradientColors = (temp) => {
    const temperature = parseFloat(temp);

    if (isNaN(temperature)) {
      return {
        color1: "#23a6d5",
        color2: "#23d5ab",
        color3: "#84fab0",
        color4: "#8fd3f4",
      };
    }

    if (temperature < 15) {
      return {
        color1: "#667eea",
        color2: "#764ba2",
        color3: "#5B86E5",
        color4: "#36D1DC",
      };
    } else if (temperature < 20) {
      return {
        color1: "#23a6d5",
        color2: "#23d5ab",
        color3: "#84fab0",
        color4: "#8fd3f4",
      };
    } else if (temperature < 25) {
      return {
        color1: "#f093fb",
        color2: "#f5576c",
        color3: "#fbc2eb",
        color4: "#a6c1ee",
      };
    } else if (temperature < 30) {
      return {
        color1: "#fa709a",
        color2: "#fee140",
        color3: "#f87171",
        color4: "#fbbf24",
      };
    } else if (temperature < 35) {
      return {
        color1: "#ee7752",
        color2: "#e73c7e",
        color3: "#f97316",
        color4: "#fb923c",
      };
    } else {
      return {
        color1: "#dc2626",
        color2: "#b91c1c",
        color3: "#ef4444",
        color4: "#f87171",
      };
    }
  };

  const gradientColors = getGradientColors(data.temp);

  return (
    <div
      className="app-container"
      style={{
        background: `linear-gradient(-45deg, ${gradientColors.color1}, ${gradientColors.color2}, ${gradientColors.color3}, ${gradientColors.color4})`,
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
        transition: "background 1s ease",
      }}
    >
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap");

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: "Inter", sans-serif;
          overflow: hidden;
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes pulse-green {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
          }
        }

        .app-container {
          height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          padding: 3rem;
          border-radius: 24px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .header {
          text-align: center;
        }

        .header h1 {
          margin: 0.5rem 0 0 0;
          font-size: 1.75rem;
          color: white;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.3);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          color: white;
          font-weight: 600;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background-color: #4ade80;
          border-radius: 50%;
          margin-right: 8px;
        }

        .status-dot.pulse {
          box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
          animation: pulse-green 2s infinite;
        }

        .status-dot.error {
          background-color: #ef4444;
        }

        .metrics-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .metric-item {
          background: rgba(255, 255, 255, 0.6);
          padding: 1.25rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s ease;
        }

        .metric-item:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.85);
        }

        .icon-wrapper {
          background: white;
          padding: 10px;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .temp .icon-wrapper {
          color: #f87171;
        }

        .humid .icon-wrapper {
          color: #60a5fa;
        }

        .metric-info {
          display: flex;
          flex-direction: column;
        }

        .label {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value-group {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .value {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          line-height: 1;
        }

        .unit {
          font-size: 1rem;
          color: #6b7280;
          font-weight: 600;
        }

        .footer {
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          padding-top: 1rem;
        }

        .footer p {
          margin: 0;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
        }
      `}</style>

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
