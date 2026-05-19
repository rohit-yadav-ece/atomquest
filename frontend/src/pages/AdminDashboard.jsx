import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../components/shared/Layout";
import { api } from "../utils/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from "recharts";

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f87171", "#8b5cf6"];
const TABS = [
  { id: "users",        label: "👥 Users" },
  { id: "cycles",       label: "🔄 Cycles" },
  { id: "reports",      label: "📊 Reports" },
  { id: "shared goals", label: "🚀 Shared Goals" },
  { id: "audit",        label: "📋 Audit" },
];

const ROLE_CONFIG = {
  admin:    { color: "#f59e0b", bg: "#f59e0b18", border: "#f59e0b33" },
  manager:  { color: "#0ea5e9", bg: "#0ea5e918", border: "#0ea5e933" },
  employee: { color: "#6366f1", bg: "#6366f118", border: "#6366f133" },
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [sharedGoals, setSharedGoals] = useState([]);
  const [tab, setTab] = useState("users");
  const [newCycle, setNewCycle] = useState({ name: "", start_date: "", end_date: "" });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [downloading, setDownloading] = useState(false);
  const [sgForm, setSgForm] = useState({ cycle_id: "", thrust_area: "", title: "", description: "", uom: "numeric", annual_target: "", department: "" });
  const { user } = useAuth();
  const { dark } = useTheme();

  const t = {
    text:        dark ? "#ffffff" : "#1e1b4b",
    muted:       dark ? "#555"    : "#9ca3af",
    subtext:     dark ? "#888"    : "#6b7280",
    card:        dark ? "#111"    : "#ffffff",
    cardBorder:  dark ? "#1e1e1e" : "#e8e5ff",
    innerBg:     dark ? "#0a0a0a" : "#f8f7ff",
    innerBorder: dark ? "#1a1a1a" : "#ede9ff",
    inputBg:     dark ? "#0a0a0a" : "#f9f9ff",
    inputBorder: dark ? "#2a2a2a" : "#e5e3ff",
    inputText:   dark ? "#ccc"    : "#1e1b4b",
    tableTh:     dark ? "#0a0a0a" : "#f8f7ff",
    tableRow:    dark ? "#111"    : "#ffffff",
    tableRowAlt: dark ? "#0d0d0d" : "#fafafa",
    divider:     dark ? "#1a1a1a" : "#ede9ff",
    chartGrid:   dark ? "#1e1e1e" : "#e5e7eb",
    chartText:   dark ? "#555"    : "#9ca3af",
  };

  const inputStyle = {
    background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 8,
    padding: "9px 12px", fontSize: 13, color: t.inputText, outline: "none",
    width: "100%", boxSizing: "border-box", fontFamily: "inherit",
  };

  const showMsg = (text, type = "success") => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(""), 4000); };

  useEffect(() => {
    api.get("/api/admin/users").then(setUsers).catch(() => {});
    api.get("/api/admin/cycles").then(setCycles).catch(() => {});
    api.get("/api/admin/audit").then(setAuditLogs).catch(() => {});
    api.get("/api/report/summary").then(setSummary).catch(() => {});
    api.get("/api/shared-goals/").then(setSharedGoals).catch(() => {});
  }, []);

  const createCycle = async (e) => {
    e.preventDefault();
    try {
      const c = await api.post("/api/admin/cycles", {
        ...newCycle,
        start_date: new Date(newCycle.start_date).toISOString(),
        end_date: new Date(newCycle.end_date).toISOString(),
      });
      setCycles(prev => [...prev, c]);
      showMsg("✅ Cycle created successfully");
      setNewCycle({ name: "", start_date: "", end_date: "" });
    } catch (err) { showMsg(`❌ ${err.message}`, "error"); }
  };

  const toggleCycle = async (id) => {
    const res = await api.patch(`/api/admin/cycles/${id}/toggle`);
    setCycles(prev => prev.map(c => c.id === id ? { ...c, is_active: res.is_active } : c));
  };

  const downloadCSV = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("aq_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/report/csv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "achievement_report.csv"; a.click();
      window.URL.revokeObjectURL(url);
      showMsg("✅ Report downloaded!");
    } catch { showMsg("❌ Download failed", "error"); }
    finally { setDownloading(false); }
  };

  const pushSharedGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/shared-goals/push", {
        ...sgForm, cycle_id: parseInt(sgForm.cycle_id),
        annual_target: parseFloat(sgForm.annual_target),
        department: sgForm.department || null
      });
      showMsg(`✅ ${res.message}`);
      api.get("/api/shared-goals/").then(setSharedGoals);
      setSgForm({ cycle_id: "", thrust_area: "", title: "", description: "", uom: "numeric", annual_target: "", department: "" });
    } catch (err) { showMsg(`❌ ${err.message}`, "error"); }
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: t.text, maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Admin View</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: t.text }}>Admin Dashboard</h1>
        <div style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>Welcome, {user?.name} · Full system access</div>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{
          marginBottom: 20, padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: msgType === "success" ? (dark ? "#001a0e" : "#f0fdf4") : (dark ? "#1a0a0a" : "#fef2f2"),
          border: `1px solid ${msgType === "success" ? "#10b981" : "#f87171"}44`,
          color: msgType === "success" ? "#10b981" : "#f87171",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          {msg}
          <button onClick={() => setMsg("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
              background: tab === tb.id ? "#6366f1" : t.card,
              color: tab === tb.id ? "#fff" : t.subtext,
              border: tab === tb.id ? "1px solid #6366f1" : `1px solid ${t.cardBorder}`,
            }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* ── USERS ── */}
      {tab === "users" && (
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${t.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: t.text }}>{users.length} Users</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: t.tableTh }}>
                {["Name", "Email", "Role", "Department"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 20px", color: t.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.employee;
                return (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? t.tableRow : t.tableRowAlt, borderBottom: `1px solid ${t.divider}` }}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: rc.bg, border: `1px solid ${rc.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: rc.color, flexShrink: 0 }}>
                          {u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: t.text }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", color: t.muted }}>{u.email}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, textTransform: "capitalize" }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "14px 20px", color: t.muted }}>{u.department || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CYCLES ── */}
      {tab === "cycles" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontWeight: 600, color: t.text, marginBottom: 4 }}>Create New Cycle</div>
            <div style={{ fontSize: 12, color: t.muted, marginBottom: 16 }}>Add a new goal cycle for the organization</div>
            <form onSubmit={createCycle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                <input style={inputStyle} placeholder="Name (e.g. FY 2026-27)" value={newCycle.name} onChange={e => setNewCycle(p => ({ ...p, name: e.target.value }))} required />
                <input type="date" style={inputStyle} value={newCycle.start_date} onChange={e => setNewCycle(p => ({ ...p, start_date: e.target.value }))} required />
                <input type="date" style={inputStyle} value={newCycle.end_date} onChange={e => setNewCycle(p => ({ ...p, end_date: e.target.value }))} required />
              </div>
              <button type="submit" style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                + Create Cycle
              </button>
            </form>
          </div>
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: t.tableTh }}>
                  {["Cycle Name", "Start", "End", "Status", "Action"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 20px", color: t.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cycles.map((c, i) => (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? t.tableRow : t.tableRowAlt, borderBottom: `1px solid ${t.divider}` }}>
                    <td style={{ padding: "14px 20px", fontWeight: 600, color: t.text }}>{c.name}</td>
                    <td style={{ padding: "14px 20px", color: t.muted }}>{new Date(c.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td style={{ padding: "14px 20px", color: t.muted }}>{new Date(c.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: c.is_active ? (dark ? "#001a0e" : "#f0fdf4") : t.innerBg, color: c.is_active ? "#10b981" : t.muted, border: `1px solid ${c.is_active ? "#10b98133" : t.cardBorder}` }}>
                        {c.is_active ? "● Active" : "○ Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <button onClick={() => toggleCycle(c.id)}
                        style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 500, textDecoration: "underline" }}>
                        {c.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── REPORTS ── */}
      {tab === "reports" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {summary && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "Total Sheets", value: summary.total_sheets, color: "#6366f1" },
                { label: "Approved Sheets", value: summary.completed_sheets, color: "#10b981" },
                { label: "Completion Rate", value: `${summary.completion_rate}%`, color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "20px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: t.muted, marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600, color: t.text, marginBottom: 4 }}>Achievement Report</div>
              <div style={{ fontSize: 12, color: t.muted }}>Full export: all employees, goals, targets, actuals and scores</div>
            </div>
            <button onClick={downloadCSV} disabled={downloading}
              style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: downloading ? 0.6 : 1, whiteSpace: "nowrap" }}>
              {downloading ? "⏳ Downloading..." : "⬇ Download CSV"}
            </button>
          </div>

          {summary && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "20px 24px" }}>
                <div style={{ fontWeight: 600, color: t.text, marginBottom: 16 }}>Goal Sheet Status</div>
                {summary.status_distribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={summary.status_distribution} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {summary.status_distribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: dark ? "#111" : "#fff", border: `1px solid ${t.cardBorder}`, borderRadius: 8, color: t.text }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div style={{ textAlign: "center", color: t.muted, padding: "40px 0", fontSize: 13 }}>No data yet</div>}
              </div>

              <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "20px 24px" }}>
                <div style={{ fontWeight: 600, color: t.text, marginBottom: 16 }}>Quarter-on-Quarter Score</div>
                {summary.qoq_trends?.some(q => q.avg_score > 0) ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={summary.qoq_trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                      <XAxis dataKey="quarter" tick={{ fill: t.chartText, fontSize: 12 }} axisLine={{ stroke: t.chartGrid }} />
                      <YAxis domain={[0, 150]} tick={{ fill: t.chartText, fontSize: 12 }} axisLine={{ stroke: t.chartGrid }} />
                      <Tooltip contentStyle={{ background: dark ? "#111" : "#fff", border: `1px solid ${t.cardBorder}`, borderRadius: 8, color: t.text }} formatter={v => [`${v}%`, "Avg Score"]} />
                      <Line type="monotone" dataKey="avg_score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5, fill: "#6366f1" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div style={{ textAlign: "center", color: t.muted, padding: "40px 0", fontSize: 13 }}>No check-in data yet</div>}
              </div>

              {summary.dept_avg_scores?.length > 0 && (
                <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "20px 24px", gridColumn: "span 2" }}>
                  <div style={{ fontWeight: 600, color: t.text, marginBottom: 16 }}>Avg Score by Department</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={summary.dept_avg_scores}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                      <XAxis dataKey="dept" tick={{ fill: t.chartText, fontSize: 12 }} axisLine={{ stroke: t.chartGrid }} />
                      <YAxis domain={[0, 150]} tick={{ fill: t.chartText, fontSize: 12 }} axisLine={{ stroke: t.chartGrid }} />
                      <Tooltip contentStyle={{ background: dark ? "#111" : "#fff", border: `1px solid ${t.cardBorder}`, borderRadius: 8, color: t.text }} formatter={v => [`${v}%`, "Avg Score"]} />
                      <Bar dataKey="avg_score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SHARED GOALS ── */}
      {tab === "shared goals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontWeight: 600, color: t.text, marginBottom: 4 }}>🚀 Push Shared KPI to Employees</div>
            <div style={{ fontSize: 12, color: t.muted, marginBottom: 20 }}>This will add this goal to all approved goal sheets of matching employees.</div>
            <form onSubmit={pushSharedGoal}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <select style={inputStyle} required value={sgForm.cycle_id} onChange={e => setSgForm(p => ({ ...p, cycle_id: e.target.value }))}>
                  <option value="">Select Cycle</option>
                  {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input style={inputStyle} placeholder="Thrust Area (e.g. Quality)" value={sgForm.thrust_area} onChange={e => setSgForm(p => ({ ...p, thrust_area: e.target.value }))} required />
                <input style={{ ...inputStyle, gridColumn: "span 2" }} placeholder="Goal Title" value={sgForm.title} onChange={e => setSgForm(p => ({ ...p, title: e.target.value }))} required />
                <select style={inputStyle} value={sgForm.uom} onChange={e => setSgForm(p => ({ ...p, uom: e.target.value }))}>
                  <option value="numeric">Numeric</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="timeline">Timeline</option>
                  <option value="zero_based">Zero-based</option>
                </select>
                <input type="number" style={inputStyle} placeholder="Annual Target" value={sgForm.annual_target} onChange={e => setSgForm(p => ({ ...p, annual_target: e.target.value }))} required />
                <input style={inputStyle} placeholder="Department (leave blank for ALL)" value={sgForm.department} onChange={e => setSgForm(p => ({ ...p, department: e.target.value }))} />
                <textarea style={{ ...inputStyle, resize: "vertical" }} placeholder="Description (optional)" rows={2} value={sgForm.description} onChange={e => setSgForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <button type="submit" style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                🚀 Push to Employees
              </button>
            </form>
          </div>

          {sharedGoals.length > 0 && (
            <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${t.divider}`, fontWeight: 600, color: t.text }}>
                Previously Pushed Goals ({sharedGoals.length})
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: t.tableTh }}>
                    {["Title", "Thrust Area", "UoM", "Target", "Department"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 20px", color: t.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sharedGoals.map((g, i) => (
                    <tr key={g.id} style={{ background: i % 2 === 0 ? t.tableRow : t.tableRowAlt, borderBottom: `1px solid ${t.divider}` }}>
                      <td style={{ padding: "14px 20px", fontWeight: 600, color: t.text }}>{g.title}</td>
                      <td style={{ padding: "14px 20px", color: t.muted }}>{g.thrust_area}</td>
                      <td style={{ padding: "14px 20px", color: t.muted, textTransform: "capitalize" }}>{g.uom}</td>
                      <td style={{ padding: "14px 20px", color: t.text, fontWeight: 600 }}>{g.annual_target}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: dark ? "#0ea5e918" : "#e0f2fe", color: "#0ea5e9", border: "1px solid #0ea5e933" }}>
                          {g.department || "All Depts"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── AUDIT ── */}
      {tab === "audit" && (
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${t.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: t.text }}>Audit Trail</span>
            <span style={{ fontSize: 12, color: t.muted }}>{auditLogs.length} entries</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: t.tableTh }}>
                {["Time", "User", "Action", "Entity", "Detail"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 20px", color: t.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, i) => (
                <tr key={log.id} style={{ background: i % 2 === 0 ? t.tableRow : t.tableRowAlt, borderBottom: `1px solid ${t.divider}` }}>
                  <td style={{ padding: "12px 20px", color: t.muted, fontSize: 11, whiteSpace: "nowrap" }}>{new Date(log.timestamp).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px 20px", color: t.text, fontWeight: 500 }}>#{log.user_id}</td>
                  <td style={{ padding: "12px 20px" }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: dark ? "#6366f118" : "#eef2ff", color: "#6366f1", border: "1px solid #6366f133", fontWeight: 600 }}>{log.action}</span>
                  </td>
                  <td style={{ padding: "12px 20px", color: t.muted }}>{log.entity_type} #{log.entity_id}</td>
                  <td style={{ padding: "12px 20px", color: t.muted, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
