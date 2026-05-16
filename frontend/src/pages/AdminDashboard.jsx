import { useEffect, useState } from "react";
import { api } from "../utils/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [sharedGoals, setSharedGoals] = useState([]);
  const [tab, setTab] = useState("users");
  const [newCycle, setNewCycle] = useState({ name: "", start_date: "", end_date: "" });
  const [msg, setMsg] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Shared goal form state
  const [sgForm, setSgForm] = useState({
    cycle_id: "",
    thrust_area: "",
    title: "",
    description: "",
    uom: "numeric",
    annual_target: "",
    department: ""
  });

  useEffect(() => {
    api.get("/api/admin/users").then(setUsers);
    api.get("/api/admin/cycles").then(setCycles);
    api.get("/api/admin/audit").then(setAuditLogs);
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
      setMsg("✅ Cycle created");
      setNewCycle({ name: "", start_date: "", end_date: "" });
    } catch (err) { setMsg(`❌ ${err.message}`); }
  };

  const toggleCycle = async (id) => {
    const res = await api.patch(`/api/admin/cycles/${id}/toggle`);
    setCycles(prev => prev.map(c => c.id === id ? { ...c, is_active: res.is_active } : c));
  };

  const downloadCSV = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/report/csv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "achievement_report.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMsg("❌ Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const pushSharedGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/shared-goals/push", {
        ...sgForm,
        cycle_id: parseInt(sgForm.cycle_id),
        annual_target: parseFloat(sgForm.annual_target),
        department: sgForm.department || null
      });
      setMsg(`✅ ${res.message}`);
      api.get("/api/shared-goals/").then(setSharedGoals);
      setSgForm({ cycle_id: "", thrust_area: "", title: "", description: "", uom: "numeric", annual_target: "", department: "" });
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  };

  const tabs = ["users", "cycles", "reports", "shared goals", "audit"];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      {msg && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm">
          {msg}
          <button onClick={() => setMsg("")} className="ml-2 text-indigo-400 hover:text-indigo-600">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── USERS ── */}
      {tab === "users" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>{["Name", "Email", "Role", "Department"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 capitalize">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : u.role === "manager" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.department || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CYCLES ── */}
      {tab === "cycles" && (
        <div className="space-y-4">
          <form onSubmit={createCycle} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="font-semibold text-gray-700">Create New Cycle</h3>
            <div className="grid grid-cols-3 gap-3">
              <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Name (e.g. FY 2026-27)"
                value={newCycle.name} onChange={e => setNewCycle(p => ({ ...p, name: e.target.value }))} required />
              <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={newCycle.start_date} onChange={e => setNewCycle(p => ({ ...p, start_date: e.target.value }))} required />
              <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={newCycle.end_date} onChange={e => setNewCycle(p => ({ ...p, end_date: e.target.value }))} required />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
              Create Cycle
            </button>
          </form>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                {["Name", "Start", "End", "Status", "Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {cycles.map(c => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.start_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.end_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleCycle(c.id)} className="text-xs text-indigo-600 hover:underline">
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
        <div className="space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <p className="text-sm text-gray-500">Total Sheets</p>
                <p className="text-3xl font-bold text-indigo-600">{summary.total_sheets}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <p className="text-sm text-gray-500">Approved Sheets</p>
                <p className="text-3xl font-bold text-green-600">{summary.completed_sheets}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-3xl font-bold text-amber-600">{summary.completion_rate}%</p>
              </div>
            </div>
          )}

          {/* Download Button */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Achievement Report</h3>
              <p className="text-sm text-gray-500 mt-1">Full export: all employees, goals, targets, actuals and scores</p>
            </div>
            <button
              onClick={downloadCSV}
              disabled={downloading}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
            >
              {downloading ? "⏳ Downloading..." : "⬇ Download CSV"}
            </button>
          </div>

          {/* Charts */}
          {summary && (
            <div className="grid grid-cols-2 gap-6">
              {/* Status Pie Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Goal Sheet Status Distribution</h3>
                {summary.status_distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={summary.status_distribution}
                        cx="50%" cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {summary.status_distribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-10">No data yet</p>
                )}
              </div>

              {/* QoQ Line Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Quarter-on-Quarter Avg Score</h3>
                {summary.qoq_trends.some(q => q.avg_score > 0) ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={summary.qoq_trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis domain={[0, 150]} />
                      <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]} />
                      <Line type="monotone" dataKey="avg_score" stroke="#6366f1" strokeWidth={2} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-10">No check-in data yet</p>
                )}
              </div>

              {/* Dept Avg Score Bar Chart */}
              {summary.dept_avg_scores.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-4">Avg Score by Department</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={summary.dept_avg_scores}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dept" />
                      <YAxis domain={[0, 150]} />
                      <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]} />
                      <Bar dataKey="avg_score" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
        <div className="space-y-6">
          <form onSubmit={pushSharedGoal} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-700">Push Shared KPI to Employees</h3>
            <p className="text-xs text-gray-400">This will add this goal to all approved goal sheets of matching employees.</p>
            <div className="grid grid-cols-2 gap-3">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" required
                value={sgForm.cycle_id} onChange={e => setSgForm(p => ({ ...p, cycle_id: e.target.value }))}>
                <option value="">Select Cycle</option>
                {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Thrust Area (e.g. Quality)"
                value={sgForm.thrust_area} onChange={e => setSgForm(p => ({ ...p, thrust_area: e.target.value }))} required />
              <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm col-span-2" placeholder="Goal Title"
                value={sgForm.title} onChange={e => setSgForm(p => ({ ...p, title: e.target.value }))} required />
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" required
                value={sgForm.uom} onChange={e => setSgForm(p => ({ ...p, uom: e.target.value }))}>
                <option value="numeric">Numeric</option>
                <option value="percentage">Percentage (%)</option>
                <option value="timeline">Timeline</option>
                <option value="zero_based">Zero-based</option>
              </select>
              <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Annual Target"
                value={sgForm.annual_target} onChange={e => setSgForm(p => ({ ...p, annual_target: e.target.value }))} required />
              <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Department (leave blank for ALL)"
                value={sgForm.department} onChange={e => setSgForm(p => ({ ...p, department: e.target.value }))} />
              <textarea className="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Description (optional)" rows={2}
                value={sgForm.description} onChange={e => setSgForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              🚀 Push to Employees
            </button>
          </form>

          {/* History */}
          {sharedGoals.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700">Previously Pushed Goals</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  {["Title", "Thrust Area", "UoM", "Target", "Department", "Pushed By"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}</tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {sharedGoals.map(g => (
                    <tr key={g.id}>
                      <td className="px-4 py-3 font-medium">{g.title}</td>
                      <td className="px-4 py-3 text-gray-500">{g.thrust_area}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{g.uom}</td>
                      <td className="px-4 py-3">{g.annual_target}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{g.department}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{g.created_by}</td>
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              {["Time", "User", "Action", "Entity", "Detail"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">#{log.user_id}</td>
                  <td className="px-4 py-3 text-indigo-600">{log.action}</td>
                  <td className="px-4 py-3 text-gray-500">{log.entity_type} #{log.entity_id}</td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{log.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
