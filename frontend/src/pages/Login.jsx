import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const DEMO_ACCOUNTS = [
  { role: "Employee", email: "emp1@atomquest.com", password: "emp123", desc: "Create goals, log quarterly check-ins", color: "#6366f1", lightBg: "#eef2ff", darkBg: "#18181f" },
  { role: "Employee 2", email: "emp2@atomquest.com", password: "emp123", desc: "Second employee with shared goals", color: "#8b5cf6", lightBg: "#f5f3ff", darkBg: "#18181f" },
  { role: "Manager", email: "manager@atomquest.com", password: "manager123", desc: "Approve goals, conduct check-ins", color: "#0ea5e9", lightBg: "#f0f9ff", darkBg: "#18181f" },
  { role: "Admin", email: "admin@atomquest.com", password: "admin123", desc: "Manage cycles, reports, analytics", color: "#f59e0b", lightBg: "#fffbeb", darkBg: "#18181f" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState("");
  const [dark, setDark] = useState(() => localStorage.getItem("aq_theme") !== "light");
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
      setError("Invalid credentials. If first visit, backend may be waking up (30s) — try again!");
    } finally {
      setLoading(false);
      setLoadingRole("");
    }
  };

  const d = dark;
  const pageBg    = d ? "#000000" : "#f4f3ff";
  const cardBg    = d ? "#111111" : "#ffffff";
  const cardBorder= d ? "#222222" : "#e8e5ff";
  const demoBg    = d ? "#0a0a0a" : "#f8f7ff";
  const demoBorder= d ? "#1e1e1e" : "#e8e5ff";
  const textMain  = d ? "#ffffff" : "#1e1b4b";
  const textMuted = d ? "#555555" : "#9ca3af";
  const textLabel = d ? "#888888" : "#4b5563";
  const inputBg   = d ? "#1a1a1a" : "#f9f9ff";
  const inputBorder=d ? "#2a2a2a" : "#e5e3ff";
  const divLine   = d ? "#1e1e1e" : "#e8e5ff";

  return (
    <div style={{ minHeight:"100vh", background:pageBg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',-apple-system,sans-serif", padding:"16px", position:"relative", transition:"background 0.3s" }}>

      {/* Toggle — fixed top right */}
      <button onClick={() => setDark(d => !d)}
        style={{ position:"fixed", top:"16px", right:"16px", background:d?"#1a1a1a":"#ede9ff", border:`1px solid ${d?"#2a2a2a":"#d4d0ff"}`, borderRadius:"20px", padding:"7px 16px", cursor:"pointer", fontSize:"12px", color:d?"#888":"#6366f1", fontWeight:"500", zIndex:1000 }}>
        {d ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* Login card */}
      <div style={{ background:cardBg, borderRadius:"16px", border:`1px solid ${cardBorder}`, padding:"28px 32px", width:"100%", maxWidth:"420px", boxShadow:d?"0 0 0 1px #1a1a1a":"0 20px 60px rgba(99,102,241,0.1)", marginBottom:"12px" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px" }}>
          <img src="https://images.seeklogo.com/logo-png/52/1/atomberg-logo-png_seeklogo-529953.png" alt="Atomberg"
            style={{ width:"38px", height:"38px", objectFit:"contain", borderRadius:"8px" }} />
          <div>
            <div style={{ fontSize:"20px", fontWeight:"700", color:textMain, letterSpacing:"-0.5px" }}>AtomQuest</div>
            <div style={{ fontSize:"11px", color:d?"#555":"#6366f1" }}>Goal Setting and Tracking Portal · by Atomberg</div>
          </div>
        </div>

        {error && (
          <div style={{ background:"#1a0a0a", border:"1px solid #3a1a1a", color:"#f87171", padding:"9px 12px", borderRadius:"8px", fontSize:"12px", marginBottom:"14px" }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom:"12px" }}>
          <label style={{ display:"block", fontSize:"13px", fontWeight:"500", color:textLabel, marginBottom:"5px" }}>Email</label>
          <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width:"100%", padding:"10px 12px", borderRadius:"8px", border:`1px solid ${inputBorder}`, background:inputBg, color:textMain, fontSize:"14px", outline:"none", boxSizing:"border-box" }} />
        </div>

        <div style={{ marginBottom:"18px" }}>
          <label style={{ display:"block", fontSize:"13px", fontWeight:"500", color:textLabel, marginBottom:"5px" }}>Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width:"100%", padding:"10px 12px", borderRadius:"8px", border:`1px solid ${inputBorder}`, background:inputBg, color:textMain, fontSize:"14px", outline:"none", boxSizing:"border-box" }} />
        </div>

        <button onClick={() => handleLogin()} disabled={loading}
          style={{ width:"100%", padding:"11px", borderRadius:"8px", border:"none", background:"#6366f1", color:"white", fontSize:"15px", fontWeight:"600", cursor:"pointer", opacity:loading && !loadingRole ? 0.7 : 1 }}>
          {loading && !loadingRole ? "Signing in..." : "Sign in"}
        </button>
      </div>

      {/* Demo accounts card */}
      <div style={{ background:demoBg, borderRadius:"16px", border:`1px solid ${demoBorder}`, padding:"20px 24px", width:"100%", maxWidth:"420px" }}>
        <div style={{ fontSize:"11px", fontWeight:"600", color:textMuted, marginBottom:"14px", letterSpacing:"0.08em", textTransform:"uppercase" }}>
          Demo accounts — click to sign in instantly
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
          {DEMO_ACCOUNTS.map(acc => (
            <button key={acc.role} onClick={() => handleLogin(acc.email, acc.password, acc.role)} disabled={loading}
              style={{ background:d ? acc.darkBg : acc.lightBg, border:`1px solid ${d ? "#2a2a2a" : acc.color+"40"}`, borderRadius:"10px", padding:"12px", cursor:"pointer", textAlign:"left", opacity:loading && loadingRole !== acc.role ? 0.4 : 1, transition:"opacity 0.2s" }}>
              <div style={{ fontSize:"13px", fontWeight:"600", color:acc.color, marginBottom:"3px" }}>
                {loadingRole === acc.role ? "Signing in..." : acc.role}
              </div>
              <div style={{ fontSize:"11px", color:textMuted, lineHeight:"1.4" }}>{acc.desc}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}


