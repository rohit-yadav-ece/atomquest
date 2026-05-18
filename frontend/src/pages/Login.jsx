import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const DEMO_ACCOUNTS = [
  { role: "Employee", email: "emp1@atomquest.com", password: "emp123", desc: "Create goals, log quarterly check-ins", color: "#6366f1", lightBg: "#eef2ff", darkBg: "#1e1b4b" },
  { role: "Employee 2", email: "emp2@atomquest.com", password: "emp123", desc: "Second employee with shared goals", color: "#8b5cf6", lightBg: "#f5f3ff", darkBg: "#2e1065" },
  { role: "Manager", email: "manager@atomquest.com", password: "manager123", desc: "Approve goals, conduct check-ins", color: "#0ea5e9", lightBg: "#f0f9ff", darkBg: "#0c4a6e" },
  { role: "Admin", email: "admin@atomquest.com", password: "admin123", desc: "Manage cycles, reports, analytics", color: "#f59e0b", lightBg: "#fffbeb", darkBg: "#451a03" },
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
      setError("Invalid credentials. If first load, backend may be waking up (30s). Try again!");
    } finally {
      setLoading(false);
      setLoadingRole("");
    }
  };

  const d = dark;
  const pageBg = d ? "#0a0a14" : "#f4f3ff";
  const cardBg = d ? "#13131f" : "#ffffff";
  const cardBorder = d ? "#1e1e30" : "#e8e5ff";
  const textPrimary = d ? "#f0f0ff" : "#1e1b4b";
  const textMuted = d ? "#6b6b8a" : "#9ca3af";
  const inputBg = d ? "#1a1a2e" : "#f9f9ff";
  const inputBorder = d ? "#2a2a40" : "#e5e3ff";
  const labelColor = d ? "#9090c0" : "#4b5563";
  const dividerColor = d ? "#1e1e30" : "#e8e5ff";

  return (
    <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',-apple-system,sans-serif", padding: "16px", position: "relative" }}>

      {/* Dark/Light toggle — fixed top right */}
      <button
        onClick={() => setDark(d => !d)}
        style={{ position: "fixed", top: "16px", right: "16px", background: d ? "#1e1e30" : "#ede9ff", border: "none", borderRadius: "20px", padding: "8px 16px", cursor: "pointer", fontSize: "13px", color: d ? "#a5b4fc" : "#6366f1", fontWeight: "500", zIndex: 1000 }}
      >
        {d ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* Main card */}
      <div style={{ background: cardBg, borderRadius: "16px", border: `1px solid ${cardBorder}`, padding: "28px 32px", width: "100%", maxWidth: "420px", boxShadow: d ? "0 24px 60px rgba(0,0,0,0.6)" : "0 20px 60px rgba(99,102,241,0.1)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <img src="https://images.seeklogo.com/logo-png/52/1/atomberg-logo-png_seeklogo-529953.png" alt="Atomberg" style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "8px" }} />
          <div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: textPrimary, letterSpacing: "-0.4px" }}>AtomQuest</div>
            <div style={{ fontSize: "11px", color: d ? "#6366f1" : "#6366f1" }}>Goal Setting and Tracking Portal · by Atomberg</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "9px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "14px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: labelColor, marginBottom: "5px" }}>Email</label>
          <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: labelColor, marginBottom: "5px" }}>Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Sign in button */}
        <button onClick={() => handleLogin()} disabled={loading}
          style={{ width: "100%", padding: "11px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: "15px", fontWeight: "600", cursor: "pointer", opacity: loading && !loadingRole ? 0.7 : 1, marginBottom: "20px" }}>
          {loading && !loadingRole ? "Signing in..." : "Sign in"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <div style={{ flex: 1, height: "1px", background: dividerColor }} />
          <span style={{ fontSize: "11px", color: textMuted, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.07em" }}>Demo accounts — click to sign in instantly</span>
          <div style={{ flex: 1, height: "1px", background: dividerColor }} />
        </div>

        {/* Demo buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {DEMO_ACCOUNTS.map(acc => (
            <button key={acc.role} onClick={() => handleLogin(acc.email, acc.password, acc.role)} disabled={loading}
              style={{ background: d ? acc.darkBg : acc.lightBg, border: `1px solid ${acc.color}50`, borderRadius: "10px", padding: "10px 12px", cursor: "pointer", textAlign: "left", opacity: loading && loadingRole !== acc.role ? 0.5 : 1 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: acc.color, marginBottom: "3px" }}>
                {loadingRole === acc.role ? "Signing in..." : acc.role}
              </div>
              <div style={{ fontSize: "11px", color: textMuted, lineHeight: "1.4" }}>{acc.desc}</div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

