import React, { useState, useEffect } from "react";

// --- CONFIGURATION ---
const CHANNEL_ID = "3197859";
const READ_API_KEY = "P9HPUKKZEZHVM75O";
const WRITE_API_KEY = "CK5P00B2PTQES8B0";

function App() {
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState({
    temp: "--",
    humidity: "--",
    signal: "--",
    lastUpdate: "Waiting for data...",
  });
  const [loading, setLoading] = useState(true);
  const [sendingCmd, setSendingCmd] = useState(false);
  const [activeLed, setActiveLed] = useState(0); // 0 = Off

  // --- 1. FETCH DATA (MONITORING) ---
  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json?api_key=${READ_API_KEY}`
      );
      const result = await response.json();

      setData({
        temp: result.field1 ? parseFloat(result.field1).toFixed(1) : "--",
        humidity: result.field2 ? parseFloat(result.field2).toFixed(1) : "--",
        signal: result.field3 ? result.field3 : "--",
        lastUpdate: new Date().toLocaleTimeString(),
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  // Run on startup and every 15 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. SEND COMMANDS (CONTROL) ---
  const sendCommand = async (val) => {
    setSendingCmd(true);
    try {
      // Send command to Field 4
      await fetch(
        `https://api.thingspeak.com/update?api_key=${WRITE_API_KEY}&field4=${val}`
      );
      setActiveLed(val);
      alert(`Command sent! Wait 15 seconds for the LED to switch.`);
    } catch (err) {
      alert("Error sending command. Check internet.");
    }
    setSendingCmd(false);
  };

  // --- STYLES (CSS-IN-JS) ---
  const styles = {
    container: {
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      color: "#333",
    },
    glassCard: {
      background: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: "24px",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      padding: "40px",
      width: "90%",
      maxWidth: "400px",
      textAlign: "center",
    },
    header: {
      marginBottom: "30px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "800",
      margin: "0",
      color: "#2d3436",
      letterSpacing: "-0.5px",
    },
    subtitle: {
      fontSize: "14px",
      color: "#636e72",
      marginTop: "5px",
    },
    grid: {
      display: "grid",
      gap: "15px",
      marginBottom: "30px",
    },
    metricCard: {
      background: "white",
      borderRadius: "16px",
      padding: "15px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      transition: "transform 0.2s",
    },
    metricLabel: {
      fontSize: "14px",
      color: "#b2bec3",
      fontWeight: "600",
      textTransform: "uppercase",
    },
    metricValue: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#2d3436",
    },
    controlSection: {
      borderTop: "1px solid rgba(0,0,0,0.1)",
      paddingTop: "25px",
    },
    controlTitle: {
      fontSize: "14px",
      fontWeight: "700",
      color: "#636e72",
      marginBottom: "15px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    buttonGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
    },
    button: (color, isActive) => ({
      padding: "12px",
      border: "none",
      borderRadius: "12px",
      background: isActive ? color : "#e0e0e0",
      color: isActive ? "white" : "#636e72",
      fontWeight: "bold",
      cursor: sendingCmd ? "not-allowed" : "pointer",
      opacity: sendingCmd ? 0.7 : 1,
      transition: "all 0.3s ease",
      boxShadow: isActive ? `0 4px 12px ${color}66` : "none",
    }),
    footer: {
      marginTop: "20px",
      fontSize: "12px",
      color: "#636e72",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>IoT Dashboard</h1>
          <p style={styles.subtitle}>Smart Environment Monitor</p>
        </div>

        {/* MONITORING SECTION */}
        <div style={styles.grid}>
          {/* Temperature */}
          <div style={styles.metricCard}>
            <div>
              <div style={styles.metricLabel}>Temperature</div>
              <div style={styles.metricValue}>{data.temp}°C</div>
            </div>
            <div style={{ fontSize: "24px" }}>🌡️</div>
          </div>

          {/* Humidity */}
          <div style={styles.metricCard}>
            <div>
              <div style={styles.metricLabel}>Humidity</div>
              <div style={styles.metricValue}>{data.humidity}%</div>
            </div>
            <div style={{ fontSize: "24px" }}>💧</div>
          </div>

          {/* Network Signal (The 3rd Sensor) */}
          <div style={styles.metricCard}>
            <div>
              <div style={styles.metricLabel}>Signal Strength</div>
              <div style={styles.metricValue}>{data.signal} dBm</div>
            </div>
            <div style={{ fontSize: "24px" }}>📶</div>
          </div>
        </div>

        {/* CONTROL SECTION */}
        <div style={styles.controlSection}>
          <div style={styles.controlTitle}>Remote Control</div>

          <div style={styles.buttonGrid}>
            <button
              onClick={() => sendCommand(1)}
              style={styles.button("#ff7675", activeLed === 1)}
              disabled={sendingCmd}
            >
              🔴 RED ON
            </button>

            <button
              onClick={() => sendCommand(2)}
              style={styles.button("#fdcb6e", activeLed === 2)}
              disabled={sendingCmd}
            >
              🟡 YEL ON
            </button>

            <button
              onClick={() => sendCommand(3)}
              style={styles.button("#00b894", activeLed === 3)}
              disabled={sendingCmd}
            >
              🟢 GRN ON
            </button>

            <button
              onClick={() => sendCommand(0)}
              style={styles.button("#2d3436", activeLed === 0)}
              disabled={sendingCmd}
            >
              ⚫ ALL OFF
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          {sendingCmd ? "Sending command..." : `Last Sync: ${data.lastUpdate}`}
        </div>
      </div>
    </div>
  );
}

export default App;
