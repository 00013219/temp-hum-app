import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CHANNEL_ID = "3197859";
const READ_API_KEY = "P9HPUKKZEZHVM75O";
const WRITE_API_KEY = "CK5P00B2PTQES8B0";

function App() {
  const [currentData, setCurrentData] = useState({
    temp: "--",
    humidity: "--",
    signal: "--",
    lastUpdate: "Waiting...",
  });
  const [historyData, setHistoryData] = useState([]);
  const [sendingCmd, setSendingCmd] = useState(false);
  const [activeLed, setActiveLed] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_API_KEY}&results=20`
      );
      const data = await response.json();
      const feeds = data.feeds;

      if (feeds.length > 0) {
        const formattedHistory = feeds.map((feed) => ({
          time: new Date(feed.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          temp: parseFloat(feed.field1),
          humidity: parseFloat(feed.field2),
        }));
        setHistoryData(formattedHistory);

        const lastEntry = feeds[feeds.length - 1];
        setCurrentData({
          temp: lastEntry.field1
            ? parseFloat(lastEntry.field1).toFixed(1)
            : "--",
          humidity: lastEntry.field2
            ? parseFloat(lastEntry.field2).toFixed(1)
            : "--",
          signal: lastEntry.field3 ? lastEntry.field3 : "--",
          lastUpdate: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const sendCommand = async (val) => {
    setSendingCmd(true);
    try {
      // ADDED: The second argument { cache: "no-store" }
      await fetch(
        `https://api.thingspeak.com/update?api_key=${WRITE_API_KEY}&field4=${val}`,
        { cache: "no-store" }
      );
      setActiveLed(val);
    } catch (err) {
      console.error("Command failed:", err);
    }
    setSendingCmd(false);
  };

  const getGradientColors = (temp) => {
    const temperature = parseFloat(temp);

    if (isNaN(temperature)) {
      return {
        color1: "#667eea",
        color2: "#764ba2",
        color3: "#5B86E5",
        color4: "#36D1DC",
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

  const gradientColors = getGradientColors(currentData.temp);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(-45deg, ${gradientColors.color1}, ${gradientColors.color2}, ${gradientColors.color3}, ${gradientColors.color4})`,
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "20px",
        boxSizing: "border-box",
        transition: "background 1s ease",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .glass-card {
          animation: slideIn 0.6s ease-out;
        }

        .metric-card {
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .led-button {
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .led-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .led-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .led-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .led-button:hover::before {
          left: 100%;
        }

        .status-indicator {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div
        className="glass-card"
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "32px",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
          padding: "40px",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.3)",
              padding: "6px 16px",
              borderRadius: "24px",
              marginBottom: "12px",
            }}
          >
            <div
              className="status-indicator"
              style={{
                width: "8px",
                height: "8px",
                background: loading ? "#fbbf24" : "#4ade80",
                borderRadius: "50%",
                marginRight: "8px",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "white",
                letterSpacing: "0.5px",
              }}
            >
              {loading ? "Connecting..." : "Live Monitor"}
            </span>
          </div>
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: "32px",
              fontWeight: "800",
              color: "white",
              textShadow: "0 2px 8px rgba(0,0,0,0.1)",
              letterSpacing: "-0.5px",
            }}
          >
            IoT Dashboard
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: "500",
            }}
          >
            Real-time Environment Monitoring
          </p>
        </div>

        {/* Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              label: "Temperature",
              value: currentData.temp,
              unit: "°C",
              icon: "🌡️",
            },
            {
              label: "Humidity",
              value: currentData.humidity,
              unit: "%",
              icon: "💧",
            },
            {
              label: "Signal",
              value: currentData.signal,
              unit: "dBm",
              icon: "📡",
            },
          ].map((metric, idx) => (
            <div
              key={idx}
              className="metric-card"
              style={{
                background: "rgba(255, 255, 255, 0.85)",
                borderRadius: "16px",
                padding: "16px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>
                {metric.icon}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#1f2937",
                }}
              >
                {loading ? "..." : metric.value}
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#6b7280",
                    marginLeft: "2px",
                  }}
                >
                  {metric.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Container */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "24px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#1f2937",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Temperature Trend
              </h3>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Last 20 readings
              </p>
            </div>
          </div>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={historyData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#d1d5db"
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#d1d5db"
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#f87171"
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={800}
                  fill="url(#tempGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LED Control Section */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px 0",
              fontSize: "14px",
              fontWeight: "700",
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              textAlign: "center",
            }}
          >
            LED Controls
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {[
              {
                val: 1,
                label: "Red LED",
                color: "#ef4444",
                activeColor: "#dc2626",
              },
              {
                val: 2,
                label: "Yellow LED",
                color: "#fbbf24",
                activeColor: "#f59e0b",
              },
              {
                val: 3,
                label: "Green LED",
                color: "#10b981",
                activeColor: "#059669",
              },
              {
                val: 0,
                label: "All Off",
                color: "#6b7280",
                activeColor: "#4b5563",
              },
            ].map((led) => (
              <button
                key={led.val}
                className="led-button"
                onClick={() => sendCommand(led.val)}
                disabled={sendingCmd}
                style={{
                  padding: "16px",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: sendingCmd ? "not-allowed" : "pointer",
                  background:
                    activeLed === led.val
                      ? led.activeColor
                      : "rgba(255, 255, 255, 0.9)",
                  color: activeLed === led.val ? "white" : "#1f2937",
                  boxShadow:
                    activeLed === led.val
                      ? `0 4px 12px ${led.color}40`
                      : "0 2px 4px rgba(0, 0, 0, 0.05)",
                  opacity: sendingCmd ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: activeLed === led.val ? "white" : led.color,
                      boxShadow:
                        activeLed === led.val ? `0 0 8px ${led.color}` : "none",
                    }}
                  />
                  {led.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "12px 0 0 0",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.8)",
              fontWeight: "500",
            }}
          >
            {sendingCmd ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ animation: "spin 1s linear infinite" }}>⟳</span>
                Sending command...
              </span>
            ) : (
              `Last updated: ${currentData.lastUpdate}`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
