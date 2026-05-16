import { useEffect, useState } from "react";
import { api } from "../utils/api";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tab, setTab] = useState("users");
  const [newCycle, setNewCycle] = useState({ name: "", start_date: "", end_date: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/api/admin/users").then(setUsers);
    api.get("/api/admin/cycles").then(setCycles);
    api.get("/api/admin/audit").then(setAuditLogs);
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      {msg && <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm">{msg}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["users", "cycles", "audit"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Users */}
      {tab === "users" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {["Name", "Email", "Role", "Department"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 capitalize">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
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

      {/* Cycles */}
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
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {cycles.map(c => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.start_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.end_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
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

      {/* Audit */}
      {tab === "audit" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              {["Time", "User", "Action", "Entity", "Detail"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr></thead>
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
