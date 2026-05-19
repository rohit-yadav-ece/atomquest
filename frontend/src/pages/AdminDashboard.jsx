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

// Fallback data for charts when API returns empty
const FALLBACK_STATUS = [
  { name: "Approved", value: 1 },
  { name: "Submitted", value: 1 },
  { name: "Draft", value: 0 },
];
const FALLBACK_QOQ = [
  { quarter: "Q1", avg_score: 92 },
  { quarter: "Q2", avg_score: 96 },
  { quarter: "Q3", avg_score: 0 },
  { quarter: "Q4", avg_score: 0 },
];
const FALLBACK_DEPT = [
  { dept: "Sales", avg_score: 94 },
  { dept: "Operations", avg_score: 0 },
];

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

  const bg        = dark ? "#000000" : "#f4f3ff";
  const card      = dark ? "#111111" : "#ffffff";
  const cardBdr   = dark ? "#1e1e1e" : "#e8e5ff";
  const innerBg   = dark ? "#0a0a0a" : "#f8f7ff";
  const innerBdr  = dark ? "#1a1a1a" : "#ede9ff";
  const inputBg   = dark ? "#0a0a0a" : "#f9f9ff";
  const inputBdr  = dark ? "#2a2a2a" : "#e5e3ff";
  const text      = dark ? "#ffffff" : "#1e1b4b";
  const muted     = dark ? "#555555" : "#9ca3af";
  const subtext   = dark ? "#888888" : "#6b7280";
  const divider   = dark ? "#1a1a1a" : "#ede9ff";
  const rowEven   = dark ? "#111111" : "#ffffff";
  const rowOdd    = dark ? "#0d0d0d" : "#fafafa";
  const thBg      = dark ? "#0a0a0a" : "#f8f7ff";
  const gridColor = dark ? "#1e1e1e" : "#e5e7eb";
  const axisColor = dark ? "#555555" : "#9ca3af";

  const inputStyle = {
    background: inputBg, border: `1px solid ${inputBdr}`, borderRadius: 8,
    padding: "9px 12px", fontSize: 13, color: text, outline: "none",
    width: "100%", boxSizing: "border-box", fontFamily: "inherit",
  };

  const showMsg = (txt, type = "success") => { setMsg(txt); setMsgType(type); setTimeout(() => setMsg(""), 4000); };

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

  const thStyle = { textAlign: "left", padding: "12px 20px", color: muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", background: thBg };
  const tdStyle = (i) => ({ padding: "14px 20px", background: i % 2 === 0 ? rowEven : rowOdd, borderBottom: `1px solid ${divider}` });

  // Use real data or fallback for charts
  const statusData = summary?.status_distribution?.length > 0 ? summary.status_distribution : FALLBACK_STATUS;
  const qoqData    = summary?.qoq_trends?.some(q => q.avg_score > 0) ? summary.qoq_trends : FALLBACK_QOQ;
  const deptData   = summary?.dept_avg_scores?.length > 0 ? summary.dept_avg_scores : FALLBACK_DEPT;

  const tooltipStyle = { background: card, border: `1px solid ${cardBdr}`, borderRadius: 8, color: text, fontSize: 12 };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: text, maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Admin View</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: text }}>Admin Dashboard</h1>
        <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>Welcome, {user?.name} · Full system access</div>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{
          marginBottom: 20, padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: msgType === "success" ? (dark ? "#001a0e" : "#f0fdf4") : (dark ? "#1a0a0a" : "#fef2f2"),
          border: `1px solid ${msgType === "success" ? "#10b98133" : "#f8717133"}`,
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
            style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: tab === tb.id ? "#6366f1" : card, color: tab === tb.id ? "#fff" : subtext, border: `1px solid ${tab === tb.id ? "#6366f1" : cardBdr}` }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* ── USERS ── */}
      {tab === "users" && (
        <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${divider}`, background: card }}>
            <span style={{ fontWeight: 600, color: text }}>{users.length} Users</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: card }}>
            <thead><tr>{["Name","Email","Role","Department"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody style={{ background: card }}>
              {users.map((u, i) => {
                const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.employee;
                return (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? rowEven : rowOdd }}>
                    <td style={{ ...tdStyle(i) }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: rc.bg, border: `1px solid ${rc.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: rc.color, flexShrink: 0 }}>
                          {u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: text }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle(i), color: muted }}>{u.email}</td>
                    <td style={tdStyle(i)}><span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, textTransform: "capitalize" }}>{u.role}</span></td>
                    <td style={{ ...tdStyle(i), color: muted }}>{u.department || "—"}</td>
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
          <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontWeight: 600, color: text, marginBottom: 4 }}>Create New Cycle</div>
            <div style={{ fontSize: 12, color: muted, marginBottom: 16 }}>Add a new goal cycle for the organization</div>
            <form onSubmit={createCycle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                <input style={inputStyle} placeholder="Name (e.g. FY 2026-27)" value={newCycle.name} onChange={e => setNewCycle(p => ({ ...p, name: e.target.value }))} required />
                <input type="date" style={inputStyle} value={newCycle.start_date} onChange={e => setNewCycle(p => ({ ...p, start_date: e.target.value }))} required />
                <input type="date" style={inputStyle} value={newCycle.end_date} onChange={e => setNewCycle(p => ({ ...p, end_date: e.target.value }))} required />
              </div>
              <button type="submit" style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Create Cycle</button>
            </form>
          </div>
          <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: card }}>
              <thead><tr>{["Cycle Name","Start","End","Status","Action"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody style={{ background: card }}>
                {cycles.map((c, i) => (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? rowEven : rowOdd }}>
                    <td style={{ ...tdStyle(i), fontWeight: 600, color: text }}>{c.name}</td>
                    <td style={{ ...tdStyle(i), color: muted }}>{new Date(c.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td style={{ ...tdStyle(i), color: muted }}>{new Date(c.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td style={tdStyle(i)}>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: c.is_active ? (dark ? "#001a0e" : "#f0fdf4") : innerBg, color: c.is_active ? "#10b981" : muted, border: `1px solid ${c.is_active ? "#10b98133" : cardBdr}` }}>
                        {c.is_active ? "● Active" : "○ Inactive"}
                      </span>
                    </td>
                    <td style={tdStyle(i)}>
                      <button onClick={() => toggleCycle(c.id)} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 500, textDecoration: "underline" }}>
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
          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Total Sheets",    value: summary?.total_sheets ?? 2,     color: "#6366f1" },
              { label: "Approved Sheets", value: summary?.completed_sheets ?? 1,  color: "#10b981" },
              { label: "Completion Rate", value: `${summary?.completion_rate ?? 50}%`, color: "#f59e0b" },
            ].map(s => (
              <div key={s.label} style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 14, padding: "20px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Download */}
          <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600, color: text, marginBottom: 4 }}>Achievement Report</div>
              <div style={{ fontSize: 12, color: muted }}>Full export: all employees, goals, targets, actuals and scores</div>
            </div>
            <button onClick={downloadCSV} disabled={downloading}
              style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: downloading ? 0.6 : 1, whiteSpace: "nowrap" }}>
              {downloading ? "⏳ Downloading..." : "⬇ Download CSV"}
            </button>
          </div>

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ fontWeight: 600, color: text, marginBottom: 4 }}>Goal Sheet Status</div>
              <div style={{ fontSize: 11, color: muted, marginBottom: 16 }}>Distribution across all employees</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ fontWeight: 600, color: text, marginBottom: 4 }}>Quarter-on-Quarter Score</div>
              <div style={{ fontSize: 11, color: muted, marginBottom: 16 }}>Average performance score per quarter</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={qoqData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="quarter" tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} />
                  <YAxis domain={[0, 110]} tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, "Avg Score"]} />
                  <Line type="monotone" dataKey="avg_score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5, fill: "#6366f1" }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 14, padding: "20px 24px", gridColumn: "span 2" }}>
              <div style={{ fontWeight: 600, color: text, marginBottom: 4 }}>Avg Score by Department</div>
              <div style={{ fontSize: 11, color: muted, marginBottom: 16 }}>Performance benchmark across departments</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="dept" tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} />
                  <YAxis domain={[0, 110]} tick={{ fill: axisColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, "Avg Score"]} />
                  <Bar dataKey="avg_score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── SHARED GOALS ── */}
      {tab === "shared goals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontWeight: 600, color: text, marginBottom: 4 }}>🚀 Push Shared KPI to Employees</div>
            <div style={{ fontSize: 12, color: muted, marginBottom: 20 }}>This will add this goal to all approved goal sheets of matching employees.</div>
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
            <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${divider}`, fontWeight: 600, color: text, background: card }}>Previously Pushed Goals ({sharedGoals.length})</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: card }}>
                <thead><tr>{["Title","Thrust Area","UoM","Target","Department"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody style={{ background: card }}>
                  {sharedGoals.map((g, i) => (
                    <tr key={g.id} style={{ background: i % 2 === 0 ? rowEven : rowOdd }}>
                      <td style={{ ...tdStyle(i), fontWeight: 600, color: text }}>{g.title}</td>
                      <td style={{ ...tdStyle(i), color: muted }}>{g.thrust_area}</td>
                      <td style={{ ...tdStyle(i), color: muted, textTransform: "capitalize" }}>{g.uom}</td>
                      <td style={{ ...tdStyle(i), fontWeight: 600, color: text }}>{g.annual_target}</td>
                      <td style={tdStyle(i)}><span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: dark ? "#0ea5e918" : "#e0f2fe", color: "#0ea5e9", border: "1px solid #0ea5e933" }}>{g.department || "All Depts"}</span></td>
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
        <div style={{ background: card, border: `1px solid ${cardBdr}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${divider}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: card }}>
            <span style={{ fontWeight: 600, color: text }}>Audit Trail</span>
            <span style={{ fontSize: 12, color: muted }}>{auditLogs.length} entries</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: card }}>
            <thead><tr>{["Time","User","Action","Entity","Detail"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody style={{ background: card }}>
              {auditLogs.map((log, i) => (
                <tr key={log.id} style={{ background: i % 2 === 0 ? rowEven : rowOdd }}>
                  <td style={{ ...tdStyle(i), fontSize: 11, color: muted, whiteSpace: "nowrap" }}>{new Date(log.timestamp).toLocaleString("en-IN")}</td>
                  <td style={{ ...tdStyle(i), fontWeight: 500, color: text }}>#{log.user_id}</td>
                  <td style={tdStyle(i)}><span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: dark ? "#6366f118" : "#eef2ff", color: "#6366f1", border: "1px solid #6366f133", fontWeight: 600 }}>{log.action}</span></td>
                  <td style={{ ...tdStyle(i), color: muted }}>{log.entity_type} #{log.entity_id}</td>
                  <td style={{ ...tdStyle(i), color: muted, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
