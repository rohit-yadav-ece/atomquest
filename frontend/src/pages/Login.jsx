import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  { label: "Active Goals", value: "24", sub: "↑ 4 this week" },
  { label: "Avg Score", value: "87%", sub: "↑ 3% vs Q1" },
  { label: "Completion", value: "75%", sub: "On track" },
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("aq_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(t); window.removeEventListener("resize", onResize); };
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
      const user = await login(finalEmail, finalPass);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "manager") navigate("/manager");
      else navigate("/employee");
    } catch {
      setError("Login failed. Backend may be sleeping — click 'Wake Backend' below.");
    } finally {
      setLoading(false);
      setLoadingRole("");
    }
  };

  const d = dark;
  const pageBg    = d ? "#000000" : "#f4f3ff";
  const leftBg    = d ? "#0a0a0a" : "#1e1b4b";
  const cardBg    = d ? "#111111" : "#ffffff";
  const cardBdr   = d ? "#222222" : "#e8e5ff";
  const textMain  = d ? "#ffffff" : "#1e1b4b";
  const textMuted = d ? "#555555" : "#9ca3af";
  const textLabel = d ? "#888888" : "#4b5563";
  const inputBg   = d ? "#1a1a1a" : "#f9f9ff";
  const inputBdr  = d ? "#2a2a2a" : "#e5e3ff";
  const demoBdr   = d ? "#1e1e1e" : "#e8e5ff";

  return (
    <div style={{ minHeight: "100vh", background: pageBg, display: "flex", flexDirection: isMobile ? "column" : "row", fontFamily: "'Inter',-apple-system,sans-serif", position: "relative" }}>

      {/* Dark/Light toggle */}
      <button onClick={() => setDark(x => !x)}
        style={{ position: "fixed", top: 16, right: 16, background: d ? "#1a1a1a" : "#ede9ff", border: `1px solid ${d ? "#2a2a2a" : "#d4d0ff"}`, borderRadius: 20, padding: "7px 14px", cursor: "pointer", fontSize: 12, color: d ? "#888" : "#6366f1", fontWeight: 500, zIndex: 1000 }}>
        {d ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* LEFT PANEL */}
      <div style={{
        width: isMobile ? "100%" : "50%",
        background: leftBg,
        padding: isMobile ? "32px 24px 28px" : "40px",
        display: "flex", flexDirection: "column", justifyContent: "center",
        position: "relative", overflow: "hidden",
        minHeight: isMobile ? "auto" : "100vh",
      }}>
        {/* Glow effects */}
        <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, right: -100, width: 300, height: 300, background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isMobile ? 20 : 40 }}>
          <img src="https://images.seeklogo.com/logo-png/52/1/atomberg-logo-png_seeklogo-529953.png" alt="Atomberg"
            style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 6 }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}>AtomQuest</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>by Atomberg</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: isMobile ? 20 : 32 }}>
          <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, color: "white", lineHeight: 1.3, marginBottom: 10 }}>
            Set goals.<br />Track progress.<br />
            <span style={{ color: "#6366f1" }}>Achieve more.</span>
          </div>
          {!isMobile && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              A complete goal management portal for teams — from setting KPIs to quarterly check-ins and analytics.
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: isMobile ? 8 : 10, marginBottom: isMobile ? 16 : 24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: isMobile ? "8px 10px" : "10px 12px" }}>
              <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: "white" }}>{s.value}</div>
              <div style={{ fontSize: isMobile ? 9 : 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: isMobile ? 9 : 10, color: "#10b981" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress bars — hide on mobile to save space */}
        {!isMobile && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>Q1 Achievement</div>
            {GOALS.map((g, i) => (
              <div key={g.label} style={{ marginBottom: i < GOALS.length - 1 ? 12 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{g.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: g.color }}>{g.pct}%</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: g.color, width: animated ? `${g.pct}%` : "0%", transition: `width 1.2s ease ${i * 0.15}s` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT PANEL — Login form */}
      <div style={{
        width: isMobile ? "100%" : "50%",
        display: "flex", alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "center",
        padding: isMobile ? "24px 20px 40px" : "40px 32px",
        flex: isMobile ? "1" : undefined,
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>

          {/* Form card */}
          <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${cardBdr}`, padding: isMobile ? "22px 20px" : "28px", marginBottom: 12, boxShadow: d ? "none" : "0 20px 60px rgba(99,102,241,0.1)" }}>
            <div style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: textMain, marginBottom: 4 }}>Welcome back</div>
            <div style={{ fontSize: 13, color: textMuted, marginBottom: 20 }}>Sign in to your account</div>

            {error && (
              <div style={{ background: d ? "#1a0a0a" : "#fef2f2", border: `1px solid ${d ? "#3a1a1a" : "#fecaca"}`, color: d ? "#f87171" : "#dc2626", padding: "9px 12px", borderRadius: 8, fontSize: 12, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span>⚠️ {error}</span>
                {(error.includes("sleeping") || error.includes("failed")) && (
                  <button onClick={wakeBackend} disabled={waking}
                    style={{ background: "#6366f1", color: "white", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 }}>
                    {waking ? "Waking..." : "Wake Backend"}
                  </button>
                )}
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: textLabel, marginBottom: 5 }}>Email</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${inputBdr}`, background: inputBg, color: textMain, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: textLabel, marginBottom: 5 }}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${inputBdr}`, background: inputBg, color: textMain, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <button onClick={() => handleLogin()} disabled={loading}
              style={{ width: "100%", padding: 11, borderRadius: 8, border: "none", background: "#6366f1", color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: loading && !loadingRole ? 0.7 : 1 }}>
              {loading && !loadingRole ? "Signing in..." : "Sign in →"}
            </button>
          </div>

          {/* Demo accounts */}
          <div style={{ background: d ? "#0a0a0a" : "#f8f7ff", borderRadius: 14, border: `1px solid ${demoBdr}`, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: textMuted, marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Demo accounts — click to sign in instantly
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.role} onClick={() => handleLogin(acc.email, acc.password, acc.role)} disabled={loading}
                  style={{ background: d ? "#111111" : "#ffffff", border: `1px solid ${d ? "#1e1e1e" : acc.color + "30"}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "left", opacity: loading && loadingRole !== acc.role ? 0.4 : 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: acc.color, marginBottom: 2 }}>
                    {loadingRole === acc.role ? "Signing in..." : acc.role}
                  </div>
                  <div style={{ fontSize: 11, color: textMuted }}>{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
