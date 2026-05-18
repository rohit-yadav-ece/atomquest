import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const DEMO_ACCOUNTS = [
  { role: "Employee", email: "emp1@atomquest.com", password: "emp123", desc: "Create goals, log check-ins", color: "#6366f1", bg: "#eef2ff", icon: "👤" },
  { role: "Employee 2", email: "emp2@atomquest.com", password: "emp123", desc: "Second employee account", color: "#8b5cf6", bg: "#f5f3ff", icon: "👤" },
  { role: "Manager", email: "manager@atomquest.com", password: "manager123", desc: "Approve goals, conduct check-ins", color: "#0ea5e9", bg: "#f0f9ff", icon: "👔" },
  { role: "Admin", email: "admin@atomquest.com", password: "admin123", desc: "Manage cycles, reports, analytics", color: "#10b981", bg: "#f0fdf4", icon: "⚙️" },
];

const DEMO_ACCOUNTS_DARK = [
  { role: "Employee", email: "emp1@atomquest.com", password: "emp123", desc: "Create goals, log check-ins", color: "#818cf8", bg: "#1e1b4b", icon: "👤" },
  { role: "Employee 2", email: "emp2@atomquest.com", password: "emp123", desc: "Second employee account", color: "#a78bfa", bg: "#2e1065", icon: "👤" },
  { role: "Manager", email: "manager@atomquest.com", password: "manager123", desc: "Approve goals, conduct check-ins", color: "#38bdf8", bg: "#0c4a6e", icon: "👔" },
  { role: "Admin", email: "admin@atomquest.com", password: "admin123", desc: "Manage cycles, reports, analytics", color: "#34d399", bg: "#064e3b", icon: "⚙️" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState("");
  const [dark, setDark] = useState(() => localStorage.getItem("aq_theme") === "dark");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("aq_theme", dark ? "dark" : "light");
  }, [dark]);

  const handleSubmit = async (e, overrideEmail, overridePass, role) => {
    if (e) e.preventDefault();
    const finalEmail = overrideEmail || email;
    const finalPass = overridePass || password;
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
      setError("Invalid email or password");
    } finally {
      setLoading(false);
      setLoadingRole("");
    }
  };

  const accounts = dark ? DEMO_ACCOUNTS_DARK : DEMO_ACCOUNTS;

  const s = {
    page: {
      minHeight: "100vh",
      background: dark ? "#0f0f18" : "#f8f7ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: "20px",
      transition: "background 0.3s",
    },
    card: {
      background: dark ? "#16162a" : "#ffffff",
      borderRadius: "20px",
      border: dark ? "1px solid #2a2a45" : "1px solid #e8e5ff",
      padding: "40px",
      width: "100%",
      maxWidth: "440px",
      boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(99,102,241,0.08)",
    },
    topbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    logoIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "20px",
      fontWeight: "700",
    },
    logoText: {
      fontSize: "20px",
      fontWeight: "700",
      color: dark ? "#fff" : "#1e1b4b",
      letterSpacing: "-0.5px",
    },
    logoSub: {
      fontSize: "11px",
      color: dark ? "#818cf8" : "#6366f1",
      marginTop: "1px",
    },
    toggle: {
      background: dark ? "#2a2a45" : "#f0eeff",
      border: "none",
      borderRadius: "20px",
      padding: "6px 14px",
      cursor: "pointer",
      fontSize: "13px",
      color: dark ? "#a5b4fc" : "#6366f1",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    heading: {
      fontSize: "24px",
      fontWeight: "700",
      color: dark ? "#fff" : "#1e1b4b",
      marginBottom: "4px",
    },
    sub: {
      fontSize: "14px",
      color: dark ? "#8b8ba7" : "#9ca3af",
      marginBottom: "28px",
    },
    label: {
      fontSize: "13px",
      fontWeight: "500",
      color: dark ? "#a5b4fc" : "#374151",
      marginBottom: "6px",
      display: "block",
    },
    input: {
      width: "100%",
      padding: "11px 14px",
      borderRadius: "10px",
      border: dark ? "1px solid #2a2a45" : "1px solid #e5e7eb",
      background: dark ? "#1e1e35" : "#fafafa",
      color: dark ? "#fff" : "#111",
      fontSize: "14px",
      marginBottom: "16px",
      outline: "none",
      boxSizing: "border-box",
      transition: "border 0.2s",
    },
    btn: {
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "none",
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      color: "white",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "4px",
      transition: "opacity 0.2s, transform 0.1s",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      margin: "24px 0",
    },
    divLine: {
      flex: 1,
      height: "1px",
      background: dark ? "#2a2a45" : "#e5e7eb",
    },
    divText: {
      fontSize: "12px",
      color: dark ? "#8b8ba7" : "#9ca3af",
      fontWeight: "500",
    },
    demoTitle: {
      fontSize: "13px",
      fontWeight: "600",
      color: dark ? "#8b8ba7" : "#6b7280",
      marginBottom: "12px",
      textAlign: "center",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    },
    demoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "8px",
    },
    error: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#dc2626",
      padding: "10px 14px",
      borderRadius: "8px",
      fontSize: "13px",
      marginBottom: "16px",
    },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Top bar */}
        <div style={s.topbar}>
          <div style={s.logo}>
            <div style={s.logoIcon}>⚡</div>
            <div>
              <div style={s.logoText}>AtomQuest</div>
              <div style={s.logoSub}>by Atomberg</div>
            </div>
          </div>
          <button style={s.toggle} onClick={() => setDark(d => !d)}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div style={s.heading}>Welcome back</div>
        <div style={s.sub}>Goal Setting & Tracking Portal</div>

        {error && <div style={s.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="you@company.com"
            value={email} onChange={e => setEmail(e.target.value)} required />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading && !loadingRole ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={s.divider}>
          <div style={s.divLine} />
          <span style={s.divText}>or try a demo account</span>
          <div style={s.divLine} />
        </div>

        <div style={s.demoTitle}>Demo accounts — click to sign in instantly</div>
        <div style={s.demoGrid}>
          {accounts.map(acc => (
            <button key={acc.role}
              onClick={() => handleSubmit(null, acc.email, acc.password, acc.role)}
              disabled={loading}
              style={{
                background: acc.bg,
                border: `1px solid ${acc.color}30`,
                borderRadius: "10px",
                padding: "10px 12px",
                cursor: "pointer",
                textAlign: "left",
                transition: "transform 0.1s, box-shadow 0.1s",
                opacity: loading && loadingRole !== acc.role ? 0.6 : 1,
              }}
            >
              <div style={{ fontSize: "16px", marginBottom: "3px" }}>{acc.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: acc.color }}>
                {loadingRole === acc.role ? "Signing in..." : acc.role}
              </div>
              <div style={{ fontSize: "11px", color: dark ? "#888" : "#9ca3af", marginTop: "2px" }}>
                {acc.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
