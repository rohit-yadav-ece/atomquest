import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const DEMO_ACCOUNTS = [
  { role: "Employee", email: "emp1@atomquest.com", password: "emp123", desc: "Create goals, log check-ins", color: "#6366f1", bg: "#eef2ff", darkBg: "#1e1b4b", icon: "👤" },
  { role: "Employee 2", email: "emp2@atomquest.com", password: "emp123", desc: "Second employee account", color: "#8b5cf6", bg: "#f5f3ff", darkBg: "#2e1065", icon: "👤" },
  { role: "Manager", email: "manager@atomquest.com", password: "manager123", desc: "Approve goals, check-ins", color: "#0ea5e9", bg: "#f0f9ff", darkBg: "#0c4a6e", icon: "👔" },
  { role: "Admin", email: "admin@atomquest.com", password: "admin123", desc: "Manage cycles, analytics", color: "#10b981", bg: "#f0fdf4", darkBg: "#064e3b", icon: "⚙️" },
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

  const bg = dark ? "#0f0f18" : "#f8f7ff";
  const card = dark ? "#16162a" : "#ffffff";
  const border = dark ? "#2a2a45" : "#e8e5ff";
  const text = dark ? "#ffffff" : "#1e1b4b";
  const muted = dark ? "#8b8ba7" : "#9ca3af";
  const inputBg = dark ? "#1e1e35" : "#fafafa";
  const inputBorder = dark ? "#2a2a45" : "#e5e7eb";
  const dividerLine = dark ? "#2a2a45" : "#e5e7eb";

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', -apple-system, sans-serif", padding: "20px", transition: "background 0.3s" }}>
      <div style={{ background: card, borderRadius: "20px", border: `1px solid ${border}`, padding: "40px", width: "100%", maxWidth: "440px", boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(99,102,241,0.08)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="https://images.seeklogo.com/logo-png/52/1/atomberg-logo-png_seeklogo-529953.png"
              alt="Atomberg"
              style={{ width: "40px", height: "40px", objectFit: "contain" }}
            />
            <div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: text, letterSpacing: "-0.5px" }}>AtomQuest</div>
              <div style={{ fontSize: "11px", color: dark ? "#818cf8" : "#6366f1", marginTop: "1px" }}>Goal Setting & Tracking Portal · by Atomberg</div>
            </div>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            style={{ background: dark ? "#2a2a45" : "#f0eeff", border: "none", borderRadius: "20px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", color: dark ? "#a5b4fc" : "#6366f1", fontWeight: "500" }}
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Title */}
        <div style={{ fontSize: "24px", fontWeight: "700", color: text, marginBottom: "4px" }}>Welcome back</div>
        <div style={{ fontSize: "14px", color: muted, marginBottom: "28px" }}>Sign in to your account to continue</div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: dark ? "#a5b4fc" : "#374151", marginBottom: "6px", display: "block" }}>Email address</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: `1px solid ${inputBorder}`, background: inputBg, color: text, fontSize: "14px", marginBottom: "16px", outline: "none", boxSizing: "border-box" }}
          />
          <label style={{ fontSize: "13px", fontWeight: "500", color: dark ? "#a5b4fc" : "#374151", marginBottom: "6px", display: "block" }}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: `1px solid ${inputBorder}`, background: inputBg, color: text, fontSize: "14px", marginBottom: "20px", outline: "none", boxSizing: "border-box" }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontSize: "15px", fontWeight: "600", cursor: "pointer", opacity: loading && !loadingRole ? 0.7 : 1 }}
          >
            {loading && !loadingRole ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", background: dividerLine }} />
          <span style={{ fontSize: "12px", color: muted, fontWeight: "500" }}>or try a demo account</span>
          <div style={{ flex: 1, height: "1px", background: dividerLine }} />
        </div>

        <div style={{ fontSize: "11px", fontWeight: "600", color: muted, marginBottom: "12px", textAlign: "center", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Demo accounts — click to sign in instantly
        </div>

        {/* Demo buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.role}
              onClick={() => handleSubmit(null, acc.email, acc.password, acc.role)}
              disabled={loading}
              style={{
                background: dark ? acc.darkBg : acc.bg,
                border: `1px solid ${acc.color}40`,
                borderRadius: "10px",
                padding: "12px",
                cursor: "pointer",
                textAlign: "left",
                opacity: loading && loadingRole !== acc.role ? 0.5 : 1,
                transition: "transform 0.1s",
              }}
            >
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>{acc.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: acc.color }}>
                {loadingRole === acc.role ? "Signing in..." : acc.role}
              </div>
              <div style={{ fontSize: "11px", color: muted, marginTop: "2px" }}>{acc.desc}</div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

