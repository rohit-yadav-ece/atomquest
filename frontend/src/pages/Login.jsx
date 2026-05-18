import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const DEMO_ACCOUNTS = [
  { role: "Employee", email: "emp1@atomquest.com", password: "emp123", desc: "Create goals & check-ins", color: "#6366f1" },
  { role: "Employee 2", email: "emp2@atomquest.com", password: "emp123", desc: "Shared goals account", color: "#8b5cf6" },
  { role: "Manager", email: "manager@atomquest.com", password: "manager123", desc: "Approve & review goals", color: "#0ea5e9" },
  { role: "Admin", email: "admin@atomquest.com", password: "admin123", desc: "Manage cycles & reports", color: "#f59e0b" },
];

const GOALS = [
  { label: "Increase Revenue", pct: 87, color: "#6366f1" },
  { label: "Reduce Complaints", pct: 100, color: "#10b981" },
  { label: "Training Hours", pct: 73, color: "#f59e0b" },
  { label: "Customer Satisfaction", pct: 92, color: "#0ea5e9" },
];

const STATS = [
  { label: "Active Goals", value: "24", sub: "↑ 4 this week", good: true },
  { label: "Avg Score", value: "87%", sub: "↑ 3% vs Q1", good: true },
  { label: "Completion", value: "75%", sub: "On track", good: true },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState("");
  const [dark, setDark] = useState(() => localStorage.getItem("aq_theme") !== "light");
  const [animated, setAnimated] = useState(false);
  const [waking, setWaking] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("aq_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const wakeBackend = async () => {
    setWaking(true);
    setError("Waking up backend... please wait 30 seconds ⏳");
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/`);
      setError("Backend is ready! Try logging in now ✅");
    } catch {
      setError("Backend still waking up, try logging in in 30 seconds");
    } finally {
      setWaking(false);
    }
  };

  const handleLogin = async (overrideEmail, overridePass, role) => {
    const finalEmail = overrideEmail || email;
    const finalPass = overridePass || password;
    if (!finalEmail || !finalPass) return;
    setError("");
    setLoading(true);
    if (role) setLoadingRole(role);
    try {
      const data = await api.post("/api/auth/login", { email: finalEmail, password: finalPass });
      login(data.access_token, data.user);
      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "manager") navigate("/manager");
      else navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Backend may be sleeping — click 'Wake Backend' below.");
    } finally {
      setLoading(false);
      setLoadingRole("");
    }
  };

  const d = dark;
  const pageBg = d ? "#000000" : "#f4f3ff";
  const leftBg = d ? "#0a0a0a" : "#1e1b4b";
  const cardBg = d ? "#111111" : "#ffffff";
  const cardBorder = d ? "#222222" : "#e8e5ff";
  const textMain = d ? "#ffffff" : "#1e1b4b";
  const textMuted = d ? "#555555" : "#9ca3af";
  const textLabel = d ? "#888888" : "#4b5563";
  const inputBg = d ? "#1a1a1a" : "#f9f9ff";
  const inputBorder = d ? "#2a2a2a" : "#e5e3ff";
  const demoBorder = d ? "#1e1e1e" : "#e8e5ff";

  return (
    <div style={{ minHeight: "100vh", background: pageBg, display: "flex", fontFamily: "'Inter',-apple-system,sans-serif", position: "relative" }}>

      {/* Toggle top right */}
      <button onClick={() => setDark(x => !x)}
        style={{ position: "fixed", top: "16px", right: "16px", background: d ? "#1a1a1a" : "#ede9ff", border: `1px solid ${d ? "#2a2a2a" : "#d4d0ff"}`, borderRadius: "20px", padding: "7px 16px", cursor: "pointer", fontSize: "12px", color: d ? "#888" : "#6366f1", fontWeight: "500", zIndex: 1000 }}>
        {d ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* LEFT PANEL — Dashboard Preview */}
      <div style={{ width: "50%", background: leftBg, padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>

        {/* Background glow */}
        <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
          <img src="https://images.seeklogo.com/logo-png/52/1/atomberg-logo-png_seeklogo-529953.png" alt="Atomberg"
            style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "6px" }} />
          <div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "white", letterSpacing: "-0.5px" }}>AtomQuest</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>by Atomberg</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "white", lineHeight: "1.3", marginBottom: "10px" }}>
            Set goals.<br />Track progress.<br />
            <span style={{ color: "#6366f1" }}>Achieve more.</span>
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: "1.6" }}>
            A complete goal management portal for teams — from setting KPIs to quarterly check-ins and analytics.
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          {STATS.map(s => (
            <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 12px" }}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>{s.value}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>{s.label}</div>
              <div style={{ fontSize: "10px", color: "#10b981" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Goal progress bars */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", marginBottom: "14px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Q1 Achievement</div>
          {GOALS.map((g, i) => (
            <div key={g.label} style={{ marginBottom: i < GOALS.length - 1 ? "12px" : "0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{g.label}</span>
                <span style={{ fontSize: "12px", fontWeight: "600", color: g.color }}>{g.pct}%</span>
              </div>
              <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "3px", background: g.color,
                  width: animated ? `${g.pct}%` : "0%",
                  transition: `width 1.2s ease ${i * 0.15}s`
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — Login form */}
      <div style={{ width: "50%", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>

          {/* Form card */}
          <div style={{ background: cardBg, borderRadius: "16px", border: `1px solid ${cardBorder}`, padding: "28px", marginBottom: "12px", boxShadow: d ? "none" : "0 20px 60px rgba(99,102,241,0.1)" }}>
            <div style={{ fontSize: "22px", fontWeight: "700", color: textMain, marginBottom: "4px" }}>Welcome back</div>
            <div style={{ fontSize: "13px", color: textMuted, marginBottom: "22px" }}>Sign in to your account</div>

            {error && (
              <div style={{ background: d ? "#1a0a0a" : "#fef2f2", border: `1px solid ${d ? "#3a1a1a" : "#fecaca"}`, color: d ? "#f87171" : "#dc2626", padding: "9px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <span>⚠️ {error}</span>
                {error.includes("sleeping") || error.includes("failed") ? (
                  <button onClick={wakeBackend} disabled={waking}
                    style={{ background: "#6366f1", color: "white", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap", fontWeight: "500" }}>
                    {waking ? "Waking..." : "Wake Backend"}
                  </button>
                ) : null}
              </div>
            )}

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: textLabel, marginBottom: "5px" }}>Email</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${inputBorder}`, background: inputBg, color: textMain, fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: textLabel, marginBottom: "5px" }}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${inputBorder}`, background: inputBg, color: textMain, fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <button onClick={() => handleLogin()} disabled={loading}
              style={{ width: "100%", padding: "11px", borderRadius: "8px", border: "none", background: "#6366f1", color: "white", fontSize: "15px", fontWeight: "600", cursor: "pointer", opacity: loading && !loadingRole ? 0.7 : 1 }}>
              {loading && !loadingRole ? "Signing in..." : "Sign in →"}
            </button>
          </div>

          {/* Demo accounts */}
          <div style={{ background: d ? "#0a0a0a" : "#f8f7ff", borderRadius: "14px", border: `1px solid ${demoBorder}`, padding: "16px 20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: textMuted, marginBottom: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Demo accounts — click to sign in instantly
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.role} onClick={() => handleLogin(acc.email, acc.password, acc.role)} disabled={loading}
                  style={{ background: d ? "#111111" : "#ffffff", border: `1px solid ${d ? "#1e1e1e" : acc.color + "30"}`, borderRadius: "10px", padding: "10px 12px", cursor: "pointer", textAlign: "left", opacity: loading && loadingRole !== acc.role ? 0.4 : 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: acc.color, marginBottom: "2px" }}>
                    {loadingRole === acc.role ? "Signing in..." : acc.role}
                  </div>
                  <div style={{ fontSize: "11px", color: textMuted }}>{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


